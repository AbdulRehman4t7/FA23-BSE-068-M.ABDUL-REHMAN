"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, CheckCircle2, CreditCard, TrendingUp } from "lucide-react";

type Summary = {
  totalAds: number;
  publishedAds: number;
  totalRevenue: number;
  paymentQueue: number;
  approvalRate: number;
  adsByCategory: Array<{ name: string; count: number }>;
  adsByCity: Array<{ name: string; count: number }>;
};

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/analytics/summary", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load analytics");
        }

        if (!active) return;
        setSummary(data.summary || null);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "Failed to load analytics");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const kpis = useMemo(
    () => [
      {
        label: "Total Ads",
        value: summary?.totalAds ?? 0,
        icon: BarChart3,
        color: "text-primary",
        bg: "bg-primary/10",
      },
      {
        label: "Published",
        value: summary?.publishedAds ?? 0,
        icon: CheckCircle2,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      },
      {
        label: "Revenue",
        value: `PKR ${(summary?.totalRevenue ?? 0).toLocaleString()}`,
        icon: CreditCard,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
      },
      {
        label: "Approval Rate",
        value: `${summary?.approvalRate ?? 0}%`,
        icon: TrendingUp,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
      },
    ],
    [summary]
  );

  const maxCategory = Math.max(...(summary?.adsByCategory || []).map((i) => i.count), 1);
  const maxCity = Math.max(...(summary?.adsByCity || []).map((i) => i.count), 1);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Marketplace KPIs and distribution insights powered by Supabase data.
          </p>
        </div>

        {error && (
          <Card>
            <CardContent className="p-5 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${kpi.bg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{isLoading ? "..." : kpi.value}</p>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ads by Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(summary?.adsByCategory || []).map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${(item.count / maxCategory) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {!isLoading && !(summary?.adsByCategory || []).length && (
                <p className="text-sm text-muted-foreground">No category data available.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ads by City</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(summary?.adsByCity || []).map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${(item.count / maxCity) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {!isLoading && !(summary?.adsByCity || []).length && (
                <p className="text-sm text-muted-foreground">No city data available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
