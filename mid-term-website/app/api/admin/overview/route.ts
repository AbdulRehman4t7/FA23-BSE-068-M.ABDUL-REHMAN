import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { getSupabaseAdmin, supabase } from '@/lib/supabase';

async function countWhere(
  db: any,
  table: string,
  apply?: (query: any) => any
) {
  const base = db.from(table).select('*', { count: 'exact', head: true });
  const query = apply ? apply(base) : base;
  const { count, error } = await query;
  if (error) throw new Error(error.message || `Failed to count ${table}`);
  return Number(count || 0);
}

export const GET = withAuth(async () => {
  try {
    const db = getSupabaseAdmin() ?? supabase;

    const [
      totalUsers,
      totalAds,
      pendingAds,
      approvedAds,
      rejectedAds,
      activeAds,
    ] = await Promise.all([
      countWhere(db, 'users'),
      countWhere(db, 'ads'),
      countWhere(db, 'ads', (q) => q.in('status', ['submitted', 'under_review', 'payment_pending', 'payment_submitted'])),
      countWhere(db, 'ads', (q) => q.in('status', ['payment_verified', 'scheduled', 'published'])),
      countWhere(db, 'ads', (q) => q.eq('status', 'rejected')),
      countWhere(db, 'ads', (q) => q.eq('status', 'published').or(`expire_at.is.null,expire_at.gt.${new Date().toISOString()}`)),
    ]);

    return NextResponse.json(
      {
        stats: {
          totalUsers,
          totalAds,
          pendingAds,
          approvedAds,
          rejectedAds,
          activeAds,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load overview' }, { status: 500 });
  }
}, ['ADMIN', 'SUPER_ADMIN']);
