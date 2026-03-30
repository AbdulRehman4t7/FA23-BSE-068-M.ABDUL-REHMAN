"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CATEGORIES, PACKAGES, PAKISTAN_CITIES } from "@/lib/constants";
import { ArrowLeft, CheckCircle2, Loader2, Sparkles } from "lucide-react";

export default function NewAdPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    city_id: "",
    package_id: "standard",
    mediaUrl: "",
  });

  const selectedPackage = useMemo(
    () => PACKAGES.find((item) => item.id === form.package_id) ?? PACKAGES[1],
    [form.package_id]
  );

  async function handleCreate() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/client/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category_id: form.category_id,
          city_id: form.city_id,
          package_id: form.package_id,
          mediaUrls: form.mediaUrl ? [form.mediaUrl] : [],
        }),
      });

      if (!res.ok) {
        const payload = await res.json();
        alert(payload.error?.[0]?.message || payload.error || "Failed to create draft");
        return;
      }

      router.push("/dashboard/ads");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link href="/dashboard/ads" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Ads
          </Link>
          <h1 className="mt-4 text-3xl font-bold">Create Sponsored Listing</h1>
          <p className="mt-2 text-muted-foreground">Create a draft first. After that the ad enters moderation, payment verification, and publishing workflow.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Listing Details</CardTitle>
              <CardDescription>Use external media URLs only. Images and YouTube links are normalized automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Premium office space in Clifton" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={6} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Write a strong, policy-compliant description with offer details, features, and seller context." />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category_id} onValueChange={(value) => setForm((prev) => ({ ...prev, category_id: value }))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((item) => <SelectItem key={item.slug} value={`cat-${item.slug}`}>{item.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>City</Label>
                  <Select value={form.city_id} onValueChange={(value) => setForm((prev) => ({ ...prev, city_id: value }))}>
                    <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                    <SelectContent>
                      {PAKISTAN_CITIES.map((item) => <SelectItem key={item.slug} value={`city-${item.slug}`}>{item.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Primary media URL</Label>
                <Input value={form.mediaUrl} onChange={(e) => setForm((prev) => ({ ...prev, mediaUrl: e.target.value }))} placeholder="https://image-url.com or https://youtube.com/watch?v=..." />
              </div>

              <div className="space-y-2">
                <Label>Package</Label>
                <Select value={form.package_id} onValueChange={(value) => setForm((prev) => ({ ...prev, package_id: value }))}>
                  <SelectTrigger><SelectValue placeholder="Choose package" /></SelectTrigger>
                  <SelectContent>
                    {PACKAGES.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleCreate} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Save Draft
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Selected Package</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl bg-muted/40 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{selectedPackage.name}</p>
                    <p className="text-lg font-bold">PKR {selectedPackage.price}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{selectedPackage.description}</p>
                  <div className="mt-4 text-sm">
                    <p>Duration: {selectedPackage.duration} days</p>
                    <p>Weight: {selectedPackage.weight}</p>
                    <p>Featured boost: {selectedPackage.featuredBoost}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Draft saves instantly to your dashboard</p>
                <p>Moderator approves or flags the ad</p>
                <p>Client submits payment proof</p>
                <p>Admin verifies payment and publishes or schedules</p>
                <p>Expired ads auto-hide through cron automation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
