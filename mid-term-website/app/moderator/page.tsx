import Link from "next/link";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockListModeratorQueue } from "@/lib/mock-db";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, ShieldCheck } from "lucide-react";

export default function ModeratorPage() {
  const queue = mockListModeratorQueue();
  const approved = Math.max(0, 16 - queue.length);

  return (
    <DashboardLayout role="moderator">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Moderator Dashboard</h1>
            <p className="text-muted-foreground">Review submissions, flag suspicious content, and push approved ads into payment workflow.</p>
          </div>
          <Button asChild><Link href="/moderator/review">Start Reviewing <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card><CardContent className="flex items-center gap-4 p-6"><Clock className="h-10 w-10 rounded-2xl bg-amber-500/10 p-2 text-amber-500" /><div><p className="text-2xl font-bold">{queue.length}</p><p className="text-sm text-muted-foreground">Pending review</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6"><CheckCircle2 className="h-10 w-10 rounded-2xl bg-emerald-500/10 p-2 text-emerald-500" /><div><p className="text-2xl font-bold">{approved}</p><p className="text-sm text-muted-foreground">Approved today</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6"><AlertTriangle className="h-10 w-10 rounded-2xl bg-orange-500/10 p-2 text-orange-500" /><div><p className="text-2xl font-bold">{queue.filter((item) => item.status === "UNDER_REVIEW").length}</p><p className="text-sm text-muted-foreground">Flagged</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6"><ShieldCheck className="h-10 w-10 rounded-2xl bg-primary/10 p-2 text-primary" /><div><p className="text-2xl font-bold">RBAC</p><p className="text-sm text-muted-foreground">Moderator-protected</p></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Current Queue</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {queue.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 rounded-2xl border border-border p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.categories?.name} • {item.cities?.name} • Rank {item.rank_score}</p>
                </div>
                <span className="text-sm text-muted-foreground">{item.status.replaceAll("_", " ")}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
