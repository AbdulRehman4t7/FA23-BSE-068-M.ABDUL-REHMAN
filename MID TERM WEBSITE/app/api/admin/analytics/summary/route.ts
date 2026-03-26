import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAuth, UserSession } from '@/lib/auth';

export const GET = withAuth(async (req: Request, user: UserSession) => {
  try {
    const { count: totalAds } = await supabase.from('ads').select('*', { count: 'exact', head: true });
    
    const { count: activeAds } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PUBLISHED');

    // Aggregate Payments
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'VERIFIED');
      
    const totalRevenue = payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    return NextResponse.json({
      totalAds: totalAds || 0,
      activeAds: activeAds || 0,
      totalRevenue,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['ADMIN', 'SUPER_ADMIN']);
