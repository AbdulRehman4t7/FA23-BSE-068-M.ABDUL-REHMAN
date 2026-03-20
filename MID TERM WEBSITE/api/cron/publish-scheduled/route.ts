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
      .select('id, packages(duration_days)')
      .eq('status', 'SCHEDULED')
      .lte('publish_at', new Date().toISOString());

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch scheduled ads' }, { status: 500 });
    }

    let publishedCount = 0;

    for (const ad of ads) {
      if (!ad.packages) continue;
      const durationDays = (ad.packages as any).duration_days;
      
      const publishAt = new Date();
      const expireAt = new Date();
      expireAt.setDate(publishAt.getDate() + durationDays);

      await supabase.from('ads').update({
        status: 'PUBLISHED',
        publish_at: publishAt.toISOString(),
        expire_at: expireAt.toISOString(),
      }).eq('id', ad.id);

      await supabase.from('ad_status_history').insert({
        ad_id: ad.id,
        previous_status: 'SCHEDULED',
        new_status: 'PUBLISHED',
        note: 'Cron: Auto-published scheduled ad',
      });

      publishedCount++;
    }

    return NextResponse.json({ message: 'Success', published: publishedCount }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
