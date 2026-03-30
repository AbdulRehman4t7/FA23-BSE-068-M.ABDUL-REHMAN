import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart3, BadgeCheck, Clock3, ShieldCheck } from "lucide-react"

const heroStats = [
  { label: "Active workflow states", value: "10", icon: Clock3 },
  { label: "Manual payment verification", value: "100%", icon: ShieldCheck },
  { label: "Featured rank boost", value: "+50", icon: BarChart3 },
  { label: "Verified seller trust", value: "+5", icon: BadgeCheck },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/50 pb-16 pt-10 lg:pb-24 lg:pt-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.0)_0%,_rgba(212,166,91,0.18)_0%,_transparent_42%),radial-gradient(circle_at_78%_18%,_rgba(168,85,247,0.0)_0%,_rgba(113,56,18,0.18)_0%,_transparent_38%)]" />
      <div className="container grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-card/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary shadow-sm">
            Moderated • Scheduled • Ranked
          </div>
          <h1 className="mt-6 font-heading text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
            Launch sponsored ads with a workflow that actually feels premium.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            AdFlow Pro is a full-stack marketplace for sponsored listings with moderation review, payment proof verification, scheduling, expiry automation, analytics, and normalized external media.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/explore">
              <Button size="lg" className="w-full rounded-full px-7 sm:w-auto">Explore Marketplace</Button>
            </Link>
            <Link href="/dashboard/ads/new">
              <Button variant="outline" size="lg" className="w-full rounded-full px-7 sm:w-auto">Create Sponsored Ad</Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {heroStats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
                <item.icon className="h-5 w-5 text-primary" />
                <p className="mt-4 text-2xl font-semibold">{item.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-4 top-10 hidden h-24 w-24 rounded-full bg-primary/10 blur-3xl lg:block" />
          <div className="rounded-[2rem] border border-border/70 bg-card/85 p-5 shadow-[0_24px_80px_rgba(76,46,22,0.12)] backdrop-blur">
            <div className="rounded-[1.6rem] border border-border/60 bg-background/80 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-primary">Campaign control room</p>
                  <h2 className="mt-1 font-heading text-3xl">Ad Lifecycle</h2>
                </div>
                <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Live logic
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  "Draft",
                  "Submitted",
                  "Under Review",
                  "Payment Pending",
                  "Payment Submitted",
                  "Payment Verified",
                  "Scheduled",
                  "Published",
                ].map((stage, index) => (
                  <div key={stage} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${index < 6 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{stage}</p>
                    </div>
                    <div className={`h-2.5 w-2.5 rounded-full ${index < 6 ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-primary px-5 py-4 text-primary-foreground">
                <p className="text-sm uppercase tracking-[0.25em] text-primary-foreground/80">Ranking formula</p>
                <p className="mt-2 text-sm leading-7">
                  `featured + package weight + freshness + admin boost + verified seller`
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
