import { NextResponse } from "next/server";
import { withAuth, UserSession } from "@/lib/auth";
import { mockModerateAd, mockSerializeAd } from "@/lib/mock-db";

export const PATCH = withAuth(async (req: Request, user: UserSession, context: { params: { id: string } }) => {
  try {
    const body = await req.json();
    const action = body.action as "approve" | "reject" | "flag";
    const result = mockModerateAd({
      ad_id: Number(context.params.id),
      actor_id: user.id,
      action,
      note: body.note,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "Ad reviewed successfully", ad: mockSerializeAd(result.ad) }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}, ["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
