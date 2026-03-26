import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');

    let query = supabase
      .from('ads')
      .select(`
        *,
        categories!inner(id, name, slug),
        cities!inner(id, name, slug),
        packages!inner(id, name, weight, is_featured)
      `)
      .eq('status', 'PUBLISHED');

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
