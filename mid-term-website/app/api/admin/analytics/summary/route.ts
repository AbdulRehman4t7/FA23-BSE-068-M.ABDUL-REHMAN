import { NextResponse } from "next/server";
import { withAuth, UserSession } from "@/lib/auth";
import { mockAnalyticsSummary, mockGetSystemSnapshot, mockListAdminUsers } from "@/lib/mock-db";

export const GET = withAuth(async (_req: Request, _user: UserSession) => {
  return NextResponse.json({
    summary: mockAnalyticsSummary(),
    users: mockListAdminUsers(),
    system: mockGetSystemSnapshot(),
  }, { status: 200 });
}, ["ADMIN", "SUPER_ADMIN"]);
