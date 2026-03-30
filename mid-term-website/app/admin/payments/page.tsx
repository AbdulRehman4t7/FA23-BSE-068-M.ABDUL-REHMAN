"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, CheckCircle2, XCircle, Eye } from "lucide-react";

export default function AdminPaymentsPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");

  async function loadQueue() {
    const res = await fetch("/api/admin/payment-queue");
    const data = await res.json();
    setQueue(data.queue || []);
  }

  useEffect(() => {
    loadQueue();
  }, []);

  const filtered = useMemo(
    () => queue.filter((item) => [item.sender_name, item.transaction_ref, item.ad?.title].join(" ").toLowerCase().includes(query.toLowerCase())),
    [queue, query]
  );

  async function processPayment(status: "VERIFIED" | "REJECTED") {
    if (!selected) return;
    await fetch(`/api/admin/payments/${selected.id}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note }),
    });
    setSelected(null);
    setNote("");
    loadQueue();
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payment Verification</h1>
          <p className="text-muted-foreground">Verify submitted proofs before any ad reaches publish or scheduling stage.</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search transaction, sender, or ad" className="pl-10" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Pending Queue</p><p className="text-3xl font-bold">{queue.length}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Potential Revenue</p><p className="text-3xl font-bold">PKR {queue.reduce((sum, item) => sum + Number(item.amount || 0), 0).toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Next step</p><p className="text-lg font-semibold">Verify then publish/schedule</p></CardContent></Card>
        </div>

        <div className="space-y-4">
          {filtered.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold">{payment.ad?.title}</p>
                  <p className="text-sm text-muted-foreground">{payment.sender_name} • {payment.transaction_ref}</p>
                  <p className="text-sm text-muted-foreground">Package: {payment.ad?.packages?.name || payment.ad?.package?.name || "N/A"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">PKR {Number(payment.amount).toLocaleString()}</span>
                  <Button variant="outline" onClick={() => setSelected(payment)}><Eye className="mr-2 h-4 w-4" />Review</Button>
                  <Button onClick={() => { setSelected(payment); setNote(""); }} className="hidden" />
                </div>
              </CardContent>
            </Card>
          ))}
          {!filtered.length && <Card><CardContent className="p-8 text-center text-muted-foreground">No pending payments match your search.</CardContent></Card>}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Review</DialogTitle>
            <DialogDescription>Approve to move ad into `payment_verified`, or reject to send it back to `payment_pending`.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <p><strong>Ad:</strong> {selected.ad?.title}</p>
              <p><strong>Sender:</strong> {selected.sender_name}</p>
              <p><strong>Transaction:</strong> {selected.transaction_ref}</p>
              <p><strong>Screenshot:</strong> {selected.screenshot_url || "Not provided"}</p>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="Optional admin note" />
            </div>
          )}
          <DialogFooter>
            <Button variant="destructive" onClick={() => processPayment("REJECTED")}><XCircle className="mr-2 h-4 w-4" />Reject</Button>
            <Button onClick={() => processPayment("VERIFIED")}><CheckCircle2 className="mr-2 h-4 w-4" />Verify</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
