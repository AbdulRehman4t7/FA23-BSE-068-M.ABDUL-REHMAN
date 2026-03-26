import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Setup this endpoint with an external CRON provider passing an Authorization token
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: ads, error } = await supabase
      .from('ads')
      .select('id')
      .eq('status', 'PUBLISHED')
      .lte('expire_at', new Date().toISOString());

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch expirable ads' }, { status: 500 });
    }

    let expiredCount = 0;

    for (const ad of ads) {
      await supabase.from('ads').update({
        status: 'EXPIRED',
      }).eq('id', ad.id);

      await supabase.from('ad_status_history').insert({
        ad_id: ad.id,
        previous_status: 'PUBLISHED',
        new_status: 'EXPIRED',
        note: 'Cron: Auto-expired ad',
      });

      expiredCount++;
    }

    return NextResponse.json({ message: 'Success', expired: expiredCount }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
