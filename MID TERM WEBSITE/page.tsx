import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturedAds } from "@/components/landing/featured-ads"
import { PackagesSection } from "@/components/landing/packages-section"
import { HowItWorks } from "@/components/landing/how-it-works"
import { CTASection } from "@/components/landing/cta-section"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturedAds />
        <HowItWorks />
        <PackagesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
