import { NextResponse } from "next/server";
import { withAuth, UserSession } from "@/lib/auth";
import { mockListPaymentQueue } from "@/lib/mock-db";

export const GET = withAuth(async (_req: Request, _user: UserSession) => {
  return NextResponse.json({ queue: mockListPaymentQueue() }, { status: 200 });
}, ["ADMIN", "SUPER_ADMIN"]);
