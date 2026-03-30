import Link from "next/link";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockAnalyticsSummary, mockListPaymentQueue } from "@/lib/mock-db";
import { ArrowRight, BarChart3, CreditCard, FileText, Users } from "lucide-react";

export default function AdminPage() {
  const summary = mockAnalyticsSummary();
  const paymentQueue = mockListPaymentQueue().slice(0, 4);

  const stats = [
    { label: "Total Ads", value: summary.totalAds, icon: FileText },
    { label: "Published", value: summary.publishedAds, icon: BarChart3 },
    { label: "Revenue", value: `PKR ${summary.totalRevenue.toLocaleString()}`, icon: CreditCard },
    { label: "Payment Queue", value: summary.paymentQueue, icon: Users },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Operational summary for payment verification, publication control, analytics, and user oversight.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild><Link href="/admin/analytics">Analytics</Link></Button>
            <Button asChild><Link href="/admin/payments">Verify Payments <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}><CardContent className="flex items-center gap-4 p-6"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10"><stat.icon className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{stat.value}</p><p className="text-sm text-muted-foreground">{stat.label}</p></div></CardContent></Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Pending Payments</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {paymentQueue.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-2xl border border-border p-4">
                  <div>
                    <p className="font-semibold">{payment.ad?.title}</p>
                    <p className="text-sm text-muted-foreground">{payment.sender_name} • {payment.transaction_ref}</p>
                  </div>
                  <span className="font-semibold">PKR {Number(payment.amount).toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>System Health</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-border p-4"><span>Latest DB latency</span><strong>{summary.health?.db_latency_ms ?? 0} ms</strong></div>
              <div className="flex items-center justify-between rounded-2xl border border-border p-4"><span>Moderation queue</span><strong>{summary.moderationQueue}</strong></div>
              <div className="flex items-center justify-between rounded-2xl border border-border p-4"><span>Health status</span><strong className="capitalize">{summary.health?.status ?? "healthy"}</strong></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
