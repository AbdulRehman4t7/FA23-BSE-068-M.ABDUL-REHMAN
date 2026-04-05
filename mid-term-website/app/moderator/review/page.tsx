"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle2, MapPin, User, XCircle } from "lucide-react";

const allowedFilters = new Set(["pending", "approved", "rejected"]);
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

function matchesQueueFilter(ad: any, filter: string) {
  const status = String(ad?.status || "").toLowerCase();
  if (filter === "approved") return status === "payment_pending";
  if (filter === "rejected") return status === "rejected";
  return ["draft", "submitted", "under_review"].includes(status);
}

function mergeQueue(existing: any[], incoming: any[]) {
  const byId = new Map<string, any>();
  for (const item of incoming || []) byId.set(String(item.id), item);
  for (const item of existing || []) {
    if (!byId.has(String(item.id))) byId.set(String(item.id), item);
  }
  return Array.from(byId.values()).sort((a: any, b: any) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
}

export default function ReviewPage() {
  const [filter, setFilter] = useState("pending");

  const [queue, setQueue] = useState<any[]>([]);
  const [selectedAd, setSelectedAd] = useState<any | null>(null);
  const [note, setNote] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadQueue() {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/moderator/review-queue?filter=${filter}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load queue");

      const optimistic = readLastCreatedAd();
      const incoming = data.queue || [];
      const merged = optimistic && matchesQueueFilter(optimistic, filter)
        ? mergeQueue([optimistic], incoming)
        : incoming;

      setQueue(merged);
      setSelectedAd((prev: any) => {
        if (!prev) return merged?.[0] || null;
        return (merged || []).find((ad: any) => ad.id === prev.id) || merged?.[0] || null;
      });
    } catch (e: any) {
      toast.error(e?.message || "Failed to load queue");
    } finally {
      setIsLoading(false);
    }
  }

  function prependOptimistic(ad: any) {
    if (!ad?.id) return;
    if (!matchesQueueFilter(ad, filter)) return;
    setQueue((prev) => mergeQueue([ad], prev || []));
    setSelectedAd((prev: any) => prev || ad);
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const value = new URLSearchParams(window.location.search).get('filter');
      setFilter(allowedFilters.has(String(value)) ? String(value) : 'pending');
    }
  }, []);

  useEffect(() => {
    setNote("");
    setRejectOpen(false);
    setConfirmOpen(false);
    loadQueue();

    const intervalId = window.setInterval(loadQueue, 3000);
    const onFocus = () => loadQueue();
    const onStorage = (event: StorageEvent) => {
      if (event.key === ADS_SYNC_KEY) {
        const optimistic = readLastCreatedAd();
        if (optimistic) prependOptimistic(optimistic);
        loadQueue();
      }
    };
    const onAdsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<any>)?.detail;
      const optimistic = detail?.ad ?? readLastCreatedAd();
      if (optimistic) prependOptimistic(optimistic);
      loadQueue();
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    window.addEventListener(ADS_SYNC_KEY, onAdsUpdated as EventListener);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(ADS_SYNC_KEY, onAdsUpdated as EventListener);
    };
  }, [filter]);

  const heading = useMemo(() => {
    if (filter === "approved") return "Approved Ads";
    if (filter === "rejected") return "Rejected Ads";
    return "Pending Ads";
  }, [filter]);

  async function moderate(action: "approve" | "reject") {
    if (!selectedAd) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/moderator/ads/${selectedAd.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: note || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to moderate ad");
      }

      toast.success(action === "approve" ? "Ad approved" : "Ad rejected");
      setNote("");
      setRejectOpen(false);
      setConfirmOpen(false);
      await loadQueue();
    } catch (e: any) {
      toast.error(e?.message || "Failed to moderate ad");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardLayout role="moderator">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{heading}</h1>
          <p className="text-muted-foreground">
            {isLoading ? "Loading..." : `${queue.length} ads in this view`}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!isLoading && queue.length === 0 && (
                <p className="text-sm text-muted-foreground">No ads found.</p>
              )}

              {queue.map((ad) => (
                <button
                  key={ad.id}
                  type="button"
                  onClick={() => setSelectedAd(ad)}
                  className={`w-full rounded-xl border p-3 text-left transition ${selectedAd?.id === ad.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}
                >
                  <p className="font-semibold line-clamp-1">{ad.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {ad.user?.email || ad.seller_profiles?.display_name || "Unknown user"}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          {!selectedAd ? (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                Select an ad to review.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="space-y-5 p-6">
                <div>
                  <h2 className="text-2xl font-semibold">{selectedAd.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{selectedAd.cities?.name || "Unknown city"}</span>
                    <span>{selectedAd.categories?.name || "Unknown category"}</span>
                    <span>Created: {new Date(selectedAd.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <p className="whitespace-pre-wrap text-muted-foreground">{selectedAd.description}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(selectedAd.ad_media || []).slice(0, 4).map((media: any) => (
                    <img
                      key={media.id}
                      src={media.thumbnail_url || media.original_url}
                      alt={selectedAd.title}
                      className="h-40 w-full rounded-xl border border-border object-cover"
                    />
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">User Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="flex items-center gap-2 font-medium"><User className="h-4 w-4" />{selectedAd.user?.name || selectedAd.seller_profiles?.display_name || "Unknown"}</p>
                    <p className="text-muted-foreground">{selectedAd.user?.email || "No email"}</p>
                    <p className="text-muted-foreground">{selectedAd.seller_profiles?.business_name || "No business profile"}</p>
                  </CardContent>
                </Card>

                {filter === "pending" && (
                  <>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Optional moderation note"
                      rows={4}
                    />
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button className="w-full" onClick={() => setConfirmOpen(true)} disabled={isSubmitting}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />Approve
                      </Button>
                      <Button variant="destructive" className="w-full" onClick={() => setRejectOpen(true)} disabled={isSubmitting}>
                        <XCircle className="mr-2 h-4 w-4" />Reject
                      </Button>
                    </div>
                  </>
                )}

                {filter === "rejected" && selectedAd.review_note && (
                  <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
                    <p className="font-semibold">Rejection Note</p>
                    <p className="mt-1 text-muted-foreground">{selectedAd.review_note}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve this ad?</DialogTitle>
            <DialogDescription>
              This action will mark the ad as approved and move it to active moderation-complete state.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={() => moderate("approve")} disabled={isSubmitting}>Confirm Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this ad?</DialogTitle>
            <DialogDescription>
              Rejection reason is optional but recommended for user feedback.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button variant="destructive" onClick={() => moderate("reject")} disabled={isSubmitting}>Confirm Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
