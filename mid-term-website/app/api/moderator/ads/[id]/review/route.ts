import { NextResponse } from "next/server";
import { withAuth, UserSession } from "@/lib/auth";
import { mockModerateAd, mockSerializeAd } from "@/lib/mock-db";
import { supabase, getSupabaseAdmin } from "@/lib/supabase";

function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !anon || url.includes('your-supabase-url') || anon.includes('your-anon-key');
}

export const PATCH = withAuth(async (req: Request, user: UserSession, context: { params: { id: string } }) => {
  try {
    const resolvedParams = await Promise.resolve(context?.params as any);
    const adId = String(resolvedParams?.id || '').trim();
    if (!adId) {
      return NextResponse.json({ error: 'Invalid ad id' }, { status: 400 });
    }

    const body = await req.json();
    const action = body.action as "approve" | "reject";

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid moderation action' }, { status: 400 });
    }

    if (isDemoMode()) {
      const result = mockModerateAd({
        ad_id: Number(adId),
        actor_id: user.id,
        action,
        note: body.note,
      });

      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ message: "Ad reviewed successfully", ad: mockSerializeAd(result.ad) }, { status: 200 });
    }

    const db = getSupabaseAdmin() ?? supabase;

    const { data: ad, error: adError } = await db
      .from('ads')
      .select('id, status')
      .eq('id', adId)
      .single();

    if (adError) {
      return NextResponse.json({ error: adError.message || 'Failed to load ad' }, { status: 500 });
    }

    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    if (['payment_pending', 'rejected'].includes(String(ad.status || '').toLowerCase())) {
      return NextResponse.json({ error: 'This ad has already been reviewed' }, { status: 409 });
    }

    const nextStatus =
      action === 'approve'
        ? 'payment_pending'
        : 'rejected';

    const nextModerationStatus = action === 'approve' ? 'approved' : 'rejected';

    const { error: updateError } = await db
      .from('ads')
      .update({
        status: nextStatus,
      })
      .eq('id', adId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message || 'Failed to update ad status' }, { status: 500 });
    }

    // Best-effort metadata update for schemas that include moderation columns.
    try {
      await db
        .from('ads')
        .update({
          moderation_status: nextModerationStatus,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_note: action === 'reject' ? body.note || null : null,
        } as any)
        .eq('id', adId);
    } catch {}

    await db.from('ad_status_history').insert({
      ad_id: adId,
      previous_status: ad.status,
      new_status: nextStatus,
      changed_by: user.id,
      note: body.note || `Moderator action: ${action}`,
    });

    return NextResponse.json({ message: 'Ad reviewed successfully' }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}, ["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
