import { NextResponse } from "next/server";
import { withAuth, UserSession } from "@/lib/auth";
import { supabase, getSupabaseAdmin } from "@/lib/supabase";

export const GET = withAuth(async (_req: Request, _user: UserSession) => {
  const db = getSupabaseAdmin() ?? supabase;

  const { data: payments, error } = await db
    .from('payments')
    .select('*, ads(id, title, status, packages(name))')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch payment queue' }, { status: 500 });
  }

  const queue = (payments || []).map((p: any) => ({
    ...p,
    ad: p.ads,
  }));

  const { data: processedPayments, error: processedError } = await db
    .from('payments')
    .select('id, ad_id, amount, sender_name, transaction_ref, status, created_at, ads(id, title, status, packages(name))')
    .in('status', ['verified', 'rejected'])
    .order('created_at', { ascending: false })
    .limit(10);

  if (processedError) {
    return NextResponse.json({ error: processedError.message || 'Failed to fetch processed payments' }, { status: 500 });
  }

  const recentProcessed = (processedPayments || []).map((p: any) => ({
    ...p,
    ad: p.ads,
  }));

  const { data: allPayments, error: summaryError } = await db
    .from('payments')
    .select('status, amount');

  if (summaryError) {
    return NextResponse.json({ error: summaryError.message || 'Failed to build payment summary' }, { status: 500 });
  }

  const summary = (allPayments || []).reduce(
    (acc: any, item: any) => {
      const normalized = String(item.status || '').toLowerCase();
      const amount = Number(item.amount || 0);

      acc.totalCount += 1;
      acc.totalAmount += amount;

      if (normalized === 'verified') {
        acc.verifiedCount += 1;
        acc.verifiedAmount += amount;
      } else if (normalized === 'pending') {
        acc.pendingCount += 1;
        acc.pendingAmount += amount;
      } else if (normalized === 'rejected') {
        acc.rejectedCount += 1;
        acc.rejectedAmount += amount;
      }

      return acc;
    },
    {
      totalCount: 0,
      totalAmount: 0,
      verifiedCount: 0,
      verifiedAmount: 0,
      pendingCount: 0,
      pendingAmount: 0,
      rejectedCount: 0,
      rejectedAmount: 0,
    }
  );

  return NextResponse.json({ queue, summary, recentProcessed }, { status: 200 });
}, ["ADMIN", "SUPER_ADMIN"]);
