"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/explore", label: "Explore" },
  { href: "/packages", label: "Packages" },
  { href: "/faq", label: "FAQ" },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary text-primary-foreground shadow-lg shadow-primary/15">
            A
          </div>
          <div>
            <p className="font-heading text-xl font-semibold leading-none">AdFlow Pro</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Sponsored Marketplace</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/70 p-1.5 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="rounded-full px-4">Login</Button>
          </Link>
          <Link href="/dashboard/ads/new">
            <Button size="sm" className="rounded-full px-5">Create Ad</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
