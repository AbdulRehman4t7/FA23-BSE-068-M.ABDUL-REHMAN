import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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

      return NextResponse.json({ ads, profile, stats: mock.stats }, { status: 200 });
    }

    const { data: ads, error } = await supabase
      .from('ads')
      .select('*, packages(name, duration_days), categories(name), cities(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }

    const { data: profile } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const stats = {
      total: ads.length,
      active: ads.filter(ad => ad.status === 'PUBLISHED').length,
      pending: ads.filter(ad => ['SUBMITTED', 'UNDER_REVIEW', 'PAYMENT_PENDING'].includes(ad.status)).length,
      expired: ads.filter(ad => ad.status === 'EXPIRED').length,
    };

    return NextResponse.json({ ads, profile, stats }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['CLIENT', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']);
