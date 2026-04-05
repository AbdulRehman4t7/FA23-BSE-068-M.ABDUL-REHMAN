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

const ADS_SYNC_KEY = "adflow:ads-updated"
const LAST_CREATED_AD_KEY = "adflow:last-created-ad"

function readLastCreatedAd(): any | null {
  try {
    const raw = localStorage.getItem(LAST_CREATED_AD_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : null
  } catch {
    return null
  }
}

function mapDashboardAd(ad: any) {
  return {
    id: ad.id,
    title: ad.title,
    status: String(ad.status || "draft").toLowerCase(),
    package: (ad.packages?.name || "basic").toLowerCase(),
    views: ad.views || 0,
    date: ad.created_at ? new Date(ad.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
    created_at: ad.created_at || null,
  }
}

function sortByCreatedAtDesc(a: any, b: any) {
  const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
  const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
  return bTime - aTime
}

function mergeAdsById(existing: any[], incoming: any[]) {
  const byId = new Map<number, any>()
  for (const item of existing || []) byId.set(item.id, item)
  for (const item of incoming || []) byId.set(item.id, item)
  return Array.from(byId.values()).sort(sortByCreatedAtDesc)
}

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
  const [data, setData] = useState<any>({ stats: null, ads: [], profile: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    async function fetchDashboard(showLoading = false) {
      try {
        if (showLoading) setLoading(true)
        const res = await fetch('/api/client/dashboard', {
          cache: "no-store",
          next: { revalidate: 0 }
        })
        if (res.ok && alive) {
          const json = await res.json()
          const mappedAds = json.ads?.length > 0 ? json.ads.map(mapDashboardAd).sort(sortByCreatedAtDesc) : []
          setData((prev: any) => ({
            stats: json.stats,
            ads: mergeAdsById(prev?.ads || [], mappedAds),
            profile: json.profile
          }))
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      } finally {
        if (alive) setLoading(false)
      }
    }

    function prependOptimistic(ad: any) {
      if (!ad?.id) return
      const mapped = mapDashboardAd(ad)
      setData((prev: any) => ({
        ...prev,
        ads: mergeAdsById([mapped], prev?.ads || []),
      }))
    }

    const initialOptimistic = readLastCreatedAd()
    if (initialOptimistic) prependOptimistic(initialOptimistic)

    // Hard guarantee after redirect: if create page passed createdAd, fetch it and prepend.
    try {
      const params = new URLSearchParams(window.location.search)
      const createdAdId = params.get('createdAd')
      if (createdAdId) {
        ;(async () => {
          try {
            const res = await fetch(`/api/client/ads/${encodeURIComponent(createdAdId)}`, { cache: 'no-store' })
            const json = await res.json().catch(() => ({} as any))
            if (res.ok && json?.ad) {
              try { localStorage.setItem(LAST_CREATED_AD_KEY, JSON.stringify(json.ad)) } catch {}
              prependOptimistic(json.ad)
            }
          } catch {}
          try {
            params.delete('createdAd')
            const next = params.toString()
            const url = next ? `/dashboard?${next}` : '/dashboard'
            window.history.replaceState({}, '', url)
          } catch {}
        })()
      }
    } catch {}
    fetchDashboard(true)
    const intervalId = window.setInterval(() => fetchDashboard(false), 3000)
    const onFocus = () => fetchDashboard(false)
    const onStorage = (event: StorageEvent) => {
      if (event.key === ADS_SYNC_KEY) {
        const optimistic = readLastCreatedAd()
        if (optimistic) prependOptimistic(optimistic)
        fetchDashboard(false)
      }
    }
    const onAdsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<any>)?.detail
      const optimistic = detail?.ad ?? readLastCreatedAd()
      if (optimistic) prependOptimistic(optimistic)
      fetchDashboard(false)
    }
    window.addEventListener('focus', onFocus)
    window.addEventListener('storage', onStorage)
    window.addEventListener(ADS_SYNC_KEY, onAdsUpdated as EventListener)

    return () => {
      alive = false
      window.clearInterval(intervalId)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(ADS_SYNC_KEY, onAdsUpdated as EventListener)
    }
  }, [])

  const pendingReviewCount = data.stats?.pending_review ?? data.stats?.pending ?? 0
  const pendingPaymentCount = data.stats?.pending_payment ?? 0

  const displayStats = data.stats ? [
    { label: "Active Ads", value: data.stats.active, change: "Currently published", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Pending Review", value: pendingReviewCount, change: "Awaiting moderator action", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Total Ads", value: data.stats.total, change: "Lifetime submissions", icon: FileText, color: "text-primary", bg: "bg-primary/10" },
    { label: "Expired", value: data.stats.expired, change: "Can be renewed", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" }
  ] : stats

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back{data.profile?.display_name ? `, ${data.profile.display_name}` : ''}! Here's an overview of your ads.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/ads/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Ad
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
                    <div className="mt-4 h-7 w-16 animate-pulse rounded bg-muted" />
                    <div className="mt-2 h-4 w-24 animate-pulse rounded bg-muted" />
                  </CardContent>
                </Card>
              ))
            : displayStats.map((stat, i) => (
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
                <p className="font-semibold">Create Ad</p>
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
                <p className="text-sm text-muted-foreground">{pendingPaymentCount} awaiting verification</p>
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



