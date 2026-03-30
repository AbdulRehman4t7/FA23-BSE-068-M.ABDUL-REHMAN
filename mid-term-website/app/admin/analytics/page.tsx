import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAnalyticsSummary } from "@/lib/mock-db";
import { BarChart3, CheckCircle2, CreditCard, TrendingUp } from "lucide-react";

export default function AdminAnalyticsPage() {
  const summary = mockAnalyticsSummary();

  const kpis = [
    { label: "Total Ads", value: summary.totalAds, icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
    { label: "Published", value: summary.publishedAds, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Revenue", value: `PKR ${summary.totalRevenue.toLocaleString()}`, icon: CreditCard, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Approval Rate", value: `${summary.approvalRate}%`, icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  ];

  const maxCategory = Math.max(...summary.adsByCategory.map((i: any) => i.count), 1);
  const maxCity = Math.max(...summary.adsByCity.map((i: any) => i.count), 1);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Marketplace KPIs, moderation throughput, and geo/category distribution.</p>
        </div>

        {/* KPI stat cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${kpi.bg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Ads by Category bar chart */}
          <Card>
            <CardHeader><CardTitle>Ads by Category</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {summary.adsByCategory.map((item: any) => (
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
            </CardContent>
          </Card>

          {/* Ads by City bar chart */}
          <Card>
            <CardHeader><CardTitle>Ads by City</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {summary.adsByCity.map((item: any) => (
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
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
