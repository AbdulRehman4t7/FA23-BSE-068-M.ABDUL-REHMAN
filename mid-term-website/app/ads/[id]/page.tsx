import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PackageBadge } from "@/components/package-badge"
import { StatusBadge } from "@/components/status-badge"
import {
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  Flag,
  Share2,
  Heart,
  ChevronLeft,
  CheckCircle2,
  ExternalLink,
} from "lucide-react"

// This would come from your database in a real app
const adData = {
  id: 1,
  title: "Premium Office Space Downtown",
  description: `Stunning modern office space located in the heart of downtown Manhattan. This premium listing offers:

• 2,500 sq ft of open floor plan
• Floor-to-ceiling windows with panoramic city views
• State-of-the-art HVAC system
• 24/7 security and building access
• On-site parking available
• Conference room and break room included
• High-speed fiber internet ready
• Recently renovated with modern finishes

Perfect for startups, creative agencies, or established businesses looking for a prestigious address. Located near major subway lines and within walking distance of numerous restaurants and amenities.

Flexible lease terms available. Schedule a tour today!`,
  price: "$2,500/mo",
  city: "New York",
  category: "Real Estate",
  package: "premium" as const,
  status: "published" as const,
  images: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=600&fit=crop",
  ],
  postedAt: "March 1, 2026",
  expiresAt: "March 31, 2026",
  views: 1247,
  seller: {
    name: "Metro Realty Group",
    verified: true,
    memberSince: "2024",
    totalAds: 45,
    email: "contact@metrorealty.com",
    phone: "+1 (212) 555-0123",
  },
}

export default async function AdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log("[v0] Ad ID:", id)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm">
            <Link href="/explore" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
              Back to listings
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{adData.category}</span>
            <span className="text-muted-foreground">/</span>
            <span className="truncate">{adData.title}</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              <div className="overflow-hidden rounded-xl">
                <div className="relative aspect-video">
                  <Image
                    src={adData.images[0]}
                    alt={adData.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute right-3 top-3 flex gap-2">
                    <PackageBadge packageType={adData.package} />
                    <StatusBadge status={adData.status} />
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {adData.images.slice(1).map((image, index) => (
                    <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                      <Image
                        src={image}
                        alt={`${adData.title} - Image ${index + 2}`}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Title and meta */}
              <div className="mt-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold sm:text-3xl">{adData.title}</h1>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {adData.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Posted {adData.postedAt}
                  </span>
                  <span>{adData.views.toLocaleString()} views</span>
                </div>
                <p className="mt-4 text-3xl font-bold text-primary">{adData.price}</p>
              </div>

              {/* Description */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold">Description</h2>
                <div className="mt-4 whitespace-pre-wrap text-muted-foreground">
                  {adData.description}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Flag className="mr-2 h-4 w-4" />
                  Report Ad
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Seller Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Seller Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{adData.seller.name}</span>
                        {adData.seller.verified && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Member since {adData.seller.memberSince} • {adData.seller.totalAds} ads
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Seller
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Phone className="mr-2 h-4 w-4" />
                      Call Now
                    </Button>
                  </div>

                  <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
                    <p className="font-medium">Safety Tips</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• Meet in a public place</li>
                      <li>• Verify the item before payment</li>
                      <li>• Never send money in advance</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Listing Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Listing Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Category</dt>
                      <dd className="font-medium">{adData.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Location</dt>
                      <dd className="font-medium">{adData.city}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Package</dt>
                      <dd><PackageBadge packageType={adData.package} /></dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Posted</dt>
                      <dd className="font-medium">{adData.postedAt}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Expires</dt>
                      <dd className="font-medium">{adData.expiresAt}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Ad ID</dt>
                      <dd className="font-mono text-xs">#AD-{String(adData.id).padStart(6, '0')}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Similar Ads */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Similar Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Link key={i} href={`/ads/${i}`} className="flex gap-3 group">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={`https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=100&h=100&fit=crop&q=${i}`}
                            alt="Similar listing"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium group-hover:text-primary">
                            Modern Office Space
                          </p>
                          <p className="text-sm font-semibold text-primary">$2,{i}00/mo</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
