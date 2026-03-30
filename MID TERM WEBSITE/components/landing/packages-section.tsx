import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PACKAGES } from "@/lib/constants"

export function PackagesSection() {
  return (
    <section id="packages" className="container py-14 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Package System</p>
        <h2 className="mt-3 font-heading text-4xl sm:text-5xl">Choose visibility that matches your campaign ambition.</h2>
        <p className="mt-4 text-muted-foreground">
          Every package changes duration, ranking strength, and featured priority so listing performance is driven by business rules, not only latest-posted order.
        </p>
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {PACKAGES.map((pkg) => {
          const premium = pkg.id === "premium"
          return (
            <div
              key={pkg.id}
              className={`rounded-[2rem] border p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 ${premium ? "border-primary bg-primary text-primary-foreground shadow-[0_24px_60px_rgba(76,46,22,0.18)]" : "border-border bg-card/90"}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-3xl">{pkg.name}</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${premium ? "bg-primary-foreground/15 text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                  Weight {pkg.weight}
                </span>
              </div>
              <p className={`mt-4 text-5xl font-semibold ${premium ? "text-primary-foreground" : "text-foreground"}`}>PKR {pkg.price}</p>
              <p className={`mt-3 text-sm leading-7 ${premium ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{pkg.description}</p>
              <div className={`mt-6 rounded-2xl px-4 py-4 ${premium ? "bg-primary-foreground/10" : "bg-muted/50"}`}>
                <p className="text-sm">Duration: {pkg.duration} days</p>
                <p className="mt-2 text-sm">Featured boost: {pkg.featuredBoost}</p>
                <p className="mt-2 text-sm">Rank multiplier: {pkg.weight}x package weight</p>
              </div>
              <Link href="/dashboard/ads/new" className="mt-8 block">
                <Button variant={premium ? "secondary" : "default"} className="w-full rounded-full">
                  Start with {pkg.name}
                </Button>
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}
