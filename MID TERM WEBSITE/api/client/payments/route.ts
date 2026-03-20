import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAuth, UserSession } from '@/lib/auth';
import { submitPaymentSchema } from '@/lib/validations/payment';

export const POST = withAuth(async (req: Request, user: UserSession) => {
  try {
    const body = await req.json();
    const validatedData = submitPaymentSchema.parse(body);

    // Verify Ad ownership
    const { data: ad, error: adError } = await supabase
      .from('ads')
      .select('user_id, status')
      .eq('id', validatedData.ad_id)
      .single();

    if (adError || !ad || ad.user_id !== user.id) {
      return NextResponse.json({ error: 'Ad not found or forbidden' }, { status: 403 });
    }

    if (ad.status !== 'PAYMENT_PENDING') {
      return NextResponse.json({ error: 'Ad is not pending payment' }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        ad_id: validatedData.ad_id,
        amount: validatedData.amount,
        method: validatedData.method,
        transaction_ref: validatedData.transaction_ref,
        sender_name: validatedData.sender_name,
        screenshot_url: validatedData.screenshot_url,
        status: 'PENDING',
      });

    if (insertError) {
      // Check duplicate transaction ref
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'Transaction reference already used' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to submit payment' }, { status: 500 });
    }

    // Update Ad Status to PAYMENT_SUBMITTED
    await supabase.from('ads').update({ status: 'PAYMENT_SUBMITTED' }).eq('id', validatedData.ad_id);

    return NextResponse.json({ message: 'Payment submitted successfully' }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['CLIENT']);
