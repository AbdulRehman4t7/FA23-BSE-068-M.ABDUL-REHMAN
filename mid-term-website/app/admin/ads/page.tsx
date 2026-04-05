"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ADS_SYNC_KEY = "adflow:ads-updated";
const LAST_CREATED_AD_KEY = "adflow:last-created-ad";

function readLastCreatedAd(): any | null {
  try {
    const raw = localStorage.getItem(LAST_CREATED_AD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function mergeById(existing: any[], incoming: any[]) {
  const byId = new Map<string, any>();
  for (const item of existing || []) byId.set(String(item.id), item);
  for (const item of incoming || []) byId.set(String(item.id), item);
  return Array.from(byId.values());
}

const statusOptions = [
  "all",
  "submitted",
  "under_review",
  "payment_pending",
  "payment_submitted",
  "payment_verified",
  "scheduled",
  "published",
  "rejected",
  "archived",
  "expired",
  "draft",
];

export default function AdminAdsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ads, setAds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  async function loadAds() {
    try {
      setIsLoading(true);
      const qs = statusFilter !== "all" ? `?status=${encodeURIComponent(statusFilter)}` : "";
      const res = await fetch(`/api/admin/ads${qs}`, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load ads");
      }

      setAds((prev) => {
        const merged = mergeById(prev, data.ads || []);
        return merged.sort((a: any, b: any) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        });
      });
    } catch (e: any) {
      toast.error(e?.message || "Failed to load ads");
    } finally {
      setIsLoading(false);
    }
  }

  function prependOptimistic(ad: any) {
    if (!ad?.id) return;
    const adStatus = String(ad.status || "draft");
    if (statusFilter !== "all" && adStatus !== statusFilter) return;
    setAds((prev) => {
      const merged = mergeById([ad], prev || []);
      return merged.sort((a: any, b: any) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      });
    });
  }

  useEffect(() => {
    let active = true;

    const runLoad = async () => {
      if (!active) return;
      await loadAds();
    };

    runLoad();

    const intervalId = window.setInterval(runLoad, 3000);
    const onFocus = () => runLoad();
    const onStorage = (event: StorageEvent) => {
      if (event.key === ADS_SYNC_KEY) {
        const optimistic = readLastCreatedAd();
        if (optimistic) prependOptimistic(optimistic);
        runLoad();
      }
    };
    const onAdsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<any>)?.detail;
      const optimistic = detail?.ad ?? readLastCreatedAd();
      if (optimistic) prependOptimistic(optimistic);
      runLoad();
    };

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
  }, [statusFilter]);

  const filtered = useMemo(() => {
    return ads.filter((ad) => {
      const haystack = [ad.title, ad.categories?.name, ad.cities?.name, ad.status]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [ads, query]);

  async function updateStatus(adId: string, status: string) {
    try {
      setIsSaving(adId);
      const res = await fetch(`/api/admin/ads/${adId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update ad");
      }

      toast.success("Ad updated");
      setAds((prev) => prev.map((ad) => (ad.id === adId ? { ...ad, status } : ad)));
    } catch (e: any) {
      toast.error(e?.message || "Failed to update ad");
    } finally {
      setIsSaving(null);
    }
  }

  async function deleteAd(adId: string) {
    try {
      setIsSaving(adId);
      const res = await fetch(`/api/admin/ads/${adId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete ad");
      }

      toast.success("Ad deleted");
      setAds((prev) => prev.filter((ad) => ad.id !== adId));
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete ad");
    } finally {
      setIsSaving(null);
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Ads Management</h1>
          <p className="text-muted-foreground">
            Review all listings, update statuses, and remove problematic ads.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ads"
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === "all" ? "All statuses" : status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Ads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isLoading && filtered.length === 0 && (
              <div className="rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">
                No ads found.
              </div>
            )}

            {filtered.map((ad) => {
              const disabled = isSaving === ad.id;

              return (
                <div
                  key={ad.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold">{ad.title || "Untitled"}</p>
                      <StatusBadge status={String(ad.status || "draft").toLowerCase() as any} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {ad.categories?.name || "Unknown category"} • {ad.cities?.name || "Unknown city"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={String(ad.status || "draft")}
                      onValueChange={(status) => updateStatus(ad.id, status)}
                    >
                      <SelectTrigger className="w-[180px]" disabled={disabled}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions
                          .filter((s) => s !== "all")
                          .map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    <Button variant="destructive" size="icon" disabled={disabled} onClick={() => deleteAd(ad.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
