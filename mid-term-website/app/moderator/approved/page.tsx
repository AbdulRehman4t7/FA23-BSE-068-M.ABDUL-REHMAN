"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, MapPin, User } from "lucide-react";
import { toast } from "sonner";

export default function ApprovedAdsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/moderator/review-queue?filter=approved", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load approved ads");
        if (!active) return;
        setItems(data.queue || []);
      } catch (e: any) {
        if (active) toast.error(e?.message || "Failed to load approved ads");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardLayout role="moderator">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Approved Ads</h1>
          <p className="text-muted-foreground">
            {isLoading ? "Loading..." : `${items.length} approved ads`}
          </p>
        </div>

        <div className="space-y-4">
          {!isLoading && items.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No approved ads yet.
              </CardContent>
            </Card>
          )}

          {items.map((ad) => (
            <Card key={ad.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  {ad.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground line-clamp-3">{ad.description}</p>
                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{ad.cities?.name || "Unknown city"}</span>
                  <span className="flex items-center gap-1"><User className="h-4 w-4" />{ad.user?.email || "Unknown user"}</span>
                  <span>Reviewed: {ad.reviewed_at ? new Date(ad.reviewed_at).toLocaleString() : "N/A"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
