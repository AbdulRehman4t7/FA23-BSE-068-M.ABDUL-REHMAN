import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAuth, UserSession } from '@/lib/auth';

export const GET = withAuth(async (req: Request, user: UserSession) => {
  try {
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
