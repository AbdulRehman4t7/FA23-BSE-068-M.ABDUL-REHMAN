import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAuth, UserSession } from '@/lib/auth';
import { updateAdStatusSchema } from '@/lib/validations/ad';

export const PATCH = withAuth(async (req: Request, user: UserSession, context: { params: { id: string } }) => {
  try {
    const adId = context.params.id;
    const body = await req.json();
    const { status, note } = updateAdStatusSchema.parse(body);

    // Moderator can either approve (PAYMENT_PENDING, or PUBLISHED if free base package) or reject (DRAFT)
    // For simplicity, let's assume valid statuses they can set: PAYMENT_PENDING, DRAFT
    if (status !== 'PAYMENT_PENDING' && status !== 'DRAFT') {
      return NextResponse.json({ error: 'Invalid moderator action' }, { status: 400 });
    }

    const { data: ad, error: adError } = await supabase
      .from('ads')
      .select('status')
      .eq('id', adId)
      .single();

    if (adError || !ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    if (ad.status !== 'SUBMITTED') {
      return NextResponse.json({ error: 'Ad is not pending review' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('ads')
      .update({ status })
      .eq('id', adId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update ad status' }, { status: 500 });
    }

    // Log history
    await supabase.from('ad_status_history').insert({
      ad_id: adId,
      previous_status: ad.status,
      new_status: status,
      changed_by: user.id,
      note: note || 'Moderator reviewed ad',
    });

    return NextResponse.json({ message: 'Ad status updated by moderator' }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['MODERATOR', 'ADMIN', 'SUPER_ADMIN']);
