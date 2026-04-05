import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase';
import { withAuth, UserSession } from '@/lib/auth';
import { updateAdStatusSchema } from '@/lib/validations/ad';
import { mockClientTransition, mockUpdateClientAd, mockSerializeAd } from '@/lib/mock-db';

export const dynamic = 'force-dynamic';

function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !anon || url.includes('your-supabase-url') || anon.includes('your-anon-key');
}

export const GET = withAuth(async (_req: Request, user: UserSession, context: { params: { id: string } }) => {
  const adId = context.params.id;

  if (isDemoMode()) {
    return NextResponse.json({ error: 'Not available in demo mode' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }

  const db = getSupabaseAdmin() ?? supabase;

  const { data: ad, error } = await db
    .from('ads')
    .select('*, packages(name), categories(name), cities(name), ad_media(*)')
    .eq('id', adId)
    .single();

  if (error || !ad) {
    return NextResponse.json({ error: 'Ad not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  // Clients can only read their own ads. Admin/Super/Admin-like roles may read any.
  const role = String(user.role || '').toUpperCase();
  const isPrivileged = ['ADMIN', 'SUPER_ADMIN'].includes(role);
  if (!isPrivileged && ad.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }

  return NextResponse.json({ ad }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}, ['CLIENT', 'ADMIN', 'SUPER_ADMIN']);

export const PATCH = withAuth(async (req: Request, user: UserSession, context: { params: { id: string } }) => {
  try {
    const adId = context.params.id;
    const body = await req.json();
    if (isDemoMode()) {
      const numericId = Number(adId);

      if (body.status) {
        const parsed = updateAdStatusSchema.parse(body);
        const result = mockClientTransition({
          ad_id: numericId,
          user_id: user.id,
          status: 'submitted',
          note: parsed.note,
        });
        if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
        return NextResponse.json({ message: 'Ad status updated', ad: mockSerializeAd(result.ad) }, { status: 200 });
      }

      const updated = mockUpdateClientAd({
        ad_id: numericId,
        user_id: user.id,
        title: body.title,
        description: body.description,
        category_id: body.category_id,
        city_id: body.city_id,
        package_id: body.package_id,
        mediaUrls: body.mediaUrls,
      });
      if (!updated.ok) return NextResponse.json({ error: updated.error }, { status: 400 });
      return NextResponse.json({ message: 'Draft updated', ad: mockSerializeAd(updated.ad) }, { status: 200 });
    }

    const { status, note } = updateAdStatusSchema.parse(body);

    const db = getSupabaseAdmin() ?? supabase;

    // Validate ownership
    const { data: ad, error: adError } = await db
      .from('ads')
      .select('user_id, status')
      .eq('id', adId)
      .single();

    if (adError || !ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    if (ad.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // A client can only change Draft -> Submitted
    if (status !== 'SUBMITTED') {
      return NextResponse.json({ error: 'Clients can only submit ads for review' }, { status: 400 });
    }

    if (ad.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft ads can be submitted for review' }, { status: 400 });
    }

    const dbStatus = 'submitted';

    const { error: updateError } = await db
      .from('ads')
      .update({
        status: dbStatus,
      })
      .eq('id', adId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update ad status' }, { status: 500 });
    }

    // Best-effort moderation metadata reset for DBs that include these columns.
    try {
      await db
        .from('ads')
        .update({
          moderation_status: 'pending',
          reviewed_by: null,
          reviewed_at: null,
          review_note: null,
        } as any)
        .eq('id', adId);
    } catch {}

    // Log history
    await db.from('ad_status_history').insert({
      ad_id: adId,
      previous_status: ad.status,
      new_status: dbStatus,
      changed_by: user.id,
      note: note || 'Client updated status',
    });

    return NextResponse.json({ message: 'Ad status updated' }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['CLIENT']);
