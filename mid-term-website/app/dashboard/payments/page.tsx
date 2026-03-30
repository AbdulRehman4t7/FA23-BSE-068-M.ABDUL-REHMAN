"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { mockListClientDashboard, mockListClientPayments } from "@/lib/mock-db";
import { CreditCard, Loader2, Receipt } from "lucide-react";
import Link from "next/link";

const PAYMENT_METHODS = ["JazzCash", "EasyPaisa", "Bank Transfer", "Other"];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [pendingAds, setPendingAds] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    ad_id: "",
    amount: "",
    method: "",
    transaction_ref: "",
    sender_name: "",
    screenshot_url: "",
  });

  function loadData() {
    const dashboard = mockListClientDashboard({ user_id: "demo-user" });
    const paymentHistory = mockListClientPayments("demo-user");
    setPayments(paymentHistory);
    setPendingAds(dashboard.ads.filter((ad) => ad.status === "payment_pending"));
  }

  useEffect(() => {
    loadData();
  }, []);

  // Auto-fill amount when ad is selected
  function handleAdSelect(adId: string) {
    const ad = pendingAds.find((a) => String(a.id) === adId);
    const price = ad?.package?.price ?? "";
    setForm((prev) => ({ ...prev, ad_id: adId, amount: price ? String(price) : prev.amount }));
  }

  const totals = useMemo(() => ({
    spent: payments.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    pending: payments.filter((item) => item.status === "PENDING").reduce((sum, item) => sum + Number(item.amount || 0), 0),
  }), [payments]);

  async function submitPayment() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/client/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await res.json();
      if (!res.ok) {
        alert(payload.error || "Failed to submit payment");
        return;
      }
      setForm({ ad_id: "", amount: "", method: "", transaction_ref: "", sender_name: "", screenshot_url: "" });
      loadData();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Submit manual payment proof and monitor verification history.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total submitted</p><p className="text-3xl font-bold">PKR {totals.spent.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Awaiting verification</p><p className="text-3xl font-bold">PKR {totals.pending.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Ads needing payment</p><p className="text-3xl font-bold">{pendingAds.length}</p></CardContent></Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <Card>
            <CardHeader><CardTitle>Submit Payment Proof</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Ad <span className="text-destructive">*</span></Label>
                {pendingAds.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                    No ads are currently awaiting payment.{" "}
                    <Link href="/dashboard/ads" className="text-primary hover:underline">View your ads</Link>
                  </p>
                ) : (
                  <Select value={form.ad_id} onValueChange={handleAdSelect}>
                    <SelectTrigger><SelectValue placeholder="Select an ad" /></SelectTrigger>
                    <SelectContent>
                      {pendingAds.map((ad) => (
                        <SelectItem key={ad.id} value={String(ad.id)}>
                          {ad.title} — #{ad.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label>Amount (PKR) <span className="text-destructive">*</span></Label>
                <Input value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} placeholder="e.g. 1500" type="number" min="1" />
              </div>
              <div className="space-y-2">
                <Label>Payment Method <span className="text-destructive">*</span></Label>
                <Select value={form.method} onValueChange={(v) => setForm((prev) => ({ ...prev, method: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Transaction Reference <span className="text-destructive">*</span></Label>
                <Input value={form.transaction_ref} onChange={(e) => setForm((prev) => ({ ...prev, transaction_ref: e.target.value }))} placeholder="TXN-ADFLOW-100" />
              </div>
              <div className="space-y-2">
                <Label>Sender Name</Label>
                <Input value={form.sender_name} onChange={(e) => setForm((prev) => ({ ...prev, sender_name: e.target.value }))} placeholder="Account holder name" />
              </div>
              <div className="space-y-2">
                <Label>Screenshot URL</Label>
                <Textarea value={form.screenshot_url} onChange={(e) => setForm((prev) => ({ ...prev, screenshot_url: e.target.value }))} rows={3} placeholder="https://..." />
              </div>
              <Button onClick={submitPayment} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                Submit Payment
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Ads Waiting for Payment</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {pendingAds.length ? pendingAds.map((ad) => (
                  <div key={ad.id} className="rounded-2xl border border-border p-4">
                    <p className="font-semibold">{ad.title}</p>
                    <p className="text-sm text-muted-foreground">Ad ID: {ad.id} • Package: {ad.package.name}</p>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No ads currently waiting for payment.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {payments.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <Receipt className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No payment history yet.</p>
                    <p className="text-xs text-muted-foreground">Submit your first payment proof above.</p>
                  </div>
                ) : payments.map((payment) => (
                  <div key={payment.id} className="flex flex-col gap-2 rounded-2xl border border-border p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">{payment.ad?.title || `Ad #${payment.ad_id}`}</p>
                      <p className="text-sm text-muted-foreground">{payment.transaction_ref}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">PKR {Number(payment.amount).toLocaleString()}</span>
                      <StatusBadge status={payment.status === "VERIFIED" ? "payment_verified" : payment.status === "REJECTED" ? "rejected" : "payment_submitted"} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [pendingAds, setPendingAds] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    ad_id: "",
    amount: "",
    method: "Bank Transfer",
    transaction_ref: "",
    sender_name: "",
    screenshot_url: "",
  });

  function loadData() {
    const dashboard = mockListClientDashboard({ user_id: "demo-user" });
    const paymentHistory = mockListClientPayments("demo-user");
    setPayments(paymentHistory);
    setPendingAds(dashboard.ads.filter((ad) => ad.status === "payment_pending"));
  }

  useEffect(() => {
    loadData();
  }, []);

  const totals = useMemo(() => ({
    spent: payments.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    pending: payments.filter((item) => item.status === "PENDING").reduce((sum, item) => sum + Number(item.amount || 0), 0),
  }), [payments]);

  async function submitPayment() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/client/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await res.json();
      if (!res.ok) {
        alert(payload.error || "Failed to submit payment");
        return;
      }
      setForm({ ad_id: "", amount: "", method: "Bank Transfer", transaction_ref: "", sender_name: "", screenshot_url: "" });
      loadData();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Submit manual payment proof and monitor verification history.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total submitted</p><p className="text-3xl font-bold">PKR {totals.spent.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Awaiting verification</p><p className="text-3xl font-bold">PKR {totals.pending.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Ads needing payment</p><p className="text-3xl font-bold">{pendingAds.length}</p></CardContent></Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <Card>
            <CardHeader><CardTitle>Submit Payment Proof</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Ad ID</Label>
                <Input value={form.ad_id} onChange={(e) => setForm((prev) => ({ ...prev, ad_id: e.target.value }))} placeholder="Enter ad ID from pending list" />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} placeholder="1500" />
              </div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Input value={form.method} onChange={(e) => setForm((prev) => ({ ...prev, method: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Transaction Reference</Label>
                <Input value={form.transaction_ref} onChange={(e) => setForm((prev) => ({ ...prev, transaction_ref: e.target.value }))} placeholder="TXN-ADFLOW-100" />
              </div>
              <div className="space-y-2">
                <Label>Sender Name</Label>
                <Input value={form.sender_name} onChange={(e) => setForm((prev) => ({ ...prev, sender_name: e.target.value }))} placeholder="Account holder name" />
              </div>
              <div className="space-y-2">
                <Label>Screenshot URL</Label>
                <Textarea value={form.screenshot_url} onChange={(e) => setForm((prev) => ({ ...prev, screenshot_url: e.target.value }))} rows={3} placeholder="https://..." />
              </div>
              <Button onClick={submitPayment} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                Submit Payment
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Ads Waiting for Payment</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {pendingAds.length ? pendingAds.map((ad) => (
                  <div key={ad.id} className="rounded-2xl border border-border p-4">
                    <p className="font-semibold">{ad.title}</p>
                    <p className="text-sm text-muted-foreground">Ad ID: {ad.id} • Package: {ad.package.name}</p>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No ads currently waiting for payment.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex flex-col gap-2 rounded-2xl border border-border p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">{payment.ad?.title || `Ad #${payment.ad_id}`}</p>
                      <p className="text-sm text-muted-foreground">{payment.transaction_ref}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">PKR {Number(payment.amount).toLocaleString()}</span>
                      <StatusBadge status={payment.status === "VERIFIED" ? "payment_verified" : payment.status === "REJECTED" ? "rejected" : "payment_submitted"} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
