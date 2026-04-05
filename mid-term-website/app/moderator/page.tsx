"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, ShieldCheck } from "lucide-react";

const ADS_SYNC_KEY = "adflow:ads-updated";

type QueueStats = {
  pending: number;
  approved: number;
  rejected: number;
};

export default function ModeratorPage() {
  const [stats, setStats] = useState<QueueStats>({ pending: 0, approved: 0, rejected: 0 });
  const [recentPending, setRecentPending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setIsLoading(true);
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          fetch("/api/moderator/review-queue?filter=pending", { cache: "no-store" }),
          fetch("/api/moderator/review-queue?filter=approved", { cache: "no-store" }),
          fetch("/api/moderator/review-queue?filter=rejected", { cache: "no-store" }),
        ]);

        const pendingData = await pendingRes.json();
        const approvedData = await approvedRes.json();
        const rejectedData = await rejectedRes.json();

        if (!active) return;

        setStats({
          pending: (pendingData.queue || []).length,
          approved: (approvedData.queue || []).length,
          rejected: (rejectedData.queue || []).length,
        });

        setRecentPending((pendingData.queue || []).slice(0, 5));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();

    const intervalId = window.setInterval(load, 3000);
    const onFocus = () => load();
    const onStorage = (event: StorageEvent) => {
      if (event.key === ADS_SYNC_KEY) load();
    };
    const onAdsUpdated = () => load();

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    window.addEventListener(ADS_SYNC_KEY, onAdsUpdated as EventListener);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(ADS_SYNC_KEY, onAdsUpdated as EventListener);
    };
  }, []);

  return (
    <DashboardLayout role="moderator">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Moderator Dashboard</h1>
            <p className="text-muted-foreground">
              Review user-submitted ads and keep marketplace quality high.
            </p>
          </div>
          <Button asChild>
            <Link href="/moderator/review">
              Open Pending Queue <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <Clock className="h-10 w-10 rounded-2xl bg-amber-500/10 p-2 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{isLoading ? "..." : stats.pending}</p>
                <p className="text-sm text-muted-foreground">Draft + Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <CheckCircle2 className="h-10 w-10 rounded-2xl bg-emerald-500/10 p-2 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{isLoading ? "..." : stats.approved}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <AlertTriangle className="h-10 w-10 rounded-2xl bg-red-500/10 p-2 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{isLoading ? "..." : stats.rejected}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <ShieldCheck className="h-10 w-10 rounded-2xl bg-primary/10 p-2 text-primary" />
              <div>
                <p className="text-2xl font-bold">Secure</p>
                <p className="text-sm text-muted-foreground">Role protected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Pending Ads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isLoading && recentPending.length === 0 && (
              <p className="text-sm text-muted-foreground">No pending ads right now.</p>
            )}
            {recentPending.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 rounded-2xl border border-border p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.categories?.name} • {item.cities?.name}
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/moderator/review">Review</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Approved History</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/moderator/approved">View Approved Ads</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rejected History</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/moderator/rejected">View Rejected Ads</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
