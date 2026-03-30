import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section id="cta" className="container pb-16 pt-8 lg:pb-24">
      <div className="relative overflow-hidden rounded-[2.4rem] border border-primary/20 bg-primary px-6 py-10 text-primary-foreground shadow-[0_24px_80px_rgba(76,46,22,0.22)] lg:px-10 lg:py-14">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary-foreground/75">Ready to Launch</p>
            <h2 className="mt-3 font-heading text-4xl sm:text-5xl">Turn your listing into a moderated, ranked, production-style campaign.</h2>
            <p className="mt-5 max-w-2xl text-primary-foreground/80">
              Create your first draft, submit payment proof, and let AdFlow Pro handle the rest of the publishing lifecycle with clear operational controls.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link href="/dashboard/ads/new">
              <Button variant="secondary" size="lg" className="w-full rounded-full px-7 lg:w-auto">Create New Ad</Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="lg" className="w-full rounded-full border-primary-foreground/25 bg-transparent px-7 text-primary-foreground hover:bg-primary-foreground/10 lg:w-auto">Open Control Panel</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
