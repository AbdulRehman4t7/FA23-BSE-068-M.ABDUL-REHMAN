"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PackageBadge } from "@/components/package-badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, ChevronLeft, ChevronRight, Flag, MapPin, User, XCircle } from "lucide-react";

export default function ReviewPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [note, setNote] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  async function loadQueue() {
    const res = await fetch("/api/moderator/review-queue");
    const data = await res.json();
    setQueue(data.queue || []);
    setIndex(0);
  }

  useEffect(() => {
    loadQueue();
  }, []);

  const current = queue[index];

  async function moderate(action: "approve" | "reject" | "flag", reason?: string) {
    if (!current) return;
    await fetch(`/api/moderator/ads/${current.id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note: reason || note }),
    });
    setNote("");
    setRejectReason("");
    setRejectOpen(false);
    loadQueue();
  }

  return (
    <DashboardLayout role="moderator">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Review Queue</h1>
            <p className="text-muted-foreground">{queue.length} ads awaiting moderation</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setIndex((prev) => Math.max(0, prev - 1))} disabled={index === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">{queue.length ? `${index + 1} of ${queue.length}` : "No queue"}</span>
            <Button variant="outline" size="icon" onClick={() => setIndex((prev) => Math.min(queue.length - 1, prev + 1))} disabled={index >= queue.length - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!current ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">No ads are pending review right now.</CardContent></Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <Card>
              <CardContent className="space-y-6 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold">{current.title}</h2>
                  <PackageBadge packageType={current.packages?.name?.toLowerCase() ?? "basic"} />
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{current.cities?.name}</span>
                  <span>{current.categories?.name}</span>
                  <span>Rank score: {current.rank_score}</span>
                </div>
                <p className="whitespace-pre-wrap text-muted-foreground">{current.description}</p>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Moderation note" rows={4} />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Seller</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 font-medium"><User className="h-4 w-4" />{current.seller_profiles?.business_name}</div>
                  <p className="text-muted-foreground">{current.seller_profiles?.email || "seller@demo.com"}</p>
                  <p className="text-muted-foreground">Verified: {current.seller_profiles?.is_verified ? "Yes" : "No"}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" onClick={() => moderate("approve")}><CheckCircle2 className="mr-2 h-4 w-4" />Approve to Payment</Button>
                  <Button variant="outline" className="w-full" onClick={() => moderate("flag")}><Flag className="mr-2 h-4 w-4" />Flag for Review</Button>
                  <Button variant="destructive" className="w-full" onClick={() => setRejectOpen(true)}><XCircle className="mr-2 h-4 w-4" />Reject</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject listing</DialogTitle>
            <DialogDescription>Share a reason so the client can fix and resubmit the ad.</DialogDescription>
          </DialogHeader>
          <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} placeholder="Reason for rejection" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => moderate("reject", rejectReason)}>Reject Ad</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
