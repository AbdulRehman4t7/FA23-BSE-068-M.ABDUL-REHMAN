import { NextResponse } from "next/server";
import { mockRunExpireAds, mockInsertHealthLog } from "@/lib/mock-db";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = mockRunExpireAds("cron");
  const health = mockInsertHealthLog();
  return NextResponse.json({ message: "Expiry job completed", expired: result.expired, health }, { status: 200 });
}
