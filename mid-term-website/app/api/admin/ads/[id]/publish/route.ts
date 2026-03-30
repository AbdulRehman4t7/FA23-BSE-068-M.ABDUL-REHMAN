import { NextResponse } from "next/server";
import { withAuth, UserSession } from "@/lib/auth";
import { mockAdminPublish, mockSerializeAd } from "@/lib/mock-db";

export const PATCH = withAuth(async (req: Request, user: UserSession, context: { params: { id: string } }) => {
  try {
    const body = await req.json();
    const result = mockAdminPublish({
      ad_id: Number(context.params.id),
      actor_id: user.id,
      action: body.action ?? "publish",
      scheduled_for: body.scheduled_for,
      admin_boost: body.admin_boost,
      note: body.note,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "Admin action applied successfully", ad: mockSerializeAd(result.ad) }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}, ["ADMIN", "SUPER_ADMIN"]);
