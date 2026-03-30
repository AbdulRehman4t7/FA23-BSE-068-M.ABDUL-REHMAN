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
import { cn } from "@/lib/utils";

const TITLE_MAX = 80;
const DESC_MAX = 1000;

function isValidUrl(url: string) {
  try { new URL(url); return true; } catch { return false; }
}

export default function NewAdPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [mediaUrlTouched, setMediaUrlTouched] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    city_id: "",
    package_id: "standard",
    mediaUrl: "",
  });

  const selectedPackage = useMemo(
    () => PACKAGES.find((item) => item.id === form.package_id) ?? PACKAGES[1],
    [form.package_id]
  );

  const mediaUrlValid = form.mediaUrl === "" ? null : isValidUrl(form.mediaUrl);

  async function handleCreate() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/client/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: form.price ? Number(form.price) : undefined,
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
          <h1 className="mt-4 text-3xl font-bold">Create Ad</h1>
          <p className="mt-2 text-muted-foreground">Create a draft first. After that the ad enters moderation, payment verification, and publishing workflow.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Listing Details</CardTitle>
              <CardDescription>Use external media URLs only. Images and YouTube links are normalized automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                  <span className={cn("text-xs", form.title.length > TITLE_MAX ? "text-destructive" : "text-muted-foreground")}>
                    {form.title.length}/{TITLE_MAX}
                  </span>
                </div>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value.slice(0, TITLE_MAX) }))}
                  placeholder="Premium office space in Clifton"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                  <span className={cn("text-xs", form.description.length > DESC_MAX ? "text-destructive" : "text-muted-foreground")}>
                    {form.description.length}/{DESC_MAX}
                  </span>
                </div>
                <Textarea
                  id="description"
                  rows={6}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value.slice(0, DESC_MAX) }))}
                  placeholder="Write a strong, policy-compliant description with offer details, features, and seller context."
                  required
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Price (PKR) <span className="text-destructive">*</span></Label>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="e.g. 25000"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category <span className="text-destructive">*</span></Label>
                  <Select value={form.category_id} onValueChange={(value) => setForm((prev) => ({ ...prev, category_id: value }))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((item) => <SelectItem key={item.slug} value={`cat-${item.slug}`}>{item.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>City <span className="text-destructive">*</span></Label>
                  <Select value={form.city_id} onValueChange={(value) => setForm((prev) => ({ ...prev, city_id: value }))}>
                    <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                    <SelectContent>
                      {PAKISTAN_CITIES.map((item) => <SelectItem key={item.slug} value={`city-${item.slug}`}>{item.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Media URL with validation */}
              <div className="space-y-2">
                <Label>Primary media URL</Label>
                <div className="relative">
                  <Input
                    value={form.mediaUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, mediaUrl: e.target.value }))}
                    onBlur={() => setMediaUrlTouched(true)}
                    placeholder="https://image-url.com or https://youtube.com/watch?v=..."
                    className={cn(
                      mediaUrlTouched && form.mediaUrl && !mediaUrlValid && "border-destructive focus-visible:ring-destructive",
                      mediaUrlTouched && mediaUrlValid && "border-emerald-500 focus-visible:ring-emerald-500"
                    )}
                  />
                  {mediaUrlTouched && form.mediaUrl && (
                    <span className={cn("mt-1 text-xs", mediaUrlValid ? "text-emerald-600" : "text-destructive")}>
                      {mediaUrlValid ? "✓ Valid URL" : "Invalid URL format"}
                    </span>
                  )}
                </div>
              </div>

              {/* Package cards */}
              <div className="space-y-2">
                <Label>Package <span className="text-destructive">*</span></Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {PACKAGES.map((pkg) => {
                    const selected = form.package_id === pkg.id;
                    const isStandard = pkg.id === "standard";
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, package_id: pkg.id }))}
                        className={cn(
                          "relative rounded-2xl border p-4 text-left transition-all",
                          selected
                            ? "border-primary bg-primary/5 ring-2 ring-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {isStandard && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                            Popular
                          </span>
                        )}
                        {selected && (
                          <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-primary" />
                        )}
                        <p className="font-semibold">{pkg.name}</p>
                        <p className="mt-1 text-lg font-bold text-primary">PKR {pkg.price}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{pkg.duration} days</p>
                        {pkg.featuredBoost > 0 && (
                          <p className="mt-1 text-xs text-muted-foreground">+{pkg.featuredBoost} featured boost</p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">{pkg.weight}x rank weight</p>
                      </button>
                    );
                  })}
                </div>
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
                <CardTitle>Workflow Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  { step: 1, label: "Draft saves instantly", active: true },
                  { step: 2, label: "Moderator reviews the ad" },
                  { step: 3, label: "Submit payment proof" },
                  { step: 4, label: "Admin verifies payment" },
                  { step: 5, label: "Ad is published or scheduled" },
                ].map(({ step, label, active }) => (
                  <div key={step} className={cn("flex items-center gap-3 rounded-xl px-3 py-2", active ? "bg-primary/5" : "")}>
                    <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      {step}
                    </div>
                    <span className={active ? "font-medium text-foreground" : "text-muted-foreground"}>{label}</span>
                    {active && <Sparkles className="ml-auto h-3.5 w-3.5 text-primary" />}
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
