import { NextResponse } from "next/server";
import { withAuth, UserSession } from "@/lib/auth";
import { supabase, getSupabaseAdmin } from "@/lib/supabase";

export const PATCH = withAuth(async (req: Request, user: UserSession, context: { params: { id: string } }) => {
  try {
    const body = await req.json();

    const adId = context.params.id;
    const action = (body.action ?? 'publish') as 'publish' | 'schedule' | 'feature';
    const db = getSupabaseAdmin() ?? supabase;

    const { data: ad, error: adError } = await db
      .from('ads')
      .select('id, status, package_id')
      .eq('id', adId)
      .single();

    if (adError || !ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    if (action === 'feature') {
      const adminBoost = Number(body.admin_boost ?? 20);
      const { error: featureError } = await db
        .from('ads')
        .update({
          admin_boost: adminBoost,
          is_featured: true,
        })
        .eq('id', adId);

      if (featureError) {
        return NextResponse.json({ error: featureError.message || 'Failed to feature ad' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Admin action applied successfully' }, { status: 200 });
    }

    if (action === 'schedule') {
      const scheduledFor = body.scheduled_for ? new Date(body.scheduled_for).toISOString() : null;
      if (!scheduledFor) {
        return NextResponse.json({ error: 'scheduled_for is required' }, { status: 400 });
      }

      const { error: scheduleError } = await db
        .from('ads')
        .update({
          status: 'scheduled',
          scheduled_for: scheduledFor,
          publish_at: null,
        })
        .eq('id', adId);

      if (scheduleError) {
        return NextResponse.json({ error: scheduleError.message || 'Failed to schedule ad' }, { status: 500 });
      }

      await db.from('ad_status_history').insert({
        ad_id: adId,
        previous_status: ad.status,
        new_status: 'scheduled',
        changed_by: user.id,
        note: body.note || 'Admin scheduled ad',
      });

      return NextResponse.json({ message: 'Admin action applied successfully' }, { status: 200 });
    }

    // publish
    const { data: pkg } = await db
      .from('packages')
      .select('duration_days')
      .eq('id', ad.package_id)
      .single();

    const durationDays = Number(pkg?.duration_days ?? 7);
    const now = new Date();
    const expireAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const { error: publishError } = await db
      .from('ads')
      .update({
        status: 'published',
        publish_at: now.toISOString(),
        expire_at: expireAt,
        scheduled_for: null,
      })
      .eq('id', adId);

    if (publishError) {
      return NextResponse.json({ error: publishError.message || 'Failed to publish ad' }, { status: 500 });
    }

    await db.from('ad_status_history').insert({
      ad_id: adId,
      previous_status: ad.status,
      new_status: 'published',
      changed_by: user.id,
      note: body.note || 'Admin published ad',
    });

    return NextResponse.json({ message: 'Admin action applied successfully' }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}, ["ADMIN", "SUPER_ADMIN"]);
