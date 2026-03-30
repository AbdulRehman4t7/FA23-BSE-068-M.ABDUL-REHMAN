import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/65">
      <div className="container grid gap-8 py-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="font-heading text-2xl">AdFlow Pro</p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Sponsored listing marketplace with moderation workflow, simulated payment verification, scheduling automation, analytics, and external media normalization.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          <Link href="/explore" className="hover:text-primary">Explore</Link>
          <Link href="/packages" className="hover:text-primary">Packages</Link>
          <Link href="/faq" className="hover:text-primary">FAQ</Link>
          <Link href="/terms" className="hover:text-primary">Terms</Link>
          <Link href="/privacy" className="hover:text-primary">Privacy</Link>
        </div>
      </div>
    </footer>
  )
}
