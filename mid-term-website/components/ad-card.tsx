import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { PackageBadge } from "@/components/package-badge"

import type { AdStatus } from "@/components/status-badge"

export type Ad = {
  id: string | number
  slug?: string
  title: string
  description: string
  price?: number | string
  status?: AdStatus
  is_featured?: boolean
  expiresAt?: string
  seller?: { name?: string; verified?: boolean }
  media?: Array<{ thumbnail_url?: string | null }>
  image?: string
  city?: { name?: string | null } | string
  category?: { name?: string | null } | string
  package?: { name?: string | null } | string
}

interface AdCardProps {
  ad: Ad
}

export function AdCard({ ad }: AdCardProps) {
  const thumbnailSrc =
    ad.media?.[0]?.thumbnail_url ?? (typeof ad.image === "string" ? ad.image : undefined)
  const status = ad.status ?? "published"
  const cityName = typeof ad.city === "string" ? ad.city : ad.city?.name
  const categoryName = typeof ad.category === "string" ? ad.category : ad.category?.name
  const packageName = typeof ad.package === "string" ? ad.package : ad.package?.name
  const packageType = (packageName?.toLowerCase?.() ?? "basic") as any

  const categoryIcons: Record<string, string> = {
    "real estate": "🏠", "electronics": "📱", "vehicles": "🚗",
    "services": "🛠️", "fashion": "👕", "jobs": "💼", "collectibles": "🧿",
  }
  const categoryIcon = categoryIcons[(categoryName ?? "").toLowerCase()] ?? "📋"

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-[1.8rem] border border-border/70 bg-card/95 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(76,46,22,0.12)]">
      <div className="relative aspect-[1.15/0.82] bg-slate-100">
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={ad.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted/40 text-muted-foreground">
            <span className="text-3xl">{categoryIcon}</span>
            <span className="text-xs">No image</span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {ad.is_featured && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-primary-foreground">
              Featured
            </span>
          )}
          <StatusBadge status={status} className="bg-white/90 shadow-sm backdrop-blur-sm" />
        </div>
      </div>
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="line-clamp-2 text-xl">{ad.title}</CardTitle>
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            PKR {ad.price?.toLocaleString() || "N/A"}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{cityName || "Anywhere"}</span>
          <span>•</span>
          <span>{categoryName || "Uncategorized"}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-5 pt-0">
        <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">{ad.description}</p>
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between border-t border-border/60 p-5 pt-4">
        <PackageBadge type={packageType || "basic"} />
        <Link href={`/ads/${ad.slug ?? ad.id}`} className="text-sm font-semibold text-primary hover:underline">
          View Details →
        </Link>
      </CardFooter>
    </Card>
  )
}
