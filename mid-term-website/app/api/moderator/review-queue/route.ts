import { NextResponse } from "next/server";
import { withAuth, UserSession } from "@/lib/auth";
import { mockListModeratorQueue } from "@/lib/mock-db";
import { supabase, getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !anon || url.includes('your-supabase-url') || anon.includes('your-anon-key');
}

export const GET = withAuth(async (req: Request, _user: UserSession) => {
  const { searchParams } = new URL(req.url);
  const filter = String(searchParams.get('filter') || 'pending').toLowerCase();

  if (isDemoMode()) {
    const queue = mockListModeratorQueue();
    const filtered = filter === 'approved'
      ? queue.filter((ad: any) => String(ad.status).toLowerCase() === 'payment_pending')
      : filter === 'rejected'
        ? queue.filter((ad: any) => String(ad.status).toLowerCase() === 'rejected')
        : queue.filter((ad: any) => ['draft', 'submitted', 'under_review'].includes(String(ad.status).toLowerCase()));
    return NextResponse.json({ queue: filtered }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }

  const db = getSupabaseAdmin() ?? supabase;

  let query = db
    .from('ads')
    .select('*, packages(name), categories(name), cities(name), ad_media(*)')
    .order('created_at', { ascending: false });

  // Use status-based filters so this endpoint works even before moderation metadata migration.
  if (filter === 'approved') {
    query = query.eq('status', 'payment_pending');
  } else if (filter === 'rejected') {
    query = query.eq('status', 'rejected');
  } else {
    query = query.in('status', ['draft', 'submitted', 'under_review']);
  }

  const { data: ads, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message || 'Failed to load moderation queue' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }

  const userIds = Array.from(new Set((ads || []).map((a: any) => a.user_id).filter(Boolean)));
  const { data: profiles } = userIds.length
    ? await db
        .from('seller_profiles')
        .select('user_id, display_name, business_name, phone, is_verified, created_at')
        .in('user_id', userIds)
    : { data: [] as any[] };

  const { data: users } = userIds.length
    ? await db
        .from('users')
        .select('id, name, email')
        .in('id', userIds)
    : { data: [] as any[] };

  const profileByUserId = new Map((profiles || []).map((p: any) => [p.user_id, p]));
  const userById = new Map((users || []).map((u: any) => [u.id, u]));

  const queue = (ads || []).map((ad: any) => ({
    ...ad,
    seller_profiles: profileByUserId.get(ad.user_id) || null,
    user: userById.get(ad.user_id) || null,
  }));

  return NextResponse.json({ queue }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}, ["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
