import { NextResponse } from "next/server";
import { withAuth, UserSession } from "@/lib/auth";
import { mockListModeratorQueue } from "@/lib/mock-db";

export const GET = withAuth(async (_req: Request, _user: UserSession) => {
  return NextResponse.json({ queue: mockListModeratorQueue() }, { status: 200 });
}, ["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
