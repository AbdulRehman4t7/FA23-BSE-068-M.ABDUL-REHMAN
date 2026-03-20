import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request, context: { params: { slug: string } }) {
  try {
    const slug = context.params.slug;

    const { data: ad, error } = await supabase
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
      .eq('status', 'PUBLISHED')
      .single();

    if (error || !ad) {
      return NextResponse.json({ error: 'Ad not found or not published' }, { status: 404 });
    }

    return NextResponse.json({ ad }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
