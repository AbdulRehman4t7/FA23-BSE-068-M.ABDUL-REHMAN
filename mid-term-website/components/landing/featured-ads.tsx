import { AdCard } from "@/components/ad-card"
import { mockListPublishedAds } from "@/lib/mock-db"

export function FeaturedAds() {
  const ads = mockListPublishedAds({ featured: true, limit: 3 }).data

  return (
    <section id="featured-ads" className="container py-14 lg:py-24">
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Curated Inventory</p>
          <h2 className="mt-3 font-heading text-4xl sm:text-5xl">Featured listings with ranking priority and trust signals.</h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-muted-foreground">
          These ads are currently active, ranked with premium package weight, freshness, admin boosts, and verified seller bonuses.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {ads.map((ad) => (
          <div key={ad.id} className="translate-y-0 transition-transform duration-300 hover:-translate-y-1">
            <AdCard ad={ad} />
          </div>
        ))}
      </div>
    </section>
  )
}
