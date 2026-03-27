import { NextResponse } from "next/server";
import { mockInsertHealthLog } from "@/lib/mock-db";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ log: mockInsertHealthLog() }, { status: 200 });
}
