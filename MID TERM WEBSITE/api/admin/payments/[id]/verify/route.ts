import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAuth, UserSession } from '@/lib/auth';
import { updatePaymentStatusSchema } from '@/lib/validations/payment';

export const PATCH = withAuth(async (req: Request, user: UserSession, context: { params: { id: string } }) => {
  try {
    const paymentId = context.params.id;
    const body = await req.json();
    const { status, note } = updatePaymentStatusSchema.parse(body);

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('ad_id, status')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment || payment.status !== 'PENDING') {
      return NextResponse.json({ error: 'Payment not found or not pending' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', paymentId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
    }

    // Update the ad status based on payment verification
    const newAdStatus = status === 'VERIFIED' ? 'PAYMENT_VERIFIED' : 'PAYMENT_PENDING';
    
    // Get old ad status
    const { data: ad } = await supabase.from('ads').select('status').eq('id', payment.ad_id).single();

    await supabase.from('ads').update({ status: newAdStatus }).eq('id', payment.ad_id);

    // Log history
    if (ad) {
      await supabase.from('ad_status_history').insert({
        ad_id: payment.ad_id,
        previous_status: ad.status,
        new_status: newAdStatus,
        changed_by: user.id,
        note: note || `Payment ${status.toLowerCase()}`,
      });
    }

    return NextResponse.json({ message: 'Payment status updated' }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['ADMIN', 'SUPER_ADMIN']);
