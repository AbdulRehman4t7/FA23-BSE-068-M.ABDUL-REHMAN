import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase';
import { withAuth, UserSession } from '@/lib/auth';
import { mockListClientDashboard } from '@/lib/mock-db';

export const dynamic = 'force-dynamic';

function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !anon || url.includes('your-supabase-url') || anon.includes('your-anon-key');
}

export const GET = withAuth(async (req: Request, user: UserSession) => {
  try {
    if (isDemoMode()) {
      const mock = mockListClientDashboard({ user_id: user.id });
      const ads = mock.ads.map((ad: any) => ({
        ...ad,
        status: ad.status.toUpperCase(),
        packages: {
          name: ad.package.name,
          duration_days: ad.package.duration_days,
          weight: ad.package.weight,
          is_featured: ad.package.is_featured,
        },
        categories: ad.category,
        cities: ad.city,
      }));

      // Return profile in a shape compatible with the frontend
      const profile = {
        ...mock.profile,
        display_name: mock.profile.display_name,
      };

      return NextResponse.json({ ads, profile, stats: mock.stats }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
    }

    const db = getSupabaseAdmin() ?? supabase;

    const { data: ads, error } = await db
      .from('ads')
      .select('*, packages(name, duration_days, price), categories(name), cities(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
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
      // Backward-compatible aggregate key used by existing UI pieces.
      pending: pendingReview,
      expired: ads.filter(ad => ad.status === 'expired').length,
    };

    return NextResponse.json({ ads, profile, stats }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}, ['CLIENT', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']);
