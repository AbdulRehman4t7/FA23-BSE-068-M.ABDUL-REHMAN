import { CATEGORIES, PACKAGES, PAKISTAN_CITIES } from '@/lib/constants'

export type MockAdStatus =
  | 'published'
  | 'under_review'
  | 'payment_pending'
  | 'draft'
  | 'expired'
  | 'rejected'

export interface MockMedia {
  thumbnail_url: string
  original_url: string
  source_type: 'IMAGE' | 'YOUTUBE'
}

export interface MockSellerProfile {
  display_name: string
  business_name: string
  phone: string
  is_verified: boolean
  email?: string
}

export interface MockAd {
  id: number
  slug: string
  title: string
  description: string
  price: number
  status: MockAdStatus
  category: { id: string; name: string; slug: string }
  city: { id: string; name: string; slug: string }
  package: { id: string; name: string; weight: number; is_featured: boolean; duration_days: number }
  publish_at: string
  expire_at: string
  created_at: string
  views: number
  is_featured: boolean
  seller_profiles: MockSellerProfile
  ad_media: MockMedia[]
}

type MockDbState = {
  categories: MockAd['category'][]
  cities: MockAd['city'][]
  packages: MockAd['package'][]
  ads: MockAd[]
  payments: Array<{
    id: number
    ad_id: number
    amount: number
    method: string
    transaction_ref: string
    sender_name: string
    screenshot_url?: string
    status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  }>
}

function toSlug(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function addDaysIso(daysFromNow: number) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString()
}

