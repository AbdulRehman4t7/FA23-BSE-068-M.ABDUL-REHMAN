import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { getSupabaseAdmin, supabase } from "@/lib/supabase";

export const GET = withAuth(async () => {
  try {
    const db = getSupabaseAdmin() ?? supabase;

    const [
      adsRes,
      paymentsRes,
      categoryRes,
      cityRes,
      healthRes,
    ] = await Promise.all([
      db.from('ads').select('id, status'),
      db.from('payments').select('amount, status'),
      db.from('ads').select('category_id, categories(name)'),
      db.from('ads').select('city_id, cities(name)'),
      db.from('system_health_logs').select('status, db_latency_ms, queue_depth, created_at').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    if (adsRes.error || paymentsRes.error || categoryRes.error || cityRes.error) {
      return NextResponse.json({ error: 'Failed to load analytics summary' }, { status: 500 });
    }

    const ads = adsRes.data || [];
    const payments = paymentsRes.data || [];

    const totalAds = ads.length;
    const publishedAds = ads.filter((ad: any) => ad.status === 'published').length;
    const paymentQueue = ads.filter((ad: any) => ['payment_pending', 'payment_submitted'].includes(ad.status)).length;
    const totalRevenue = payments
      .filter((p: any) => p.status === 'verified')
      .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    const approvalBase = Math.max(1, ads.filter((ad: any) => ['submitted', 'under_review', 'payment_pending', 'payment_submitted', 'payment_verified', 'scheduled', 'published'].includes(ad.status)).length);
    const approvalRate = Math.round((publishedAds / approvalBase) * 100);

    const adsByCategoryMap = new Map<string, number>();
    for (const row of categoryRes.data || []) {
      const name = row.categories?.name || 'Unknown';
      adsByCategoryMap.set(name, (adsByCategoryMap.get(name) || 0) + 1);
    }

    const adsByCityMap = new Map<string, number>();
    for (const row of cityRes.data || []) {
      const name = row.cities?.name || 'Unknown';
      adsByCityMap.set(name, (adsByCityMap.get(name) || 0) + 1);
    }

    return NextResponse.json(
      {
        summary: {
          totalAds,
          publishedAds,
          totalRevenue,
          paymentQueue,
          moderationQueue: ads.filter((ad: any) => ['submitted', 'under_review'].includes(ad.status)).length,
          approvalRate,
          adsByCategory: Array.from(adsByCategoryMap.entries()).map(([name, count]) => ({ name, count })),
          adsByCity: Array.from(adsByCityMap.entries()).map(([name, count]) => ({ name, count })),
          health: healthRes.data || null,
        },
      },
      { status: 200 }
    );
  } catch (_error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ["ADMIN", "SUPER_ADMIN"]);
