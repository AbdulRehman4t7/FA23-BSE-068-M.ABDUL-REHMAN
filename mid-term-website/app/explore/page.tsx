"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AdCard, type Ad } from "@/components/ad-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, PAKISTAN_CITIES } from "@/lib/constants";
import { Grid3X3, List, Search, SlidersHorizontal } from "lucide-react";

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("all");
  const [sortBy, setSortBy] = useState("rank");
  const [adsList, setAdsList] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    async function fetchAds() {
      setLoading(true);
      setError(false);
      setLoadingTimeout(false);
      const timer = setTimeout(() => setLoadingTimeout(true), 9000);
      try {
        const params = new URLSearchParams();
        if (category !== "all") params.set("category", category);
        if (city !== "all") params.set("city", city);
        if (searchTerm.trim()) params.set("search", searchTerm.trim());
        const res = await fetch(`/api/ads?${params.toString()}`);
        const data = await res.json();
        const mapped = (data.ads || []).map((ad: any) => ({
          id: ad.id,
          slug: ad.slug,
          title: ad.title,
          description: ad.description,
          price: ad.price,
          status: String(ad.status || "published").toLowerCase(),
          is_featured: ad.is_featured,
          city: ad.cities?.name || ad.city?.name || ad.city,
          category: ad.categories?.name || ad.category?.name || ad.category,
          package: ad.packages?.name?.toLowerCase() || "basic",
          media: ad.ad_media,
          seller: {
            name: ad.seller_profiles?.business_name || "Verified seller",
            verified: ad.seller_profiles?.is_verified ?? false,
          },
        }));
        setAdsList(mapped);
      } catch (_error) {
        setAdsList([]);
        setError(true);
      } finally {
        clearTimeout(timer);
        setLoading(false);
      }
    }
    fetchAds();
  }, [searchTerm, category, city]);

  const visibleAds = useMemo(() => {
    const list = [...adsList];
    if (sortBy === "price-low") list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sortBy === "price-high") list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (sortBy === "featured") list.sort((a, b) => Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured)));
    return list;
  }, [adsList, sortBy]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-14">
            <h1 className="text-4xl font-bold">Explore Sponsored Listings</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">Search active ads only. Results prioritize featured inventory, package strength, freshness, admin boost, and verified sellers.</p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search ads, sellers, categories..." className="pl-10" />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger disabled={loading}><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((item) => <SelectItem key={item.slug} value={item.slug}>{item.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger disabled={loading}><SelectValue placeholder="City" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {PAKISTAN_CITIES.map((item) => <SelectItem key={item.slug} value={item.slug}>{item.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger disabled={loading}><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rank">Rank Score</SelectItem>
                  <SelectItem value="featured">Featured First</SelectItem>
                  <SelectItem value="price-low">Price Low to High</SelectItem>
                  <SelectItem value="price-high">Price High to Low</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setViewMode("grid")}><Grid3X3 className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{loading ? "Loading live marketplace results..." : `${visibleAds.length} active ads found`}</p>
            <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              <SlidersHorizontal className="h-3 w-3" />
              Public results exclude expired and unpublished ads
            </div>
          </div>

          <div className={viewMode === "grid" ? "mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3" : "mt-6 space-y-4"}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-[1.8rem] border border-border/70 bg-card/95 overflow-hidden">
                    <div className="aspect-[1.15/0.82] animate-pulse bg-muted" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))
              : visibleAds.map((ad) => <AdCard key={ad.id} ad={ad} />)}
          </div>

          {!loading && error && (
            <div className="mt-8 rounded-3xl border border-dashed border-destructive/40 bg-destructive/5 p-10 text-center">
              <h2 className="text-xl font-semibold">Could not load listings</h2>
              <p className="mt-2 text-muted-foreground">Please try refreshing the page.</p>
              <button onClick={() => window.location.reload()} className="mt-4 text-sm text-primary hover:underline">Refresh</button>
            </div>
          )}

          {!loading && !error && visibleAds.length === 0 && (
            <div className="mt-8 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <h2 className="text-xl font-semibold">No active ads match these filters</h2>
              <p className="mt-2 text-muted-foreground">Try a different category, city, or search phrase.</p>
              <button
                onClick={() => { setCategory("all"); setCity("all"); setSearchTerm(""); setSortBy("rank"); }}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
