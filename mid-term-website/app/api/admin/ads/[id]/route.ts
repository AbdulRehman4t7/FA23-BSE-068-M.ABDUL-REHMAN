import { NextResponse } from 'next/server';
import { withAuth, UserSession } from '@/lib/auth';
import { getSupabaseAdmin, supabase } from '@/lib/supabase';

const ALLOWED_STATUS = new Set([
  'draft',
  'submitted',
  'under_review',
  'payment_pending',
  'payment_submitted',
  'payment_verified',
  'scheduled',
  'published',
  'expired',
  'archived',
  'rejected',
]);

export const PATCH = withAuth(async (req: Request, user: UserSession, context: { params: { id: string } }) => {
  try {
    const body = await req.json();
    const nextStatus = String(body.status || '').trim().toLowerCase();
    const note = String(body.note || '').trim();
    const adId = context.params.id;

    if (!ALLOWED_STATUS.has(nextStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const db = getSupabaseAdmin() ?? supabase;

    const { data: ad, error: getError } = await db
      .from('ads')
      .select('id, status')
      .eq('id', adId)
      .single();

    if (getError || !ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    const { error: updateError } = await db.from('ads').update({ status: nextStatus }).eq('id', adId);
    if (updateError) {
      return NextResponse.json({ error: updateError.message || 'Failed to update ad' }, { status: 500 });
    }

    await db.from('ad_status_history').insert({
      ad_id: adId,
      previous_status: ad.status,
      new_status: nextStatus,
      changed_by: user.id,
      note: note || `Admin updated status to ${nextStatus}`,
    });

    return NextResponse.json({ message: 'Ad status updated' }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['ADMIN', 'SUPER_ADMIN']);

export const DELETE = withAuth(async (_req: Request, _user: UserSession, context: { params: { id: string } }) => {
  try {
    const adId = context.params.id;
    const db = getSupabaseAdmin() ?? supabase;

    const { error } = await db.from('ads').delete().eq('id', adId);
    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to delete ad' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Ad deleted' }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['ADMIN', 'SUPER_ADMIN']);
