"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PackageBadge } from "@/components/package-badge"
import { StatusBadge } from "@/components/status-badge"
import {
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  Flag,
  Share2,
  Heart,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react"
import { useState } from "react"

// Demo ad data — all values in PKR and Pakistan locations
const adData = {
  id: 1,
  title: "Premium Office Space in Clifton",
  description: `Stunning modern office space located in the heart of Clifton, Karachi. This premium listing offers:

• 2,500 sq ft of open floor plan
• Floor-to-ceiling windows with city views
• State-of-the-art HVAC system
• 24/7 security and building access
• On-site parking available
• Conference room and break room included
• High-speed fiber internet ready
• Recently renovated with modern finishes

Perfect for startups, creative agencies, or established businesses looking for a prestigious address in Karachi's business district.

Flexible lease terms available. Schedule a tour today!`,
  price: "PKR 250,000/mo",
  city: "Karachi",
  category: "Real Estate",
  package: "premium" as const,
  status: "published" as const,
  images: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=600&fit=crop",
  ],
  postedAt: "March 1, 2026",
  expiresAt: "March 31, 2026",
  views: 1247,
  seller: {
    name: "Metro Realty Group",
    verified: true,
    memberSince: "2024",
    totalAds: 45,
    phone: "+92 300 1234567",
  },
}

export default function AdDetailPage() {
  const [phoneRevealed, setPhoneRevealed] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState("")

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    showToast("Link copied to clipboard")
  }

  function handleSave() {
    setSaved((v) => !v)
    showToast(saved ? "Removed from saved" : "Ad saved")
  }

  function handleReport(e: React.FormEvent) {
    e.preventDefault()
    setReportOpen(false)
    setReportReason("")
    showToast("Report submitted. Thank you.")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm">
            <Link href="/explore" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
              Back to listings
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{adData.category}</span>
            <span className="text-muted-foreground">/</span>
            <span className="truncate">{adData.title}</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              <div className="overflow-hidden rounded-xl">
                <div className="relative aspect-video bg-muted">
                  {adData.images[0] ? (
                    <img src={adData.images[0]} alt={adData.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
                  )}
                  <div className="absolute right-3 top-3 flex gap-2">
                    <PackageBadge packageType={adData.package} />
                    <StatusBadge status={adData.status} />
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {adData.images.slice(1).map((image, index) => (
                    <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                      <img src={image} alt={`${adData.title} - Image ${index + 2}`} className="h-full w-full object-cover transition-transform hover:scale-105" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Title and meta */}
              <div className="mt-6">
                <h1 className="text-2xl font-bold sm:text-3xl">{adData.title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {adData.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Posted {adData.postedAt}
                  </span>
                  <span>{adData.views.toLocaleString()} views</span>
                </div>
                <p className="mt-4 text-3xl font-bold text-primary">{adData.price}</p>
              </div>

              {/* Description */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold">Description</h2>
                <div className="mt-4 whitespace-pre-wrap text-muted-foreground">{adData.description}</div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Heart className={`mr-2 h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
                  {saved ? "Saved" : "Save"}
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setReportOpen(true)}>
                  <Flag className="mr-2 h-4 w-4" />
                  Report Ad
                </Button>
              </div>

              {/* Report modal */}
              {reportOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl">
                    <h3 className="text-lg font-semibold">Report this ad</h3>
                    <form onSubmit={handleReport} className="mt-4 space-y-3">
                      {["Misleading", "Spam", "Inappropriate content", "Duplicate listing", "Other"].map((reason) => (
                        <label key={reason} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="radio" name="reason" value={reason} onChange={() => setReportReason(reason)} required className="accent-primary" />
                          {reason}
                        </label>
                      ))}
                      <div className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setReportOpen(false)}>Cancel</Button>
                        <Button type="submit" className="flex-1" disabled={!reportReason}>Submit</Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Seller Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Seller Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{adData.seller.name}</span>
                        {adData.seller.verified && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Member since {adData.seller.memberSince} • {adData.seller.totalAds} ads
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button className="w-full" asChild>
                      <a href={`mailto:seller@adflowpro.com?subject=Inquiry about ${encodeURIComponent(adData.title)}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Contact Seller
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setPhoneRevealed(true)}>
                      <Phone className="mr-2 h-4 w-4" />
                      {phoneRevealed ? adData.seller.phone : "Reveal Phone Number"}
                    </Button>
                  </div>

                  <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
                    <p className="font-medium">Safety Tips</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• Meet in a public place</li>
                      <li>• Verify the item before payment</li>
                      <li>• Never send money in advance</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Listing Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Listing Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="font-medium">{adData.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Location</dt>
                      <dd className="font-medium">{adData.city}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Package</dt>
                      <dd><PackageBadge packageType={adData.package} /></dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Posted</dt>
                      <dd className="font-medium">{adData.postedAt}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Expires</dt>
                      <dd className="font-medium">{adData.expiresAt}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Ad ID</dt>
                      <dd className="font-mono text-xs">#AD-{String(adData.id).padStart(6, '0')}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-5 py-2.5 text-sm text-background shadow-lg">
          {toast}
        </div>
      )}

      <Footer />
    </div>
  )
}
