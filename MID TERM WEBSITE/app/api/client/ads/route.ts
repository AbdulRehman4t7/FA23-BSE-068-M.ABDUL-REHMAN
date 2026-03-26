import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAuth, UserSession } from '@/lib/auth';
import { createAdSchema } from '@/lib/validations/ad';
import { mockCreateAdDraft } from '@/lib/mock-db';

function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !anon || url.includes('your-supabase-url') || anon.includes('your-anon-key');
}

export const POST = withAuth(async (req: Request, user: UserSession) => {
  try {
    const body = await req.json();
    const validatedData = createAdSchema.parse(body);

    if (isDemoMode()) {
      const created = mockCreateAdDraft({
        user_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        category_id: validatedData.category_id,
        city_id: validatedData.city_id,
        package_id: validatedData.package_id,
        mediaUrls: validatedData.mediaUrls,
      });

      return NextResponse.json(
        { message: 'Ad created successfully', adId: created.id, slug: created.slug },
        { status: 201 }
      );
    }

    // Generate Slug roughly
    const slug = validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    const { data: newAd, error } = await supabase
      .from('ads')
      .insert({
        user_id: user.id,
        title: validatedData.title,
        slug,
        description: validatedData.description,
        category_id: validatedData.category_id,
        city_id: validatedData.city_id,
        package_id: validatedData.package_id,
        status: 'DRAFT',
      })
      .select('id')
      .single();

    if (error || !newAd) {
      return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 });
    }

    if (validatedData.mediaUrls && validatedData.mediaUrls.length > 0) {
      const mediaInserts = validatedData.mediaUrls.map(url => ({
        ad_id: newAd.id,
        source_type: url.includes('youtube.com') || url.includes('youtu.be') ? 'YOUTUBE' : 'IMAGE',
        original_url: url,
        validation_status: 'PENDING',
      }));

      await supabase.from('ad_media').insert(mediaInserts);
    }

    return NextResponse.json({ message: 'Ad created successfully', adId: newAd.id }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['CLIENT', 'ADMIN', 'MODERATOR']);
