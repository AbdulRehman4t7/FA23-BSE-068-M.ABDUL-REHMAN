import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAnalyticsSummary } from "@/lib/mock-db";

export default function AdminAnalyticsPage() {
  const summary = mockAnalyticsSummary();

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Marketplace KPIs, moderation throughput, and geo/category distribution.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card><CardHeader><CardTitle>Total Ads</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{summary.totalAds}</CardContent></Card>
          <Card><CardHeader><CardTitle>Published</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{summary.publishedAds}</CardContent></Card>
          <Card><CardHeader><CardTitle>Revenue</CardTitle></CardHeader><CardContent className="text-3xl font-bold">PKR {summary.totalRevenue.toLocaleString()}</CardContent></Card>
          <Card><CardHeader><CardTitle>Approval Rate</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{summary.approvalRate}%</CardContent></Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Ads by Category</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {summary.adsByCategory.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <span>{item.name}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Ads by City</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {summary.adsByCity.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <span>{item.name}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
