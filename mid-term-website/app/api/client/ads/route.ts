import { NextResponse } from 'next/server';
import { withAuth, UserSession } from '@/lib/auth';
import { createAdSchema } from '@/lib/validations/ad';
import { mockCreateAdDraft, mockListClientDashboard, mockSerializeAd } from '@/lib/mock-db';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase';

function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !anon || url.includes('your-supabase-url') || anon.includes('your-anon-key');
}

function generateSlug(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

export const dynamic = 'force-dynamic';

export const GET = withAuth(async (_req: Request, user: UserSession) => {
  if (isDemoMode()) {
    const dashboard = mockListClientDashboard({ user_id: user.id });
    return NextResponse.json({ ads: dashboard.ads.map(mockSerializeAd) }, { status: 200 });
  }

  const db = getSupabaseAdmin() ?? supabase;

  const { data: ads, error } = await db
    .from('ads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
  }

  return NextResponse.json({ ads }, { status: 200 });
}, ['CLIENT', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN']);

export const POST = withAuth(async (req: Request, user: UserSession) => {
  try {
    const body = await req.json();
    const data = createAdSchema.parse(body);
    if (isDemoMode()) {
      const ad = mockCreateAdDraft({
        user_id: user.id,
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        city_id: data.city_id,
        package_id: data.package_id,
        mediaUrls: data.mediaUrls,
      });

      return NextResponse.json({ message: 'Draft created successfully', ad: mockSerializeAd(ad) }, { status: 201 });
    }

    const slug = generateSlug(data.title);

    const categorySlug = data.category_id.replace(/^cat-/, '');
    const citySlug = data.city_id.replace(/^city-/, '');
    const packageSlug = data.package_id;

    const db = getSupabaseAdmin() ?? supabase;

    const { data: category, error: categoryError } = await db
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (categoryError || !category) {
      return NextResponse.json({ error: 'Invalid category selected' }, { status: 400 });
    }

    const { data: city, error: cityError } = await db
      .from('cities')
      .select('id')
      .eq('slug', citySlug)
      .single();

    if (cityError || !city) {
      return NextResponse.json({ error: 'Invalid city selected' }, { status: 400 });
    }

    const { data: pkg, error: packageError } = await db
      .from('packages')
      .select('id')
      .eq('slug', packageSlug)
      .single();

    if (packageError || !pkg) {
      return NextResponse.json({ error: 'Invalid package selected' }, { status: 400 });
    }

    const { data: inserted, error } = await db
      .from('ads')
      .insert({
        user_id: user.id,
        title: data.title,
        slug,
        description: data.description,
        price: data.price ?? 0,
        category_id: category.id,
        city_id: city.id,
        package_id: pkg.id,
        status: 'draft',
        is_featured: false,
      })
      .select('*, packages(name), categories(name), cities(name)')
      .single();

    if (error || !inserted) {
      return NextResponse.json({ error: error?.message || 'Failed to create ad' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Draft created successfully', ad: inserted }, { status: 201 });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['CLIENT', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN']);
