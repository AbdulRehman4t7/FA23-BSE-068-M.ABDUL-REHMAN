"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Star,
  Check,
  Loader2,
} from "lucide-react"

const categories = [
  "Real Estate",
  "Vehicles",
  "Electronics",
  "Services",
  "Jobs",
  "Fashion",
  "Collectibles",
]

const cities = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
]

const packages = [
  {
    id: "basic",
    name: "Basic",
    price: "$9",
    duration: "7 days",
    features: ["Standard placement", "1 image", "Basic analytics"],
  },
  {
    id: "standard",
    name: "Standard",
    price: "$19",
    duration: "15 days",
    features: ["Priority placement", "5 images", "Detailed analytics", "Social promotion"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$39",
    duration: "30 days",
    features: ["Featured badge", "Homepage showcase", "Unlimited images", "Dedicated support"],
    popular: true,
  },
]

type Step = 1 | 2 | 3 | 4

function toSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function NewAdPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    city: "",
    mediaUrl: "",
    package: "standard",
    transactionId: "",
    senderName: "",
    amount: "",
    screenshotUrl: "",
  })

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const mediaUrls = formData.mediaUrl
        .split(/[,\\n]/g)
        .map((s) => s.trim())
        .filter(Boolean)

      const adRes = await fetch("/api/client/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category_id: formData.category,
          city_id: formData.city,
          package_id: formData.package,
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        }),
      })

      const adJson = await adRes.json()
      if (!adRes.ok) throw new Error(adJson?.error || "Failed to create ad")

      const adId = adJson.adId
      if (!adId) throw new Error("Ad id missing from response")

      const payRes = await fetch("/api/client/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad_id: String(adId),
          amount: formData.amount,
          method: "BANK_TRANSFER",
          transaction_ref: formData.transactionId,
          sender_name: formData.senderName,
          screenshot_url: formData.screenshotUrl ? formData.screenshotUrl : undefined,
        }),
      })

      const payJson = await payRes.json()
      if (!payRes.ok) throw new Error(payJson?.error || "Failed to submit payment")

      router.push("/dashboard/ads")
    } catch (err) {
      console.error("Ad submit error:", err)
      alert("Failed to submit ad. Check console for details.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/ads"
            className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Ads
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Create New Ad</h1>
          <p className="text-muted-foreground">
            Fill in the details below to create your ad listing
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium",
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step > s ? <Check className="h-5 w-5" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={cn(
                      "mx-2 h-1 w-12 sm:w-24",
                      step > s ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Details</span>
            <span>Media</span>
            <span>Package</span>
            <span>Payment</span>
          </div>
        </div>

        {/* Step 1: Ad Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Ad Details</CardTitle>
              <CardDescription>
                Provide the basic information about your listing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Premium Office Space Downtown"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your listing in detail..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => updateFormData("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={`cat-${toSlug(cat)}`}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => updateFormData("city", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={`city-${toSlug(city)}`}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Media */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>
                Add images or video to your listing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mediaUrl">Image or YouTube URL</Label>
                <Input
                  id="mediaUrl"
                  placeholder="https://..."
                  value={formData.mediaUrl}
                  onChange={(e) => updateFormData("mediaUrl", e.target.value)}
                />
              </div>
              <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium">Drop files here or click to upload</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PNG, JPG, GIF up to 10MB
                </p>
                <Button variant="outline" className="mt-4">
                  Select Files
                </Button>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Package Selection */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Package</CardTitle>
              <CardDescription>
                Choose the best package for your listing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={formData.package}
                onValueChange={(value) => updateFormData("package", value)}
                className="space-y-4"
              >
                {packages.map((pkg) => (
                  <div key={pkg.id} className="relative">
                    {pkg.popular && (
                      <span className="absolute -top-2 left-4 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                        <Star className="h-3 w-3 fill-current" />
                        Popular
                      </span>
                    )}
                    <label
                      htmlFor={pkg.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-colors",
                        formData.package === pkg.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value={pkg.id} id={pkg.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{pkg.name}</span>
                          <span className="font-bold">{pkg.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{pkg.duration}</p>
                        <ul className="mt-2 space-y-1">
                          {pkg.features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                              <Check className="h-4 w-4 text-primary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </label>
                  </div>
                ))}
              </RadioGroup>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={() => setStep(4)}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Submit your payment information for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium">Selected Package</p>
                <p className="mt-1 text-2xl font-bold">
                  {packages.find((p) => p.id === formData.package)?.name} -{" "}
                  {packages.find((p) => p.id === formData.package)?.price}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount Paid</Label>
                <Input
                  id="amount"
                  placeholder="e.g., $19.00"
                  value={formData.amount}
                  onChange={(e) => updateFormData("amount", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  placeholder="e.g., TXN123456789"
                  value={formData.transactionId}
                  onChange={(e) => updateFormData("transactionId", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderName">Sender Name</Label>
                <Input
                  id="senderName"
                  placeholder="Name on payment account"
                  value={formData.senderName}
                  onChange={(e) => updateFormData("senderName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Screenshot (Optional)</Label>
                <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Upload payment confirmation screenshot
                  </p>
                </div>
                <Input
                  placeholder="Or paste screenshot URL (optional)"
                  value={formData.screenshotUrl}
                  onChange={(e) => updateFormData("screenshotUrl", e.target.value)}
                />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Ad
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
