import { NextResponse } from "next/server";
import { withAuth, UserSession } from "@/lib/auth";
import { supabase, getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (req: Request, _user: UserSession) => {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const db = getSupabaseAdmin() ?? supabase;

    let query = db
      .from("ads")
      .select("*, packages(name), categories(name), cities(name)")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: ads, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message || "Failed to fetch ads" }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json({ ads }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (_e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}, ["ADMIN", "SUPER_ADMIN"]);
