import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAuth, UserSession } from '@/lib/auth';

export const PATCH = withAuth(async (req: Request, user: UserSession, context: { params: { id: string } }) => {
  try {
    const adId = context.params.id;
    const body = await req.json();

    const { data: ad, error: adError } = await supabase
      .from('ads')
      .select('status, packages(duration_days)')
      .eq('id', adId)
      .single();

    if (adError || !ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    if (ad.status !== 'PAYMENT_VERIFIED') {
      return NextResponse.json({ error: 'Ad payment is not verified' }, { status: 400 });
    }

    const durationDays = (ad.packages as any)?.duration_days || 7;
    
    const publishAt = new Date();
    const expireAt = new Date();
    expireAt.setDate(publishAt.getDate() + durationDays);

    const { error: updateError } = await supabase
      .from('ads')
      .update({
        status: 'PUBLISHED',
        publish_at: publishAt.toISOString(),
        expire_at: expireAt.toISOString(),
      })
      .eq('id', adId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to publish ad' }, { status: 500 });
    }

    // Log history
    await supabase.from('ad_status_history').insert({
      ad_id: adId,
      previous_status: ad.status,
      new_status: 'PUBLISHED',
      changed_by: user.id,
      note: 'Admin published ad',
    });

    return NextResponse.json({ message: 'Ad published successfully', expiresAt: expireAt }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['ADMIN', 'SUPER_ADMIN']);
