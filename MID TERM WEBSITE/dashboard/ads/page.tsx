"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge, type AdStatus } from "@/components/status-badge"
import { PackageBadge, type PackageType } from "@/components/package-badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Clock,
} from "lucide-react"

interface Ad {
  id: number
  title: string
  status: AdStatus
  package: PackageType
  views: number
  createdAt: string
  expiresAt: string
  image: string
  category: string
  city: string
}

const ads: Ad[] = [
  {
    id: 1,
    title: "Premium Office Space Downtown",
    status: "published",
    package: "premium",
    views: 1247,
    createdAt: "Mar 1, 2026",
    expiresAt: "Mar 31, 2026",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop",
    category: "Real Estate",
    city: "New York",
  },
  {
    id: 2,
    title: "2023 Tesla Model S",
    status: "under_review",
    package: "premium",
    views: 0,
    createdAt: "Mar 18, 2026",
    expiresAt: "Apr 17, 2026",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=100&h=100&fit=crop",
    category: "Vehicles",
    city: "Los Angeles",
  },
  {
    id: 3,
    title: "Professional Photography Services",
    status: "payment_pending",
    package: "standard",
    views: 0,
    createdAt: "Mar 19, 2026",
    expiresAt: "Apr 3, 2026",
    image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=100&h=100&fit=crop",
    category: "Services",
    city: "Chicago",
  },
  {
    id: 4,
    title: "Vintage Watch Collection",
    status: "published",
    package: "premium",
    views: 892,
    createdAt: "Feb 28, 2026",
    expiresAt: "Mar 28, 2026",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=100&h=100&fit=crop",
    category: "Collectibles",
    city: "Miami",
  },
  {
    id: 5,
    title: "MacBook Pro 16\" M3 Max",
    status: "draft",
    package: "basic",
    views: 0,
    createdAt: "Mar 20, 2026",
    expiresAt: "-",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop",
    category: "Electronics",
    city: "Seattle",
  },
  {
    id: 6,
    title: "Luxury Apartment for Rent",
    status: "expired",
    package: "standard",
    views: 567,
    createdAt: "Feb 1, 2026",
    expiresAt: "Feb 16, 2026",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=100&h=100&fit=crop",
    category: "Real Estate",
    city: "San Francisco",
  },
]

export default function AdsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredAds = ads.filter((ad) => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || ad.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Ads</h1>
            <p className="text-muted-foreground">
              Manage all your ad listings
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/ads/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New Ad
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search ads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="payment_pending">Payment Pending</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ads List */}
        <div className="space-y-4">
          {filteredAds.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-lg font-medium">No ads found</p>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredAds.map((ad) => (
              <Card key={ad.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative h-32 w-full sm:h-auto sm:w-40">
                      <Image
                        src={ad.image}
                        alt={ad.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">{ad.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {ad.category} • {ad.city}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={ad.status} />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                {ad.status === "expired" && (
                                  <DropdownMenuItem>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Renew
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                        <PackageBadge packageType={ad.package} />
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          {ad.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Expires: {ad.expiresAt}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
