"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge, type AdStatus } from "@/components/status-badge";
import { PackageBadge, type PackageType } from "@/components/package-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Eye, Send, CreditCard, Clock } from "lucide-react";

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

function mergeById<T extends { id: number }>(existing: T[], incoming: T[]) {
  const byId = new Map<number, T>();
  for (const item of existing || []) byId.set(item.id, item);
  for (const item of incoming || []) byId.set(item.id, item);
  return Array.from(byId.values());
}

type DashboardAd = {
  id: number;
  slug?: string;
  title: string;
  status: AdStatus;
  package: PackageType;
  views: number;
  createdAt: string;
  expiresAt: string;
  category: string;
  city: string;
};

export default function AdsPage() {
  const [adsList, setAdsList] = useState<DashboardAd[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadAds() {
    setLoading(true);
    try {
      const res = await fetch("/api/client/dashboard", {
        cache: "no-store",
        next: { revalidate: 0 },
      });
      if (res.status === 401) {
        setAdsList([]);
        return;
      }
      const json = await res.json();
      const mapped: any[] = (json.ads || [])
        .map((ad: any) => ({
          id: ad.id,
          slug: ad.slug,
          title: ad.title,
          status: String(ad.status || "draft").toLowerCase(),
          package: (ad.packages?.name?.toLowerCase() || "basic") as PackageType,
          views: ad.views ?? 0,
          createdAt: ad.created_at ? new Date(ad.created_at).toLocaleDateString() : "-",
          expiresAt: ad.expire_at ? new Date(ad.expire_at).toLocaleDateString() : "-",
          category: ad.categories?.name || "Unknown",
          city: ad.cities?.name || "Unknown",
          _createdAtRaw: ad.created_at || null,
        }))
        .sort((a: any, b: any) => {
          const aTime = a._createdAtRaw ? new Date(a._createdAtRaw).getTime() : 0;
          const bTime = b._createdAtRaw ? new Date(b._createdAtRaw).getTime() : 0;
          return bTime - aTime;
        });
      setAdsList((prev) => {
        const merged = mergeById(prev, mapped as any);
        return merged.sort((a: any, b: any) => {
          const aTime = (a as any)._createdAtRaw ? new Date((a as any)._createdAtRaw).getTime() : 0;
          const bTime = (b as any)._createdAtRaw ? new Date((b as any)._createdAtRaw).getTime() : 0;
          return bTime - aTime;
        });
      });
    } finally {
      setLoading(false);
    }
  }

  function prependOptimistic(ad: any) {
    if (!ad?.id) return;
    const mapped: any = {
      id: ad.id,
      slug: ad.slug,
      title: ad.title,
      status: String(ad.status || "draft").toLowerCase(),
      package: (ad.packages?.name?.toLowerCase() || "basic") as PackageType,
      views: ad.views ?? 0,
      createdAt: ad.created_at ? new Date(ad.created_at).toLocaleDateString() : "-",
      expiresAt: ad.expire_at ? new Date(ad.expire_at).toLocaleDateString() : "-",
      category: ad.categories?.name || "Unknown",
      city: ad.cities?.name || "Unknown",
      _createdAtRaw: ad.created_at || null,
    };
    setAdsList((prev: any) => {
      const merged = mergeById([mapped], prev || []);
      return merged.sort((a: any, b: any) => {
        const aTime = a._createdAtRaw ? new Date(a._createdAtRaw).getTime() : 0;
        const bTime = b._createdAtRaw ? new Date(b._createdAtRaw).getTime() : 0;
        return bTime - aTime;
      });
    });
  }

  useEffect(() => {
    const initialOptimistic = readLastCreatedAd();
    if (initialOptimistic) prependOptimistic(initialOptimistic);
    loadAds();

    const intervalId = window.setInterval(loadAds, 3000);
    const onStorage = (event: StorageEvent) => {
      if (event.key === ADS_SYNC_KEY) {
        const optimistic = readLastCreatedAd();
        if (optimistic) prependOptimistic(optimistic);
        loadAds();
      }
    };
    const onAdsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<any>)?.detail;
      const optimistic = detail?.ad ?? readLastCreatedAd();
      if (optimistic) prependOptimistic(optimistic);
      loadAds();
    };
    const onFocus = () => loadAds();

    window.addEventListener("storage", onStorage);
    window.addEventListener(ADS_SYNC_KEY, onAdsUpdated as EventListener);
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(ADS_SYNC_KEY, onAdsUpdated as EventListener);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const filteredAds = useMemo(
    () => adsList.filter((ad) => ad.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [adsList, searchQuery]
  );

  async function transition(id: number, status: "SUBMITTED") {
    await fetch(`/api/client/ads/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    loadAds();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Ads</h1>
            <p className="text-muted-foreground">Track every ad from draft to expiry with workflow-safe actions.</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/ads/new"><Plus className="mr-2 h-4 w-4" />Create Ad</Link>
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search your ads" className="pl-10" />
        </div>

        <div className="space-y-4">
          {loading && (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
          {!loading && filteredAds.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <Plus className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-semibold">No ads yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">Create your first listing to get started.</p>
                </div>
                <Button asChild>
                  <Link href="/dashboard/ads/new">Create your first listing</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {!loading && filteredAds.map((ad) => (
            <Card key={ad.id}>
              <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold">{ad.title}</h2>
                    <StatusBadge status={ad.status} />
                    <PackageBadge packageType={ad.package} />
                  </div>
                  <p className="text-sm text-muted-foreground">{ad.category} • {ad.city}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{ad.views} views</span>
                    <span>Created: {ad.createdAt}</span>
                    <span>Expires: {ad.expiresAt}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {ad.status === "draft" && (
                    <Button variant="outline" onClick={() => transition(ad.id, "SUBMITTED")}>
                      <Send className="mr-2 h-4 w-4" />
                      Submit for Review
                    </Button>
                  )}
                  {ad.status === "payment_pending" && (
                    <Button asChild variant="outline">
                      <Link href="/dashboard/payments">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Submit Payment
                      </Link>
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/ads/${ad.slug ?? ad.id}`}><Eye className="mr-2 h-4 w-4" />View public page</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem><Clock className="mr-2 h-4 w-4" />Workflow timeline</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
