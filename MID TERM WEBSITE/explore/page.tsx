"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AdCard, type Ad } from "@/components/ad-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, SlidersHorizontal, Grid3X3, List, ChevronLeft, ChevronRight } from "lucide-react"

const categories = [
  "All Categories",
  "Real Estate",
  "Vehicles",
  "Electronics",
  "Services",
  "Jobs",
  "Fashion",
  "Collectibles",
]

const cities = [
  "All Cities",
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Miami",
  "San Francisco",
  "Seattle",
]

const sampleAds: Ad[] = [
  {
    id: 1,
    title: "Premium Office Space Downtown",
    description: "Modern office space with stunning city views.",
    price: "$2,500/mo",
    city: "New York",
    category: "Real Estate",
    package: "premium",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
    expiresAt: "25 days",
    seller: { name: "Metro Realty", verified: true },
  },
  {
    id: 2,
    title: "2023 Tesla Model S",
    description: "Like new condition, full self-driving capability.",
    price: "$89,999",
    city: "Los Angeles",
    category: "Vehicles",
    package: "premium",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=300&fit=crop",
    expiresAt: "20 days",
    seller: { name: "EliteCars", verified: true },
  },
  {
    id: 3,
    title: "Professional Photography Services",
    description: "Wedding, events, and portrait photography.",
    price: "$150/hr",
    city: "Chicago",
    category: "Services",
    package: "standard",
    image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=400&h=300&fit=crop",
    expiresAt: "10 days",
    seller: { name: "PhotoPro", verified: true },
  },
  {
    id: 4,
    title: "Vintage Watch Collection",
    description: "Rare Rolex and Omega pieces from the 1960s.",
    price: "$12,500",
    city: "Miami",
    category: "Collectibles",
    package: "premium",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=300&fit=crop",
    expiresAt: "28 days",
    seller: { name: "TimelessPieces", verified: true },
  },
  {
    id: 5,
    title: "Luxury Apartment for Rent",
    description: "2BR/2BA with modern amenities and parking.",
    price: "$4,200/mo",
    city: "San Francisco",
    category: "Real Estate",
    package: "standard",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
    expiresAt: "12 days",
    seller: { name: "BayRentals", verified: false },
  },
  {
    id: 6,
    title: "MacBook Pro 16\" M3 Max",
    description: "Brand new, sealed box, with AppleCare+.",
    price: "$3,299",
    city: "Seattle",
    category: "Electronics",
    package: "basic",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
    expiresAt: "5 days",
    seller: { name: "TechDeals", verified: true },
  },
  {
    id: 7,
    title: "Senior Software Engineer",
    description: "Remote position at a leading fintech startup.",
    price: "$180k-$220k",
    city: "New York",
    category: "Jobs",
    package: "premium",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop",
    expiresAt: "18 days",
    seller: { name: "TechCorp", verified: true },
  },
  {
    id: 8,
    title: "Designer Handbag Collection",
    description: "Authentic Chanel, Louis Vuitton, and Hermes.",
    price: "$5,000-$15,000",
    city: "Los Angeles",
    category: "Fashion",
    package: "standard",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop",
    expiresAt: "8 days",
    seller: { name: "LuxuryConsign", verified: true },
  },
]

function FilterSidebar() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-semibold">Category</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox id={`category-${category}`} />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm font-normal"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">City</h3>
        <div className="space-y-2">
          {cities.map((city) => (
            <div key={city} className="flex items-center space-x-2">
              <Checkbox id={`city-${city}`} />
              <Label htmlFor={`city-${city}`} className="text-sm font-normal">
                {city}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Price Range</h3>
        <div className="flex items-center gap-2">
          <Input placeholder="Min" className="w-24" />
          <span className="text-muted-foreground">-</span>
          <Input placeholder="Max" className="w-24" />
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Package</h3>
        <div className="space-y-2">
          {["Basic", "Standard", "Premium"].map((pkg) => (
            <div key={pkg} className="flex items-center space-x-2">
              <Checkbox id={`package-${pkg}`} />
              <Label htmlFor={`package-${pkg}`} className="text-sm font-normal">
                {pkg}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full">Apply Filters</Button>
    </div>
  )
}

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [adsList, setAdsList] = useState<Ad[]>(sampleAds)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAds() {
      try {
        const res = await fetch('/api/ads')
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (data.ads && data.ads.length > 0) {
          const formattedAds: Ad[] = data.ads.map((ad: any) => ({
            id: ad.id,
            title: ad.title,
            description: ad.description,
            price: 'Ref: ' + ad.id.substring(0, 8),
            city: ad.cities?.name || 'Unknown',
            category: ad.categories?.name || 'Unknown',
            package: ad.packages?.name?.toLowerCase() || 'basic',
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop", 
            expiresAt: new Date(ad.expire_at).toLocaleDateString(),
            seller: { name: 'Verified Seller', verified: true },
          }))
          setAdsList(formattedAds)
        }
      } catch (e) {
        console.error("Failed to fetch ads, falling back to samples.", e)
      } finally {
        setLoading(false)
      }
    }
    fetchAds()
  }, [])


  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Explore Ads</h1>
            <p className="mt-2 text-muted-foreground">
              Discover verified listings from trusted sellers
            </p>
          </div>

          {/* Search and filters bar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="hidden items-center rounded-lg border border-input p-1 md:flex">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar - Desktop */}
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 font-semibold">Filters</h2>
                <FilterSidebar />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1">
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {adsList.length} results {loading && "(Loading...)"}
              </div>

              <div className={
                viewMode === "grid"
                  ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                  : "space-y-4"
              }>
                {adsList.map((ad) => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">1</Button>
                <Button variant="default" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <span className="px-2 text-muted-foreground">...</span>
                <Button variant="outline" size="sm">10</Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
