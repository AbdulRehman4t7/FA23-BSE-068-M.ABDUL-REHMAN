import Link from "next/link"
import { ArrowLeft, Zap } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/10">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-primary-foreground">AdFlow Pro</span>
        </Link>
        
        <div className="space-y-6">
          <blockquote className="text-xl leading-relaxed text-primary-foreground/90">
            &ldquo;AdFlow Pro transformed how we advertise our listings. The verification process ensures quality, and we&apos;ve seen a 3x increase in leads since switching.&rdquo;
          </blockquote>
          <div>
            <p className="font-semibold text-primary-foreground">Sarah Chen</p>
            <p className="text-primary-foreground/70">Marketing Director, Metro Realty</p>
          </div>
        </div>
        
        <p className="text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} AdFlow Pro. All rights reserved.
        </p>
      </div>
      
      {/* Right side - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 lg:w-1/2 lg:px-8">
        <div className="mx-auto w-full max-w-sm">
          {/* Back to home link — always visible */}
          <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to AdFlow Pro
          </Link>
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">AdFlow Pro</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  )
}
