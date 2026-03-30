import { NextResponse } from "next/server";
import { mockRunPublishScheduled } from "@/lib/mock-db";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = mockRunPublishScheduled("cron");
  return NextResponse.json({ message: "Scheduled ads processed", published: result.published }, { status: 200 });
}
