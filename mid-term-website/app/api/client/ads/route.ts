import { NextResponse } from 'next/server';
import { withAuth, UserSession } from '@/lib/auth';
import { createAdSchema } from '@/lib/validations/ad';
import { mockCreateAdDraft, mockListClientDashboard, mockSerializeAd } from '@/lib/mock-db';

export const dynamic = 'force-dynamic';

export const GET = withAuth(async (_req: Request, user: UserSession) => {
  const dashboard = mockListClientDashboard({ user_id: user.id });
  return NextResponse.json({ ads: dashboard.ads.map(mockSerializeAd) }, { status: 200 });
}, ['CLIENT', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN']);

export const POST = withAuth(async (req: Request, user: UserSession) => {
  try {
    const body = await req.json();
    const data = createAdSchema.parse(body);
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
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['CLIENT', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN']);
