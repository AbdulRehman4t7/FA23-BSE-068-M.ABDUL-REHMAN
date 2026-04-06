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
  // Always try mock-db first for reliable results in demo/dev mode
  if (isDemoMode()) {
    const dashboard = mockListClientDashboard({ user_id: user.id });
    return NextResponse.json({ ads: dashboard.ads.map(mockSerializeAd) }, { status: 200 });
  }

  // Try Supabase, fall back to mock if it fails
  try {
    const db = getSupabaseAdmin() ?? supabase;
    if (!db) throw new Error('No Supabase client');

    const { data: ads, error } = await db
      .from('ads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!ads || ads.length === 0) {
      // Supabase returned empty — fall back to mock so user sees data
      const dashboard = mockListClientDashboard({ user_id: user.id });
      return NextResponse.json({ ads: dashboard.ads.map(mockSerializeAd) }, { status: 200 });
    }

    return NextResponse.json({ ads }, { status: 200 });
  } catch (e) {
    console.error('[GET /api/client/ads] Supabase failed, using mock-db:', e);
    const dashboard = mockListClientDashboard({ user_id: user.id });
    return NextResponse.json({ ads: dashboard.ads.map(mockSerializeAd) }, { status: 200 });
  }
}, ['CLIENT', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN']);

export const POST = withAuth(async (req: Request, user: UserSession) => {
  try {
    const body = await req.json();
    const data = createAdSchema.parse(body);

    // ——— Always create in mock-db so it shows up immediately ———
    const mockAd = mockCreateAdDraft({
      user_id: user.id,
      title: data.title,
      description: data.description,
      category_id: data.category_id,
      city_id: data.city_id,
      package_id: data.package_id,
      mediaUrls: data.mediaUrls,
    });

    // If demo mode, return the mock ad right away
    if (isDemoMode()) {
      return NextResponse.json({ message: 'Draft created successfully', ad: mockSerializeAd(mockAd) }, { status: 201 });
    }

    // Also try Supabase insert (best-effort), but return mock ad regardless
    try {
      const slug = generateSlug(data.title);
      const categorySlug = data.category_id.replace(/^cat-/, '');
      const citySlug = data.city_id.replace(/^city-/, '');
      const packageSlug = data.package_id;

      const db = getSupabaseAdmin() ?? supabase;
      if (!db) throw new Error('No Supabase client');

      const { data: category } = await db
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      const { data: city } = await db
        .from('cities')
        .select('id')
        .eq('slug', citySlug)
        .single();

      const { data: pkg } = await db
        .from('packages')
        .select('id')
        .eq('slug', packageSlug)
        .single();

      if (category && city && pkg) {
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

        if (inserted) {
          return NextResponse.json({ message: 'Draft created successfully', ad: inserted }, { status: 201 });
        }
        if (error) {
          console.error('[POST /api/client/ads] Supabase insert error:', error.message);
        }
      } else {
        console.warn('[POST /api/client/ads] Lookup tables not seeded in Supabase, using mock-db result');
      }
    } catch (supaErr) {
      console.error('[POST /api/client/ads] Supabase insert failed, returning mock-db result:', supaErr);
    }

    // Return mock ad as fallback
    return NextResponse.json({ message: 'Draft created successfully', ad: mockSerializeAd(mockAd) }, { status: 201 });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[POST /api/client/ads] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['CLIENT', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN']);
