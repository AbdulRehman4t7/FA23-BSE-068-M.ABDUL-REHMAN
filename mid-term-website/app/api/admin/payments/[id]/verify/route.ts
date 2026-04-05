import { NextResponse } from "next/server";
import { withAuth, UserSession } from "@/lib/auth";
import { updatePaymentStatusSchema } from "@/lib/validations/payment";
import { supabase, getSupabaseAdmin } from "@/lib/supabase";

export const PATCH = withAuth(async (req: Request, user: UserSession, context: { params: { id: string } }) => {
  try {
    const body = await req.json();
    const parsed = updatePaymentStatusSchema.parse(body);

    const paymentId = context.params.id;
    const db = getSupabaseAdmin() ?? supabase;

    const { data: payment, error: paymentError } = await db
      .from('payments')
      .select('id, ad_id, status')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const nextPaymentStatus = parsed.status === 'VERIFIED' ? 'verified' : 'rejected';
    const nextAdStatus = parsed.status === 'VERIFIED' ? 'payment_verified' : 'payment_pending';

    const { error: updateError } = await db
      .from('payments')
      .update({ status: nextPaymentStatus })
      .eq('id', paymentId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message || 'Failed to update payment' }, { status: 500 });
    }

    const { data: ad } = await db
      .from('ads')
      .select('status')
      .eq('id', payment.ad_id)
      .single();

    await db
      .from('ads')
      .update({ status: nextAdStatus })
      .eq('id', payment.ad_id);

    await db.from('ad_status_history').insert({
      ad_id: payment.ad_id,
      previous_status: ad?.status ?? null,
      new_status: nextAdStatus,
      changed_by: user.id,
      note: parsed.note || `Admin payment ${nextPaymentStatus}`,
    });

    return NextResponse.json({ message: 'Payment processed successfully' }, { status: 200 });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}, ["ADMIN", "SUPER_ADMIN"]);
