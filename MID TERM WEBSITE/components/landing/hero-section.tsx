import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="space-y-6 border-b border-border/60 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
          Marketplace for Sponsored Listings
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          AdFlow Pro provides a robust platform for managing, moderating, and boosting your sponsored ads.
        </p>
        <div className="space-x-4">
          <Link href="/explore">
            <Button size="lg">Explore Ads</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">Get Started</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
