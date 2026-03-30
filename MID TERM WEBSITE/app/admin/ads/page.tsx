"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { mockListAllAds } from "@/lib/mock-db";
import { CalendarClock, Rocket, Search, Sparkles } from "lucide-react";

export default function AdminAdsPage() {
  const [query, setQuery] = useState("");
  const ads = mockListAllAds();

  const actionable = useMemo(
    () => ads.filter((ad) => ["PAYMENT_VERIFIED", "SCHEDULED", "PUBLISHED"].includes(ad.status) && ad.title.toLowerCase().includes(query.toLowerCase())),
    [ads, query]
  );

  async function handleAction(adId: number, action: "publish" | "schedule" | "feature") {
    await fetch(`/api/admin/ads/${adId}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        scheduled_for: action === "schedule" ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined,
        admin_boost: action === "feature" ? 20 : undefined,
      }),
    });
    location.reload();
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Ad Controls</h1>
          <p className="text-muted-foreground">Publish verified ads, schedule campaigns, and apply featured boosts.</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ads ready for action" className="pl-10" />
        </div>

        <div className="space-y-4">
          {actionable.map((ad) => (
            <Card key={ad.id}>
              <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-semibold">{ad.title}</p>
                    <StatusBadge status={ad.status.toLowerCase() as any} />
                  </div>
                  <p className="text-sm text-muted-foreground">{ad.categories?.name} • {ad.cities?.name} • Rank {ad.rank_score}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => handleAction(ad.id, "publish")}><Rocket className="mr-2 h-4 w-4" />Publish</Button>
                  <Button variant="outline" onClick={() => handleAction(ad.id, "schedule")}><CalendarClock className="mr-2 h-4 w-4" />Schedule</Button>
                  <Button variant="outline" onClick={() => handleAction(ad.id, "feature")}><Sparkles className="mr-2 h-4 w-4" />Feature</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!actionable.length && <Card><CardContent className="p-8 text-center text-muted-foreground">No ads currently match admin action filters.</CardContent></Card>}
        </div>
      </div>
    </DashboardLayout>
  );
}
