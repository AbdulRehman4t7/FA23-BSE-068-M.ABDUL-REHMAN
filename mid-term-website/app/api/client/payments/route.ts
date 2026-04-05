import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';
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

    const db = getSupabaseAdmin() ?? supabase;

    // Verify Ad ownership
    const { data: ad, error: adError } = await db
      .from('ads')
      .select('id, user_id, status, package_id')
      .eq('id', validatedData.ad_id)
      .single();

    if (adError || !ad || ad.user_id !== user.id) {
      return NextResponse.json({ error: 'Ad not found or forbidden' }, { status: 403 });
    }

    if (!['payment_pending', 'payment_submitted'].includes(String(ad.status))) {
      return NextResponse.json({ error: 'Ad is not eligible for payment confirmation' }, { status: 400 });
    }

    if (ad.status === 'payment_pending') {
      const { error: insertError } = await db
        .from('payments')
        .insert({
          ad_id: validatedData.ad_id,
          amount: validatedData.amount,
          transaction_ref: validatedData.transaction_ref,
          sender_name: validatedData.sender_name,
          screenshot_url: validatedData.screenshot_url,
          status: 'verified',
        });

      if (insertError) {
        if (insertError.code === '23505') {
          return NextResponse.json({ error: 'Transaction reference already used' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to submit payment' }, { status: 500 });
      }
    } else {
      // If a previous flow left ad in payment_submitted, finalize latest payment record.
      const { data: latestPayment } = await db
        .from('payments')
        .select('id, status')
        .eq('ad_id', validatedData.ad_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestPayment && String(latestPayment.status).toLowerCase() !== 'verified') {
        await db.from('payments').update({ status: 'verified' }).eq('id', latestPayment.id);
      }
    }

    const { data: pkg } = await db
      .from('packages')
      .select('duration_days')
      .eq('id', ad.package_id)
      .maybeSingle();

    const durationDays = Number(pkg?.duration_days || 30);
    const publishAt = new Date();
    const expireAt = new Date(publishAt);
    expireAt.setDate(expireAt.getDate() + durationDays);

    const { error: adUpdateError } = await db
      .from('ads')
      .update({
        status: 'published',
        publish_at: publishAt.toISOString(),
        expire_at: expireAt.toISOString(),
      })
      .eq('id', validatedData.ad_id);

    if (adUpdateError) {
      return NextResponse.json({ error: adUpdateError.message || 'Payment saved but failed to activate ad' }, { status: 500 });
    }

    if (ad.status !== 'published') {
      await db.from('ad_status_history').insert({
        ad_id: validatedData.ad_id,
        previous_status: ad.status,
        new_status: 'published',
        changed_by: user.id,
        note: 'Payment verified and ad activated',
      });
    }

    return NextResponse.json({ message: 'Payment submitted and ad activated successfully' }, { status: 201 });
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
    const db = getSupabaseAdmin() ?? supabase;

    const { data: payments, error } = await db
      .from('payments')
      .select('*, ads!inner(id, title, user_id)')
      .eq('ads.user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ payments }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['CLIENT', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']);
