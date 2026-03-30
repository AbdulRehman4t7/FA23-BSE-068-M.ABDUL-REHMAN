"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Menu,
  PlusCircle,
  ShieldCheck,
  User,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const roleMenus = {
  client: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/ads/new", label: "Create Ad", icon: PlusCircle },
    { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  ],
  moderator: [
    { href: "/moderator", label: "Overview", icon: ShieldCheck },
    { href: "/moderator/review", label: "Review Queue", icon: Users },
  ],
  admin: [
    { href: "/admin", label: "Admin Home", icon: LayoutDashboard },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ],
} as const;

export default function DashboardLayout({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const menu = role === "moderator" ? roleMenus.moderator : role === "admin" ? roleMenus.admin : roleMenus.client;

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card/95 p-5 backdrop-blur transition-transform lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                A
              </div>
              <div>
                <p className="font-heading text-lg font-semibold">AdFlow Pro</p>
                <p className="text-xs text-muted-foreground">Control Center</p>
              </div>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="space-y-2">
            {menu.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 rounded-2xl border border-border bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Workflow</p>
            <p className="mt-2 text-sm text-foreground">Draft to publish with moderation, payment verification, scheduling, and expiry automation.</p>
          </div>

          <Button variant="outline" className="mt-6 w-full justify-start" onClick={handleLogout}>
            <User className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 lg:px-8">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="hidden rounded-full border border-border px-3 py-1 text-xs text-muted-foreground sm:block">
                Production-style demo mode
              </div>
              <Link href="/" className="text-sm font-medium text-primary">
                Back to site
              </Link>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
