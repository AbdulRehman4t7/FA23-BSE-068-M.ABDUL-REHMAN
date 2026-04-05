"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, CreditCard, FileText, Users } from "lucide-react";

type OverviewStats = {
  totalUsers: number;
  totalAds: number;
  pendingAds: number;
  approvedAds: number;
  rejectedAds: number;
  activeAds: number;
};

export default function AdminPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [paymentQueue, setPaymentQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setIsLoading(true);
        setError("");

        const [overviewRes, queueRes] = await Promise.all([
          fetch("/api/admin/overview", { cache: "no-store" }),
          fetch("/api/admin/payment-queue", { cache: "no-store" }),
        ]);

        const overviewData = await overviewRes.json();
        const queueData = await queueRes.json();

        if (!overviewRes.ok) {
          throw new Error(overviewData.error || "Failed to load admin stats");
        }

        if (!queueRes.ok) {
          throw new Error(queueData.error || "Failed to load payment queue");
        }

        if (!active) return;
        setStats(overviewData.stats);
        setPaymentQueue(queueData.queue || []);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "Unable to load dashboard right now.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo(
    () => [
      { label: "Total Ads", value: stats?.totalAds ?? 0, icon: FileText },
      { label: "Active Ads", value: stats?.activeAds ?? 0, icon: BarChart3 },
      { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users },
      { label: "Pending Ads", value: stats?.pendingAds ?? 0, icon: CreditCard },
    ],
    [stats]
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Secure operational summary with role-based controls and live Supabase data.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin/analytics">Analytics</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/payments">
                Verify Payments <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {error && (
          <Card>
            <CardContent className="p-5 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{isLoading ? "..." : card.value}</p>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!isLoading && paymentQueue.length === 0 && (
                <p className="text-sm text-muted-foreground">No pending payments.</p>
              )}
              {paymentQueue.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-2xl border border-border p-4">
                  <div>
                    <p className="font-semibold">{payment.ad?.title || "Untitled ad"}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.sender_name} • {payment.transaction_ref}
                    </p>
                  </div>
                  <span className="font-semibold">PKR {Number(payment.amount || 0).toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Moderation Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-border p-4">
                <span>Approved Ads</span>
                <strong>{isLoading ? "..." : stats?.approvedAds ?? 0}</strong>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border p-4">
                <span>Rejected Ads</span>
                <strong>{isLoading ? "..." : stats?.rejectedAds ?? 0}</strong>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border p-4">
                <span>Review Queue</span>
                <Link href="/moderator/review" className="font-semibold text-primary hover:underline">
                  Open moderation
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
