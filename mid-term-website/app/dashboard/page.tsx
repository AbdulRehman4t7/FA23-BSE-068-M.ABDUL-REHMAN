"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge, type AdStatus } from "@/components/status-badge"
import { PackageBadge, type PackageType } from "@/components/package-badge"
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Eye,
} from "lucide-react"

const stats = [
  {
    label: "Active Ads",
    value: "12",
    change: "+2 this week",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Pending Review",
    value: "3",
    change: "Avg. 2hr review",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    label: "Total Views",
    value: "24.5K",
    change: "+12% vs last month",
    icon: Eye,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Expired",
    value: "5",
    change: "2 can be renewed",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
]

const recentAds: {
  id: number
  title: string
  status: AdStatus
  package: PackageType
  views: number
  date: string
}[] = [
  {
    id: 1,
    title: "Premium Office Space Downtown",
    status: "published",
    package: "premium",
    views: 1247,
    date: "Mar 1, 2026",
  },
  {
    id: 2,
    title: "2023 Tesla Model S",
    status: "under_review",
    package: "premium",
    views: 0,
    date: "Mar 18, 2026",
  },
  {
    id: 3,
    title: "Professional Photography Services",
    status: "payment_pending",
    package: "standard",
    views: 0,
    date: "Mar 19, 2026",
  },
  {
    id: 4,
    title: "Vintage Watch Collection",
    status: "published",
    package: "premium",
    views: 892,
    date: "Feb 28, 2026",
  },
  {
    id: 5,
    title: "MacBook Pro 16\" M3 Max",
    status: "draft",
    package: "basic",
    views: 0,
    date: "Mar 20, 2026",
  },
]

export default function DashboardPage() {
  const [data, setData] = useState<any>({ stats: null, ads: recentAds, profile: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/client/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const json = await res.json()
          setData({
            stats: json.stats,
            ads: json.ads?.length > 0 ? json.ads.map((ad: any) => ({
              id: ad.id,
              title: ad.title,
              status: ad.status.toLowerCase(),
              package: ad.packages?.name?.toLowerCase() || 'basic',
              views: 0,
              date: new Date(ad.created_at).toLocaleDateString()
            })) : recentAds,
            profile: json.profile
          })
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const displayStats = data.stats ? [
    { label: "Active Ads", value: data.stats.active, change: "Currently published", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Pending Review", value: data.stats.pending, change: "Awaiting action", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Total Ads", value: data.stats.total, change: "Lifetime submissions", icon: FileText, color: "text-primary", bg: "bg-primary/10" },
    { label: "Expired", value: data.stats.expired, change: "Can be renewed", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" }
  ] : stats

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard {loading && "(Loading...)"}</h1>
            <p className="text-muted-foreground">
              Welcome back{data.profile?.display_name ? `, ${data.profile.display_name}` : ''}! Here's an overview of your ads.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/ads/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New Ad
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayStats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Ads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Ads</CardTitle>
              <CardDescription>Your latest ad submissions and their status</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/ads">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.ads.slice(0, 5).map((ad: any) => (
                <div
                  key={ad.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{ad.title}</p>
                      <p className="text-sm text-muted-foreground">{ad.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden text-right sm:block">
                      <p className="text-sm font-medium">{ad.views} views</p>
                      <PackageBadge packageType={ad.package} />
                    </div>
                    <StatusBadge status={ad.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Create New Ad</p>
                <p className="text-sm text-muted-foreground">Post a new listing</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="font-semibold">Pending Payments</p>
                <p className="text-sm text-muted-foreground">{displayStats[1].value} awaiting verification</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="font-semibold">Renew Expired Ads</p>
                <p className="text-sm text-muted-foreground">{displayStats[3].value} ads can be renewed</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

