import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase';
import { mockGetAdBySlug } from '@/lib/mock-db';

function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !anon || url.includes('your-supabase-url') || anon.includes('your-anon-key');
}

export async function GET(req: Request, context: { params: { slug: string } }) {
  try {
    const slug = context.params.slug;

    if (isDemoMode()) {
      const ad = mockGetAdBySlug(slug);
      if (!ad) return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
      return NextResponse.json({
        ad: {
          ...ad,
          status: ad.status.toUpperCase(),
          // Map singular -> plural names to match the Supabase response shape
          categories: ad.category,
          cities: ad.city,
          packages: { ...ad.package, name: ad.package.name },
          ad_media: ad.ad_media,
          seller_profiles: ad.seller_profiles,
        },
      });
    }

    const db = getSupabaseAdmin() ?? supabase;

    const { data: ad, error } = await db
      .from('ads')
      .select(`
        *,
        categories(id, name, slug),
        cities(id, name, slug),
        packages(id, name, weight, is_featured),
        seller_profiles(display_name, business_name, phone, is_verified),
        ad_media(*)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !ad) {
      return NextResponse.json({ error: 'Ad not found or not published' }, { status: 404 });
    }

    return NextResponse.json({ ad }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
