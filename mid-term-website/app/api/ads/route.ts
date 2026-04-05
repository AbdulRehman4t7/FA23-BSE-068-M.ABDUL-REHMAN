import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase';
import { mockListPublishedAds, type MockAd } from '@/lib/mock-db';

function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !anon || url.includes('your-supabase-url') || anon.includes('your-anon-key');
}

function normalizeAdForClient(ad: MockAd) {
  return {
    id: ad.id,
    slug: ad.slug,
    title: ad.title,
    description: ad.description,
    price: ad.price,
    status: ad.status.toUpperCase(),
    cities: ad.city,
    categories: ad.category,
    packages: { ...ad.package, name: ad.package.name },
    is_featured: ad.is_featured,
    publish_at: ad.publish_at,
    expire_at: ad.expire_at,
    ad_media: ad.ad_media,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '9');

    if (isDemoMode()) {
      const result = mockListPublishedAds({ category, city, search, page, limit });
      const ads = result.data.map(normalizeAdForClient);
      return NextResponse.json({ ads, meta: result.meta }, { status: 200 });
    }

    const db = getSupabaseAdmin() ?? supabase;

    let query = db
      .from('ads')
      .select(`
        *,
        categories!inner(id, name, slug),
        cities!inner(id, name, slug),
        packages!inner(id, name, weight, is_featured),
        ad_media(*)
      `)
      .eq('status', 'published');

    if (category) {
      query = query.eq('categories.slug', category);
    }
    if (city) {
      query = query.eq('cities.slug', city);
    }

    // Example ordering logic (featured first, then package weight, then publish_at)
    query = query
      .order('packages(is_featured)', { ascending: false })
      .order('packages(weight)', { ascending: false })
      .order('publish_at', { ascending: false });

    const { data: ads, error } = await query;

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
    }

    return NextResponse.json({ ads }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