function initialState(): MockDbState {
  const categories = CATEGORIES.map((c) => ({
    id: `cat-${c.slug}`,
    name: c.name,
    slug: c.slug,
  }))
  const cities = PAKISTAN_CITIES.map((c) => ({
    id: `city-${c.slug}`,
    name: c.name,
    slug: c.slug,
  }))

  const packages = PACKAGES.map((p) => ({
    id: p.id,
    name: p.id,
    weight: p.id === 'basic' ? 1 : p.id === 'standard' ? 2 : 3,
    is_featured: p.id === 'premium',
    duration_days: p.duration,
  }))

  const seller1: MockSellerProfile = {
    display_name: 'Metro Realty Group',
    business_name: 'Metro Realty Group',
    phone: '+92 300 1234567',
    is_verified: true,
  }
  const seller2: MockSellerProfile = {
    display_name: 'EliteCars',
    business_name: 'EliteCars',
    phone: '+92 301 2345678',
    is_verified: true,
  }
  const seller3: MockSellerProfile = {
    display_name: 'PhotoPro',
    business_name: 'PhotoPro',
    phone: '+92 302 3456789',
    is_verified: true,
  }
  const seller4: MockSellerProfile = {
    display_name: 'TimelessPieces',
    business_name: 'TimelessPieces',
    phone: '+92 303 4567890',
    is_verified: true,
  }
  const seller5: MockSellerProfile = {
    display_name: 'BayRentals',
    business_name: 'BayRentals',
    phone: '+92 304 5678901',
    is_verified: false,
  }

  const ads: MockAd[] = [
    {
      id: 1,
      slug: 'premium-office-space-downtown',
      title: 'Premium Office Space Downtown',
      description:
        'Modern office space with stunning city views. Floor-to-ceiling windows, secure access, and convenient location for teams.',
      price: 2500,
      status: 'published',
      category: categories.find((c) => c.name === 'Real Estate') ?? categories[0],
      city: cities.find((x) => x.name === 'Karachi') ?? cities[0],
      package: packages.find((p) => p.id === 'premium') ?? packages[2],
      publish_at: new Date(addDaysIso(-8)).toISOString(),
      expire_at: addDaysIso(25),
      created_at: addDaysIso(-8),
      views: 1247,
      is_featured: true,
      seller_profiles: seller1,
      ad_media: [
        {
          source_type: 'IMAGE',
          original_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=900&fit=crop',
          thumbnail_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
        },
      ],
    },
    {
      id: 2,
      slug: '2023-tesla-model-s',
      title: '2023 Tesla Model S',
      description:
        'Like new condition, full self-driving capability, and a clean history report. Serious buyers only.',
      price: 89999,
      status: 'published',
      category: categories.find((c) => c.name === 'Vehicles') ?? categories[0],
      city: cities.find((x) => x.name === 'Lahore') ?? cities[1],
      package: packages.find((p) => p.id === 'premium') ?? packages[2],
      publish_at: addDaysIso(-10),
      expire_at: addDaysIso(20),
      created_at: addDaysIso(-10),
      views: 342,
      is_featured: true,
      seller_profiles: seller2,
      ad_media: [
        {
          source_type: 'IMAGE',
          original_url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&h=900&fit=crop',
          thumbnail_url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=600&fit=crop',
        },
      ],
    },
    {
      id: 3,
      slug: 'professional-photography-services',
      title: 'Professional Photography Services',
      description:
        'Wedding, events, and portrait photography. High-quality editing and quick turnaround time.',
      price: 150,
      status: 'payment_pending',
      category: categories.find((c) => c.name === 'Services') ?? categories[3],
      city: cities.find((x) => x.name === 'Islamabad') ?? cities[2],
      package: packages.find((p) => p.id === 'standard') ?? packages[1],
      publish_at: addDaysIso(-3),
      expire_at: addDaysIso(10),
      created_at: addDaysIso(-3),
      views: 21,
      is_featured: false,
      seller_profiles: seller3,
      ad_media: [
        {
          source_type: 'IMAGE',
          original_url: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1200&h=900&fit=crop',
          thumbnail_url: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&h=600&fit=crop',
        },
      ],
    },
    {
      id: 4,
      slug: 'vintage-watch-collection',
      title: 'Vintage Watch Collection',
      description:
        'Curated Rolex and Omega pieces from the 1960s. Authenticity guaranteed with receipts.',
      price: 12500,
      status: 'published',
      category: categories.find((c) => c.name === 'Collectibles') ?? categories[6],
      city: cities.find((x) => x.name === 'Quetta') ?? cities[7],
      package: packages.find((p) => p.id === 'premium') ?? packages[2],
      publish_at: addDaysIso(-18),
      expire_at: addDaysIso(28),
      created_at: addDaysIso(-18),
      views: 892,
      is_featured: true,
      seller_profiles: seller4,
      ad_media: [
        {
          source_type: 'IMAGE',
          original_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1200&h=900&fit=crop',
          thumbnail_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=600&fit=crop',
        },
      ],
    },
    {
      id: 5,
      slug: 'luxury-apartment-for-rent',
      title: 'Luxury Apartment for Rent',
      description:
        '2BR/2BA apartment with modern amenities, parking, and quick access to local services.',
      price: 4200,
      status: 'published',
      category: categories.find((c) => c.name === 'Real Estate') ?? categories[0],
      city: cities.find((x) => x.name === 'Karachi') ?? cities[0],
      package: packages.find((p) => p.id === 'standard') ?? packages[1],
      publish_at: addDaysIso(-7),
      expire_at: addDaysIso(12),
      created_at: addDaysIso(-7),
      views: 210,
      is_featured: false,
      seller_profiles: seller5,
      ad_media: [
        {
          source_type: 'IMAGE',
          original_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=900&fit=crop',
          thumbnail_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
        },
      ],
    },
  ]

  // Seed demo ownership so dashboard screens show example listings immediately.
  ads.forEach((ad) => {
    ;(ad as any).user_id = 'demo-user'
  })

  return { categories, cities, packages, ads, payments: [] }
}

let state = initialState()

function getCategoryById(category_id: string) {
  return state.categories.find((c) => c.id === category_id) ?? state.categories[0]
}

function getCityById(city_id: string) {
  return state.cities.find((c) => c.id === city_id) ?? state.cities[0]
}

function getPackageById(package_id: string) {
  return state.packages.find((p) => p.id === package_id) ?? state.packages[0]
}

function getNextAdId() {
  const max = state.ads.reduce((m, a) => Math.max(m, a.id), 0)
  return max + 1
}

