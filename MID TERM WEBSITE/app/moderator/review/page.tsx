"use client"

import { useState } from "react"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PackageBadge, type PackageType } from "@/components/package-badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CheckCircle2,
  XCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  User,
  ExternalLink,
} from "lucide-react"

interface ReviewAd {
  id: number
  title: string
  description: string
  category: string
  city: string
  package: PackageType
  image: string
  seller: {
    name: string
    email: string
    joinedAt: string
    totalAds: number
  }
  submittedAt: string
}

const reviewQueue: ReviewAd[] = [
  {
    id: 1,
    title: "Premium Office Space in Financial District",
    description: "Modern office space with stunning views of the city skyline. Features include:\n\n- 2,500 sq ft open floor plan\n- Floor-to-ceiling windows\n- State-of-the-art HVAC system\n- 24/7 security access\n- On-site parking available\n\nPerfect for startups or established businesses looking for a prestigious address.",
    category: "Real Estate",
    city: "New York",
    package: "premium",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    seller: {
      name: "Metro Realty Group",
      email: "contact@metrorealty.com",
      joinedAt: "Jan 2024",
      totalAds: 45,
    },
    submittedAt: "10 min ago",
  },
  {
    id: 2,
    title: "2024 Mercedes-Benz GLE 450",
    description: "Like-new condition, only 5,000 miles. Fully loaded with premium package, panoramic sunroof, and all the latest tech features.",
    category: "Vehicles",
    city: "Los Angeles",
    package: "premium",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&h=400&fit=crop",
    seller: {
      name: "Luxury Auto Sales",
      email: "sales@luxuryauto.com",
      joinedAt: "Mar 2024",
      totalAds: 23,
    },
    submittedAt: "25 min ago",
  },
  {
    id: 3,
    title: "Professional Wedding Photography",
    description: "Award-winning wedding photography services. Package includes engagement session, full day coverage, and 500+ edited photos.",
    category: "Services",
    city: "Chicago",
    package: "standard",
    image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&h=400&fit=crop",
    seller: {
      name: "Jennifer Smith",
      email: "jen@photosmith.com",
      joinedAt: "Jun 2024",
      totalAds: 5,
    },
    submittedAt: "1 hour ago",
  },
]

export default function ReviewPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [moderationNote, setModerationNote] = useState("")

  const currentAd = reviewQueue[currentIndex]
  const totalAds = reviewQueue.length

  const handleApprove = () => {
    // In a real app, this would send to backend
    console.log("Approved:", currentAd.id, "Note:", moderationNote)
    setModerationNote("")
    if (currentIndex < totalAds - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleReject = () => {
    console.log("Rejected:", currentAd.id, "Reason:", rejectReason)
    setRejectDialogOpen(false)
    setRejectReason("")
    setModerationNote("")
    if (currentIndex < totalAds - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleFlag = () => {
    console.log("Flagged:", currentAd.id, "Note:", moderationNote)
    setModerationNote("")
    if (currentIndex < totalAds - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  return (
    <DashboardLayout role="moderator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Review Queue</h1>
            <p className="text-muted-foreground">
              {totalAds} ads pending review
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} of {totalAds}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentIndex(Math.min(totalAds - 1, currentIndex + 1))}
              disabled={currentIndex === totalAds - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Ad Preview */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video overflow-hidden rounded-t-xl">
                  <Image
                    src={currentAd.image}
                    alt={currentAd.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute right-3 top-3">
                    <PackageBadge packageType={currentAd.package} />
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold">{currentAd.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {currentAd.city}
                    </span>
                    <span>{currentAd.category}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Submitted {currentAd.submittedAt}
                    </span>
                  </div>
                  <div className="mt-6">
                    <h3 className="font-medium">Description</h3>
                    <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                      {currentAd.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Moderation Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Moderation Notes</CardTitle>
                <CardDescription>Add notes for internal reference</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add any notes about this ad..."
                  value={moderationNote}
                  onChange={(e) => setModerationNote(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleApprove}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setRejectDialogOpen(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button variant="outline" className="w-full" onClick={handleFlag}>
                  <Flag className="mr-2 h-4 w-4" />
                  Flag for Review
                </Button>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{currentAd.seller.name}</p>
                    <p className="text-sm text-muted-foreground">{currentAd.seller.email}</p>
                  </div>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Member Since</dt>
                    <dd className="font-medium">{currentAd.seller.joinedAt}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total Ads</dt>
                    <dd className="font-medium">{currentAd.seller.totalAds}</dd>
                  </div>
                </dl>
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Seller Profile
                </Button>
              </CardContent>
            </Card>

            {/* Quick Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Check</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                    Clear title and description
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                    Appropriate images
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                    No prohibited content
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                    Correct category
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Ad</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this ad. This will be sent to the seller.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Ad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
