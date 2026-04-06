import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase';
import { withAuth, UserSession } from '@/lib/auth';
import { updateAdStatusSchema } from '@/lib/validations/ad';
import { mockClientTransition, mockUpdateClientAd, mockSerializeAd, mockListClientDashboard } from '@/lib/mock-db';

export const dynamic = 'force-dynamic';

function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !anon || url.includes('your-supabase-url') || anon.includes('your-anon-key');
}

export const GET = withAuth(async (_req: Request, user: UserSession, context: { params: { id: string } }) => {
  const adId = context.params.id;

  // In demo mode, look up from mock-db
  if (isDemoMode()) {
    const { ads } = mockListClientDashboard({ user_id: user.id });
    const numericId = Number(adId);
    const ad = ads.find((a: any) => a.id === numericId || String(a.id) === adId);
    if (!ad) return NextResponse.json({ error: 'Ad not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
    return NextResponse.json({ ad: mockSerializeAd(ad) }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }

  // Try Supabase, fall back to mock-db
  try {
    const db = getSupabaseAdmin() ?? supabase;
    if (!db) throw new Error('No Supabase client');

    const { data: ad, error } = await db
      .from('ads')
      .select('*, packages(name), categories(name), cities(name), ad_media(*)')
      .eq('id', adId)
      .single();

    if (!error && ad) {
      // Clients can only read their own ads. Admin/Super_Admin may read any.
      const role = String(user.role || '').toUpperCase();
      const isPrivileged = ['ADMIN', 'SUPER_ADMIN'].includes(role);
      if (!isPrivileged && ad.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
      }
      return NextResponse.json({ ad }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
    }
  } catch (e) {
    console.error('[GET /api/client/ads/[id]] Supabase failed, trying mock-db:', e);
  }

  // Fall back to mock-db
  const { ads } = mockListClientDashboard({ user_id: user.id });
  const numericId = Number(adId);
  const mockAd = ads.find((a: any) => a.id === numericId || String(a.id) === adId);
  if (!mockAd) return NextResponse.json({ error: 'Ad not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  return NextResponse.json({ ad: mockSerializeAd(mockAd) }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}, ['CLIENT', 'ADMIN', 'SUPER_ADMIN']);

export const PATCH = withAuth(async (req: Request, user: UserSession, context: { params: { id: string } }) => {
  try {
    const adId = context.params.id;
    const body = await req.json();

    // Demo mode — use mock-db
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

    // Supabase mode
    try {
      const { status, note } = updateAdStatusSchema.parse(body);
      const db = getSupabaseAdmin() ?? supabase;
      if (!db) throw new Error('No Supabase client');

      // Validate ownership
      const { data: ad, error: adError } = await db
        .from('ads')
        .select('user_id, status')
        .eq('id', adId)
        .single();

      if (adError || !ad) {
        // Fall back to mock-db transition
        const numericId = Number(adId);
        const result = mockClientTransition({ ad_id: numericId, user_id: user.id, status: 'submitted', note });
        if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
        return NextResponse.json({ message: 'Ad status updated', ad: mockSerializeAd(result.ad) }, { status: 200 });
      }

      if (ad.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      if (status !== 'SUBMITTED') {
        return NextResponse.json({ error: 'Clients can only submit ads for review' }, { status: 400 });
      }

      if (ad.status !== 'draft') {
        return NextResponse.json({ error: 'Only draft ads can be submitted for review' }, { status: 400 });
      }

      const { error: updateError } = await db
        .from('ads')
        .update({ status: 'submitted' })
        .eq('id', adId);

      if (updateError) {
        // Fall back to mock-db
        const numericId = Number(adId);
        const result = mockClientTransition({ ad_id: numericId, user_id: user.id, status: 'submitted', note });
        if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
        return NextResponse.json({ message: 'Ad status updated', ad: mockSerializeAd(result.ad) }, { status: 200 });
      }

      // Best-effort metadata reset
      try {
        await db.from('ads').update({
          moderation_status: 'pending',
          reviewed_by: null,
          reviewed_at: null,
          review_note: null,
        } as any).eq('id', adId);
      } catch {}

      // Log history
      try {
        await db.from('ad_status_history').insert({
          ad_id: adId,
          previous_status: ad.status,
          new_status: 'submitted',
          changed_by: user.id,
          note: note || 'Client submitted ad for review',
        });
      } catch {}

      // Also update mock-db for consistency
      const numericId = Number(adId);
      if (!isNaN(numericId)) {
        mockClientTransition({ ad_id: numericId, user_id: user.id, status: 'submitted', note });
      }

      return NextResponse.json({ message: 'Ad status updated' }, { status: 200 });
    } catch (supaErr: any) {
      if (supaErr?.name === 'ZodError') throw supaErr;
      console.error('[PATCH /api/client/ads/[id]] Supabase failed, using mock-db:', supaErr);
      // Fall back to mock-db
      const numericId = Number(adId);
      if (body.status) {
        const result = mockClientTransition({ ad_id: numericId, user_id: user.id, status: 'submitted' });
        if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
        return NextResponse.json({ message: 'Ad status updated', ad: mockSerializeAd(result.ad) }, { status: 200 });
      }
      return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 });
    }
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['CLIENT']);
