import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAuth, UserSession } from '@/lib/auth';
import { updateAdStatusSchema } from '@/lib/validations/ad';

export const PATCH = withAuth(async (req: Request, user: UserSession, context: { params: { id: string } }) => {
  try {
    const adId = context.params.id;
    const body = await req.json();
    const { status, note } = updateAdStatusSchema.parse(body);

    // Validate ownership
    const { data: ad, error: adError } = await supabase
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

    // A client can only change Draft -> Submitted, or if payment is needed
    if (status !== 'SUBMITTED' && status !== 'PAYMENT_SUBMITTED') {
      return NextResponse.json({ error: 'Clients can only submit ads for review or payment' }, { status: 400 });
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