function getNextPaymentId() {
  const max = state.payments.reduce((m, p) => Math.max(m, p.id), 0)
  return max + 1
}

export function mockGetCategories() {
  return state.categories
}

export function mockGetCities() {
  return state.cities
}

export function mockGetPackages() {
  return state.packages
}

export function mockListPublishedAds(filters?: { category?: string; city?: string }) {
  const status = 'published'
  const categorySlug = filters?.category
  const citySlug = filters?.city

  return state.ads
    .filter((ad) => ad.status === status)
    .filter((ad) => (!categorySlug ? true : ad.category.slug === categorySlug))
    .filter((ad) => (!citySlug ? true : ad.city.slug === citySlug))
    .sort((a, b) => (b.is_featured === a.is_featured ? b.created_at.localeCompare(a.created_at) : b.is_featured ? 1 : -1))
}

export function mockGetAdBySlug(slug: string) {
  return state.ads.find((ad) => ad.slug === slug) ?? null
}

export function mockCreateAdDraft(input: {
  user_id: string
  title: string
  description: string
  category_id: string
  city_id: string
  package_id: string
  mediaUrls?: string[]
  seller_profiles?: Partial<MockSellerProfile>
}) {
  const id = getNextAdId()
  const slug = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + String(id)

  const category = getCategoryById(input.category_id)
  const city = getCityById(input.city_id)
  const pkg = getPackageById(input.package_id)

  const thumbnail = input.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1200&h=900&fit=crop'
  const ad: MockAd = {
    id,
    slug,
    title: input.title,
    description: input.description,
    price: pkg.id === 'basic' ? 0 : pkg.id === 'standard' ? 500 : 1500,
    status: 'draft',
    category,
    city,
    package: pkg,
    publish_at: addDaysIso(-1),
    expire_at: addDaysIso(pkg.duration_days),
    created_at: new Date().toISOString(),
    views: 0,
    is_featured: pkg.is_featured,
    seller_profiles: {
      display_name: input.seller_profiles?.display_name || 'Demo Seller',
      business_name: input.seller_profiles?.business_name || 'Demo Seller',
      phone: input.seller_profiles?.phone || '+92 300 0000000',
      is_verified: input.seller_profiles?.is_verified ?? true,
      email: input.seller_profiles?.email,
    },
    ad_media: [
      {
        source_type: 'IMAGE',
        original_url: thumbnail,
        thumbnail_url: thumbnail,
      },
    ],
  }

  // Store user_id in a non-typed way for dashboard filtering
  ;(ad as any).user_id = input.user_id
  state.ads.push(ad)
  return ad
}

export function mockSubmitPayment(input: {
  ad_id: number
  amount: number
  method: string
  transaction_ref: string
  sender_name: string
  screenshot_url?: string
  user_id: string
}) {
  const ad = state.ads.find((a) => a.id === input.ad_id)
  if (!ad) return { ok: false, error: 'Ad not found' }
  const payment = {
    id: getNextPaymentId(),
    ad_id: input.ad_id,
    amount: input.amount,
    method: input.method,
    transaction_ref: input.transaction_ref,
    sender_name: input.sender_name,
    screenshot_url: input.screenshot_url,
    status: 'PENDING' as const,
  }
  state.payments.push(payment)

  // Demo logic: immediately publish after payment proof.
  ad.status = 'published'
  ad.is_featured = ad.package.is_featured
  ad.publish_at = new Date().toISOString()
  return { ok: true, payment }
}

export function mockListClientDashboard(input: { user_id: string }) {
  const ads = state.ads
    .filter((ad) => (ad as any).user_id === input.user_id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  const stats = {
    total: ads.length,
    active: ads.filter((ad) => ad.status === 'published').length,
    pending: ads.filter((ad) => ['under_review', 'payment_pending'].includes(ad.status)).length,
    expired: ads.filter((ad) => ad.status === 'expired').length,
  }

  const profile = {
    user_id: input.user_id,
    display_name: 'Demo User',
    business_name: 'Demo Business',
    phone: '+92 300 1234567',
    is_verified: true,
  }

  return { ads, profile, stats }
}

