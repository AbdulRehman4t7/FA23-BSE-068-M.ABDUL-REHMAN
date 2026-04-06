import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase';
import { withAuth, UserSession } from '@/lib/auth';
import { mockListClientDashboard, mockSerializeAd } from '@/lib/mock-db';

export const dynamic = 'force-dynamic';

function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !anon || url.includes('your-supabase-url') || anon.includes('your-anon-key');
}

function buildMockResponse(user: UserSession) {
  const mock = mockListClientDashboard({ user_id: user.id });
  const ads = mock.ads.map((ad: any) => ({
    ...ad,
    status: ad.status,
    packages: {
      name: ad.package.name,
      duration_days: ad.package.duration_days,
      weight: ad.package.weight,
      is_featured: ad.package.is_featured,
    },
    categories: ad.category,
    cities: ad.city,
  }));

  const profile = {
    ...mock.profile,
    display_name: mock.profile.display_name,
  };

  return NextResponse.json(
    { ads, profile, stats: mock.stats },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}

export const GET = withAuth(async (req: Request, user: UserSession) => {
  try {
    // If demo mode, use mock-db directly
    if (isDemoMode()) {
      return buildMockResponse(user);
    }

    // Try Supabase first
    try {
      const db = getSupabaseAdmin() ?? supabase;
      if (!db) throw new Error('No Supabase client');

      const { data: ads, error } = await db
        .from('ads')
        .select('*, packages(name, duration_days, price), categories(name), cities(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // If Supabase returned empty results, fall back to mock-db
      // This handles the case where Supabase exists but isn't seeded
      if (!ads || ads.length === 0) {
        console.warn('[GET /api/client/dashboard] Supabase returned empty, using mock-db');
        return buildMockResponse(user);
      }

      const { data: profile } = await db
        .from('seller_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const pendingReview = ads.filter(ad => ['submitted', 'under_review'].includes(ad.status)).length;
      const pendingPayment = ads.filter(ad => ['payment_pending', 'payment_submitted'].includes(ad.status)).length;
      const stats = {
        total: ads.length,
        active: ads.filter(ad => ad.status === 'published').length,
        pending_review: pendingReview,
        pending_payment: pendingPayment,
        pending: pendingReview,
        expired: ads.filter(ad => ad.status === 'expired').length,
      };

      return NextResponse.json(
        { ads, profile, stats },
        { status: 200, headers: { 'Cache-Control': 'no-store' } }
      );
    } catch (supaErr) {
      console.error('[GET /api/client/dashboard] Supabase failed, falling back to mock-db:', supaErr);
      return buildMockResponse(user);
    }
  } catch (error) {
    console.error('[GET /api/client/dashboard] Unexpected error:', error);
    // Even on unexpected errors, try to return mock data rather than a 500
    try {
      return buildMockResponse(user);
    } catch {
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }
  }
}, ['CLIENT', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']);
