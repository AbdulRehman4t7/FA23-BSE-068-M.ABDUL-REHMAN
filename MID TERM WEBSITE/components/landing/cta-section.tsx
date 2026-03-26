import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section id="cta" className="container py-8 md:py-12 lg:py-24">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          Ready to Promote Your Business?
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Join thousands of sellers who are growing their businesses with AdFlow Pro.
        </p>
        <Link href="/register">
          <Button size="lg" className="px-8 mt-4">Join AdFlow Pro Today</Button>
        </Link>
      </div>
    </section>
  )
}
