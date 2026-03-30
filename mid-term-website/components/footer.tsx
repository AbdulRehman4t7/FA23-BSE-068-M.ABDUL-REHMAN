import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/65">
      <div className="container grid gap-8 py-10 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p className="font-heading text-2xl">AdFlow Pro</p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Sponsored listing marketplace with moderation workflow, payment verification, scheduling automation, analytics, and external media normalization.
          </p>
          <div className="mt-4 flex gap-4 text-muted-foreground">
            {/* Social placeholders */}
            <a href="#" aria-label="Twitter" className="hover:text-primary text-sm">Twitter</a>
            <a href="#" aria-label="LinkedIn" className="hover:text-primary text-sm">LinkedIn</a>
            <a href="#" aria-label="Instagram" className="hover:text-primary text-sm">Instagram</a>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 text-sm font-medium">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Marketplace</p>
            <Link href="/explore" className="block hover:text-primary">Explore</Link>
            <Link href="/packages" className="block hover:text-primary">Packages</Link>
            <Link href="/faq" className="block hover:text-primary">FAQ</Link>
          </div>
          <div className="space-y-2 text-sm font-medium">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Company</p>
            <Link href="/terms" className="block hover:text-primary">Terms</Link>
            <Link href="/privacy" className="block hover:text-primary">Privacy</Link>
            <a href="mailto:support@adflowpro.com" className="block hover:text-primary">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
