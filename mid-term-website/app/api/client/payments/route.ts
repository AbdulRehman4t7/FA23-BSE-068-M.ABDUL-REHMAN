import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabase } from '@/lib/supabase';
import { withAuth, UserSession } from '@/lib/auth';
import { submitPaymentSchema } from '@/lib/validations/payment';
import { mockSubmitPayment, mockListClientPayments } from '@/lib/mock-db';

function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !anon || url.includes('your-supabase-url') || anon.includes('your-anon-key');
}

export const POST = withAuth(async (req: Request, user: UserSession) => {
  try {
    const body = await req.json();
    const validatedData = submitPaymentSchema.parse(body);

    if (isDemoMode()) {
      const adIdNum = Number(validatedData.ad_id);
      const result = mockSubmitPayment({
        ad_id: adIdNum,
        amount: validatedData.amount,
        method: validatedData.method,
        transaction_ref: validatedData.transaction_ref,
        sender_name: validatedData.sender_name,
        screenshot_url: validatedData.screenshot_url,
        user_id: user.id,
      });
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ message: 'Payment submitted successfully' }, { status: 201 });
    }

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


export const GET = withAuth(async (req: Request, user: UserSession) => {
  try {
    if (isDemoMode()) {
      const payments = mockListClientPayments(user.id);
      return NextResponse.json({ payments }, { status: 200 });
    }
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*, ads(title)')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ payments }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['CLIENT', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']);
