import { NextResponse } from "next/server";
import { withAuth, UserSession } from "@/lib/auth";
import { updatePaymentStatusSchema } from "@/lib/validations/payment";
import { mockVerifyPayment } from "@/lib/mock-db";

export const PATCH = withAuth(async (req: Request, user: UserSession, context: { params: { id: string } }) => {
  try {
    const body = await req.json();
    const parsed = updatePaymentStatusSchema.parse(body);
    const result = mockVerifyPayment({
      payment_id: Number(context.params.id),
      actor_id: user.id,
      status: parsed.status,
      note: parsed.note,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "Payment processed successfully" }, { status: 200 });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}, ["ADMIN", "SUPER_ADMIN"]);
