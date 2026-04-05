import { CATEGORIES, LIFE_CYCLE, PACKAGES, PAKISTAN_CITIES } from "@/lib/constants";

export type MockRole = "CLIENT" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
export type MockAdStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "payment_pending"
  | "payment_submitted"
  | "payment_verified"
  | "scheduled"
  | "published"
  | "expired"
  | "archived"
  | "rejected";

export interface MockMedia {
  id: string;
  source_type: "IMAGE" | "YOUTUBE" | "PLACEHOLDER";
  original_url: string;
  thumbnail_url: string;
}

export interface MockSellerProfile {
  user_id: string;
  display_name: string;
  business_name: string;
  phone: string;
  is_verified: boolean;
  badge: "verified" | "trusted" | "new";
  city_slug: string;
  email?: string;
}

export interface MockAd {
  id: number;
  user_id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  status: MockAdStatus;
  category: { id: string; name: string; slug: string };
  city: { id: string; name: string; slug: string };
  package: {
    id: string;
    name: string;
    weight: number;
    is_featured: boolean;
    duration_days: number;
    ranking_weight: number;
  };
  publish_at: string | null;
  scheduled_for: string | null;
  expire_at: string | null;
  created_at: string;
  updated_at: string;
  views: number;
  is_featured: boolean;
  admin_boost: number;
  freshness: number;
  verified_seller_bonus: number;
  rank_score: number;
  moderation_notes?: string;
  payment_required: boolean;
  seller_profiles: MockSellerProfile;
  ad_media: MockMedia[];
}

type MockPayment = {
  id: number;
  ad_id: number;
  user_id: string;
  amount: number;
  method: string;
  transaction_ref: string;
  sender_name: string;
  screenshot_url?: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  submitted_at: string;
  note?: string;
};

type MockNotification = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  kind: "info" | "warning" | "success";
  created_at: string;
};

type MockAuditLog = {
  id: string;
  entity_type: "ad" | "payment" | "system";
  entity_id: string;
  action: string;
  actor_id: string;
  details: string;
  created_at: string;
};

type MockStatusHistory = {
  id: string;
  ad_id: number;
  previous_status: MockAdStatus | null;
  new_status: MockAdStatus;
  changed_by: string;
  note?: string;
  created_at: string;
};

type MockHealthLog = {
  id: string;
  status: "healthy" | "degraded";
  db_latency_ms: number;
  queue_depth: number;
  created_at: string;
};

type MockDbState = {
  users: Array<{ id: string; role: MockRole; email: string; name: string }>;
  seller_profiles: MockSellerProfile[];
  categories: MockAd["category"][];
  cities: MockAd["city"][];
  packages: MockAd["package"][];
  ads: MockAd[];
  payments: MockPayment[];
  notifications: MockNotification[];
  audit_logs: MockAuditLog[];
  ad_status_history: MockStatusHistory[];
  system_health_logs: MockHealthLog[];
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&h=900&fit=crop";

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function nowIso() {
  return new Date().toISOString();
}

function addDaysIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function extractYoutubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
  );
  return match?.[1] ?? null;
}

function normalizeMedia(url?: string, id = "media-1"): MockMedia {
  if (!url) {
    return {
      id,
      source_type: "PLACEHOLDER",
      original_url: PLACEHOLDER_IMAGE,
      thumbnail_url: PLACEHOLDER_IMAGE,
    };
  }

  const youtubeId = extractYoutubeId(url);
  if (youtubeId) {
    return {
      id,
      source_type: "YOUTUBE",
      original_url: url,
      thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  }

  try {
    const parsed = new URL(url);
    const isImage = /\.(jpg|jpeg|png|webp|avif|gif)(\?|$)/i.test(parsed.pathname);
    if (["http:", "https:"].includes(parsed.protocol) && isImage) {
      return {
        id,
        source_type: "IMAGE",
        original_url: url,
        thumbnail_url: url,
      };
    }
  } catch (_error) {}

  return {
    id,
    source_type: "PLACEHOLDER",
    original_url: url,
    thumbnail_url: PLACEHOLDER_IMAGE,
  };
}

function computeRankScore(input: {
  is_featured: boolean;
  packageWeight: number;
  freshness: number;
  adminBoost: number;
  verifiedSellerBonus: number;
}) {
  return (
    (input.is_featured ? 50 : 0) +
    input.packageWeight * 10 +
    input.freshness +
    input.adminBoost +
    input.verifiedSellerBonus
  );
}

function mapPackageWeight(id: string) {
  if (id === "premium") return 3;
  if (id === "standard") return 2;
  return 1;
}

function buildBaseLookups() {
  const categories = CATEGORIES.map((category) => ({
    id: `cat-${category.slug}`,
    name: category.name,
    slug: category.slug,
  }));

  const cities = PAKISTAN_CITIES.map((city) => ({
    id: `city-${city.slug}`,
    name: city.name,
    slug: city.slug,
  }));

  const packages = PACKAGES.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    weight: mapPackageWeight(pkg.id),
    ranking_weight: pkg.weight,
    is_featured: pkg.featuredBoost > 0,
    duration_days: pkg.duration,
  }));

  return { categories, cities, packages };
}

function buildSellerProfiles(): MockSellerProfile[] {
  return [
    {
      user_id: "user-client-1",
      display_name: "Metro Realty Group",
      business_name: "Metro Realty Group",
      phone: "+92 300 1234567",
      is_verified: true,
      badge: "trusted",
      city_slug: "karachi",
      email: "client@demo.com",
    },
    {
      user_id: "user-client-2",
      display_name: "Elite Motors",
      business_name: "Elite Motors",
      phone: "+92 311 5554433",
      is_verified: true,
      badge: "verified",
      city_slug: "lahore",
      email: "elite@demo.com",
    },
    {
      user_id: "user-client-3",
      display_name: "Pixel Craft Studio",
      business_name: "Pixel Craft Studio",
      phone: "+92 321 6543210",
      is_verified: false,
      badge: "new",
      city_slug: "islamabad",
      email: "studio@demo.com",
    },
    {
      user_id: "user-client-4",
      display_name: "Prime Rentals",
      business_name: "Prime Rentals",
      phone: "+92 333 1029384",
      is_verified: true,
      badge: "verified",
      city_slug: "rawalpindi",
      email: "prime@demo.com",
    },
  ];
}

function createAd(seed: {
  id: number;
  user_id: string;
  title: string;
  description: string;
  price: number;
  status: MockAdStatus;
  categorySlug: string;
  citySlug: string;
  packageId: string;
  createdDaysAgo: number;
  publishDaysAgo?: number;
  scheduleInDays?: number;
  adminBoost?: number;
  views?: number;
  mediaUrl?: string;
  moderationNotes?: string;
}) {
  const { categories, cities, packages } = buildBaseLookups();
  const sellers = buildSellerProfiles();
  const category = categories.find((item) => item.slug === seed.categorySlug) ?? categories[0];
  const city = cities.find((item) => item.slug === seed.citySlug) ?? cities[0];
  const pkg = packages.find((item) => item.id === seed.packageId) ?? packages[0];
  const seller = sellers.find((item) => item.user_id === seed.user_id) ?? sellers[0];
  const freshness = Math.max(2, 20 - seed.createdDaysAgo);
  const verifiedSellerBonus = seller.is_verified ? 5 : 0;
  const rank_score = computeRankScore({
    is_featured: pkg.is_featured,
    packageWeight: pkg.weight,
    freshness,
    adminBoost: seed.adminBoost ?? 0,
    verifiedSellerBonus,
  });
  const publishAt =
    seed.status === "published" || seed.status === "expired"
      ? addDaysIso(-(seed.publishDaysAgo ?? seed.createdDaysAgo))
      : null;
  const scheduledFor = seed.status === "scheduled" ? addDaysIso(seed.scheduleInDays ?? 1) : null;
  const expireAt =
    seed.status === "published"
      ? addDaysIso(pkg.duration_days - (seed.publishDaysAgo ?? 0))
      : seed.status === "expired"
      ? addDaysIso(-1)
      : null;

  return {
    id: seed.id,
    user_id: seed.user_id,
    slug: `${toSlug(seed.title)}-${seed.id}`,
    title: seed.title,
    description: seed.description,
    price: seed.price,
    status: seed.status,
    category,
    city,
    package: pkg,
    publish_at: publishAt,
    scheduled_for: scheduledFor,
    expire_at: expireAt,
    created_at: addDaysIso(-seed.createdDaysAgo),
    updated_at: nowIso(),
    views: seed.views ?? 0,
    is_featured: pkg.is_featured,
    admin_boost: seed.adminBoost ?? 0,
    freshness,
    verified_seller_bonus: verifiedSellerBonus,
    rank_score,
    moderation_notes: seed.moderationNotes,
    payment_required: true,
    seller_profiles: seller,
    ad_media: [normalizeMedia(seed.mediaUrl, `media-${seed.id}`)],
  } satisfies MockAd;
}

function buildInitialAds() {
  return [
    createAd({ id: 1, user_id: "user-client-1", title: "Premium Office Space in Clifton", description: "Furnished corporate office with reception, generator backup, and premium frontage for sponsored listings.", price: 325000, status: "published", categorySlug: "real-estate", citySlug: "karachi", packageId: "premium", createdDaysAgo: 4, publishDaysAgo: 3, adminBoost: 10, views: 1247, mediaUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=900&fit=crop" }),
    createAd({ id: 2, user_id: "user-client-2", title: "Toyota Fortuner Legender 2024", description: "Zero-meter SUV with company invoice, full option package, and verified seller support.", price: 21500000, status: "published", categorySlug: "vehicles", citySlug: "lahore", packageId: "premium", createdDaysAgo: 8, publishDaysAgo: 7, adminBoost: 8, views: 932, mediaUrl: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=1200&h=900&fit=crop" }),
    createAd({ id: 3, user_id: "user-client-3", title: "Wedding Photography Studio Package", description: "Full-day photography and cinematic coverage with same-week teaser delivery and high-retention engagement.", price: 180000, status: "payment_pending", categorySlug: "services", citySlug: "islamabad", packageId: "standard", createdDaysAgo: 2, adminBoost: 3, mediaUrl: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1200&h=900&fit=crop" }),
    createAd({ id: 4, user_id: "user-client-4", title: "Executive Apartment in Bahria Town", description: "Serviced apartment ideal for executives, featuring secure access, parking, and on-demand housekeeping.", price: 145000, status: "scheduled", categorySlug: "real-estate", citySlug: "rawalpindi", packageId: "premium", createdDaysAgo: 3, scheduleInDays: 2, adminBoost: 6, mediaUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=900&fit=crop" }),
    createAd({ id: 5, user_id: "user-client-1", title: "MacBook Pro M3 Max 16 Inch", description: "Like-new workstation laptop with box, warranty, and invoice. Perfect for design studios and founders.", price: 1185000, status: "submitted", categorySlug: "electronics", citySlug: "karachi", packageId: "standard", createdDaysAgo: 1, mediaUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&h=900&fit=crop" }),
    createAd({ id: 6, user_id: "user-client-2", title: "Luxury Watch Collector Set", description: "Curated watch set from premium brands with serialized authenticity cards and insured delivery.", price: 2450000, status: "expired", categorySlug: "collectibles", citySlug: "lahore", packageId: "premium", createdDaysAgo: 37, publishDaysAgo: 35, views: 677, mediaUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1200&h=900&fit=crop" }),
    createAd({ id: 7, user_id: "user-client-3", title: "Growth Marketing Retainer", description: "Performance marketing setup with funnel tracking, creatives, and weekly conversion review reports.", price: 225000, status: "under_review", categorySlug: "services", citySlug: "islamabad", packageId: "standard", createdDaysAgo: 1, mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=900&fit=crop" }),
    createAd({ id: 8, user_id: "user-client-4", title: "Designer Bridal Couture Collection", description: "Hand-embellished formal collection for festive campaigns, bridal showcases, and premium boutiques.", price: 390000, status: "published", categorySlug: "fashion", citySlug: "rawalpindi", packageId: "standard", createdDaysAgo: 6, publishDaysAgo: 4, adminBoost: 2, views: 289, mediaUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&h=900&fit=crop" }),
    createAd({ id: 9, user_id: "user-client-1", title: "Remote Senior React Engineer Position", description: "Sponsored hiring slot for senior frontend engineers with App Router experience and analytics ownership.", price: 0, status: "payment_verified", categorySlug: "jobs", citySlug: "karachi", packageId: "basic", createdDaysAgo: 2, adminBoost: 1, mediaUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=900&fit=crop" }),
    createAd({ id: 10, user_id: "user-client-2", title: "Premium Camera Lens Bundle", description: "Sony creator bundle with wide, portrait, and event lenses, maintained in studio condition.", price: 780000, status: "draft", categorySlug: "electronics", citySlug: "lahore", packageId: "basic", createdDaysAgo: 0, mediaUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=900&fit=crop" }),
    createAd({ id: 11, user_id: "user-client-3", title: "Cloud Kitchen Franchise Opportunity", description: "Sponsored business opportunity with supply chain playbook, POS setup, and launch support.", price: 950000, status: "payment_submitted", categorySlug: "services", citySlug: "islamabad", packageId: "premium", createdDaysAgo: 2, adminBoost: 4, mediaUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=900&fit=crop" }),
    createAd({ id: 12, user_id: "user-client-4", title: "Warehouse Listing in Korangi", description: "Operational warehouse with loading bay, CCTV, and distribution access for logistics-led advertisers.", price: 480000, status: "published", categorySlug: "real-estate", citySlug: "karachi", packageId: "standard", createdDaysAgo: 10, publishDaysAgo: 8, views: 510, mediaUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=900&fit=crop" }),
    createAd({ id: 13, user_id: "user-client-1", title: "Premium Luxury Sedan on Installments", description: "Dealer-backed sponsored listing with financing options, inspection report, and national transfer support.", price: 9650000, status: "published", categorySlug: "vehicles", citySlug: "faisalabad", packageId: "premium", createdDaysAgo: 5, publishDaysAgo: 2, views: 801, adminBoost: 9, mediaUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=900&fit=crop" }),
    createAd({ id: 14, user_id: "user-client-2", title: "Luxury Pretwear Eid Drop", description: "High-converting fashion campaign inventory with shoot assets and immediate dispatch support.", price: 125000, status: "archived", categorySlug: "fashion", citySlug: "multan", packageId: "basic", createdDaysAgo: 25, mediaUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=900&fit=crop" }),
    createAd({ id: 15, user_id: "user-client-3", title: "Rare Comic Books Investment Lot", description: "Catalogued collectible set for investors and enthusiasts, ideal for premium category placement.", price: 340000, status: "rejected", categorySlug: "collectibles", citySlug: "quetta", packageId: "basic", createdDaysAgo: 3, moderationNotes: "Missing provenance documents for key collector items.", mediaUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&h=900&fit=crop" }),
    createAd({ id: 16, user_id: "user-client-4", title: "B2B CRM Implementation Service", description: "CRM setup package with migration, automation, dashboards, and executive enablement workshops.", price: 415000, status: "published", categorySlug: "services", citySlug: "peshawar", packageId: "premium", createdDaysAgo: 7, publishDaysAgo: 5, adminBoost: 7, views: 444, mediaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }),
  ];
}

function initialState(): MockDbState {
  const { categories, cities, packages } = buildBaseLookups();
  const seller_profiles = buildSellerProfiles();
  const ads = buildInitialAds();
  const users = [
    { id: "demo-user", role: "CLIENT" as const, email: "demo@example.com", name: "Demo User" },
    { id: "user-client-1", role: "CLIENT" as const, email: "client@demo.com", name: "Client One" },
    { id: "user-client-2", role: "CLIENT" as const, email: "elite@demo.com", name: "Client Two" },
    { id: "user-client-3", role: "CLIENT" as const, email: "studio@demo.com", name: "Client Three" },
    { id: "user-client-4", role: "CLIENT" as const, email: "prime@demo.com", name: "Client Four" },
    { id: "user-moderator-1", role: "MODERATOR" as const, email: "mod@demo.com", name: "Moderator" },
    { id: "user-admin-1", role: "ADMIN" as const, email: "admin@demo.com", name: "Admin" },
    { id: "user-super-1", role: "SUPER_ADMIN" as const, email: "super@demo.com", name: "Super Admin" },
  ];

  const payments: MockPayment[] = [
    { id: 1, ad_id: 11, user_id: "user-client-3", amount: 1500, method: "Bank Transfer", transaction_ref: "TXN-ADFLOW-001", sender_name: "Pixel Craft Studio", screenshot_url: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1200&h=900&fit=crop", status: "PENDING", submitted_at: nowIso() },
    { id: 2, ad_id: 9, user_id: "user-client-1", amount: 0, method: "Manual Waiver", transaction_ref: "TXN-ADFLOW-002", sender_name: "Metro Realty Group", status: "VERIFIED", submitted_at: addDaysIso(-2) },
  ];

  const notifications: MockNotification[] = [
    { id: "notif-1", user_id: "user-client-1", title: "Ad published successfully", body: "Your premium office space listing is live and ranked in featured slots.", kind: "success", created_at: addDaysIso(-1) },
    { id: "notif-2", user_id: "user-client-3", title: "Payment awaiting verification", body: "Your payment proof has been received and moved to admin verification queue.", kind: "info", created_at: nowIso() },
  ];

  const audit_logs: MockAuditLog[] = [];
  const ad_status_history: MockStatusHistory[] = ads.map((ad) => ({
    id: `history-seed-${ad.id}`,
    ad_id: ad.id,
    previous_status: null,
    new_status: ad.status,
    changed_by: ad.user_id,
    note: LIFE_CYCLE.includes(ad.status as never) ? "Seeded initial state" : "Seeded",
    created_at: ad.created_at,
  }));
  const system_health_logs: MockHealthLog[] = [
    { id: "health-1", status: "healthy", db_latency_ms: 41, queue_depth: 3, created_at: nowIso() },
  ];

  return {
    users,
    seller_profiles,
    categories,
    cities,
    packages,
    ads,
    payments,
    notifications,
    audit_logs,
    ad_status_history,
    system_health_logs,
  };
}

const globalForMockDb = global as unknown as { mockDbState?: MockDbState };
let state = globalForMockDb.mockDbState || initialState();
if (process.env.NODE_ENV !== "production") globalForMockDb.mockDbState = state;

function getNextId(list: Array<{ id: number }>) {
  return list.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function getPackageById(id: string) {
  return state.packages.find((pkg) => pkg.id === id) ?? state.packages[0];
}

function getCategoryById(id: string) {
  return state.categories.find((category) => category.id === id) ?? state.categories[0];
}

function getCityById(id: string) {
  return state.cities.find((city) => city.id === id) ?? state.cities[0];
}

function getSellerByUserId(user_id: string) {
  return (
    state.seller_profiles.find((seller) => seller.user_id === user_id) ?? {
      user_id,
      display_name: "Demo Seller",
      business_name: "Demo Seller",
      phone: "+92 300 0000000",
      is_verified: false,
      badge: "new" as const,
      city_slug: "karachi",
      email: "demo@example.com",
    }
  );
}

function logAudit(entity_type: MockAuditLog["entity_type"], entity_id: string, action: string, actor_id: string, details: string) {
  state.audit_logs.unshift({ id: `audit-${state.audit_logs.length + 1}`, entity_type, entity_id, action, actor_id, details, created_at: nowIso() });
}

function addNotification(user_id: string, title: string, body: string, kind: MockNotification["kind"] = "info") {
  state.notifications.unshift({ id: `notif-${state.notifications.length + 1}`, user_id, title, body, kind, created_at: nowIso() });
}

function transitionAd(ad: MockAd, nextStatus: MockAdStatus, actorId: string, note?: string) {
  const previous = ad.status;
  ad.status = nextStatus;
  ad.updated_at = nowIso();

  if (nextStatus === "published") {
    ad.publish_at = nowIso();
    ad.expire_at = addDaysIso(ad.package.duration_days);
    ad.scheduled_for = null;
  }

  state.ad_status_history.unshift({
    id: `history-${state.ad_status_history.length + 1}`,
    ad_id: ad.id,
    previous_status: previous,
    new_status: nextStatus,
    changed_by: actorId,
    note,
    created_at: nowIso(),
  });

  logAudit("ad", String(ad.id), `transition:${previous}->${nextStatus}`, actorId, note ?? "Workflow state updated");
}

function serializeAd(ad: MockAd) {
  return {
    ...ad,
    status: ad.status.toUpperCase(),
    categories: ad.category,
    cities: ad.city,
    packages: ad.package,
  };
}

export function mockGetCategories() {
  return state.categories;
}

export function mockGetCities() {
  return state.cities;
}

export function mockGetPackages() {
  return state.packages.map((pkg) => ({
    ...pkg,
    price: PACKAGES.find((item) => item.id === pkg.id)?.price ?? 0,
    featured_boost: PACKAGES.find((item) => item.id === pkg.id)?.featuredBoost ?? 0,
  }));
}

export function mockListPublishedAds(filters?: { category?: string | null; city?: string | null; search?: string | null; featured?: boolean; page?: number; limit?: number }) {
  const page = filters?.page && filters.page > 0 ? filters.page : 1;
  const limit = filters?.limit && filters.limit > 0 ? filters.limit : 9;
  const q = filters?.search?.trim().toLowerCase();

  const all = state.ads
    .filter((ad) => ad.status === "published" && (!ad.expire_at || new Date(ad.expire_at) > new Date()))
    .filter((ad) => (filters?.category ? ad.category.slug === filters.category : true))
    .filter((ad) => (filters?.city ? ad.city.slug === filters.city : true))
    .filter((ad) => (filters?.featured ? ad.is_featured : true))
    .filter((ad) => !q ? true : [ad.title, ad.description, ad.city.name, ad.category.name, ad.seller_profiles.business_name].join(" ").toLowerCase().includes(q))
    .sort((a, b) => b.rank_score - a.rank_score || b.views - a.views || b.created_at.localeCompare(a.created_at));

  const start = (page - 1) * limit;
  return { data: all.slice(start, start + limit), meta: { page, limit, total: all.length, pages: Math.max(1, Math.ceil(all.length / limit)) } };
}

export function mockGetAdBySlug(slug: string) {
  const ad = state.ads.find((item) => item.slug === slug || String(item.id) === slug) ?? null;
  if (ad && ad.status === "published") ad.views += 1;
  return ad;
}

export function mockCreateAdDraft(input: { user_id: string; title: string; description: string; category_id: string; city_id: string; package_id: string; mediaUrls?: string[]; seller_profiles?: Partial<MockSellerProfile> }) {
  const id = getNextId(state.ads);
  const category = getCategoryById(input.category_id);
  const city = getCityById(input.city_id);
  const pkg = getPackageById(input.package_id);
  const seller = { ...getSellerByUserId(input.user_id), ...input.seller_profiles, user_id: input.user_id };
  const freshness = 20;
  const verifiedSellerBonus = seller.is_verified ? 5 : 0;
  const ad: MockAd = {
    id,
    user_id: input.user_id,
    slug: `${toSlug(input.title)}-${id}`,
    title: input.title,
    description: input.description,
    price: PACKAGES.find((pack) => pack.id === pkg.id)?.price ?? 0,
    status: "draft",
    category,
    city,
    package: pkg,
    publish_at: null,
    scheduled_for: null,
    expire_at: null,
    created_at: nowIso(),
    updated_at: nowIso(),
    views: 0,
    is_featured: pkg.is_featured,
    admin_boost: 0,
    freshness,
    verified_seller_bonus: verifiedSellerBonus,
    rank_score: computeRankScore({ is_featured: pkg.is_featured, packageWeight: pkg.weight, freshness, adminBoost: 0, verifiedSellerBonus }),
    payment_required: true,
    seller_profiles: seller,
    ad_media: [normalizeMedia(input.mediaUrls?.[0], `media-${id}`)],
  };

  state.ads.unshift(ad);
  logAudit("ad", String(ad.id), "client:create", input.user_id, "Client created a draft");
  addNotification(input.user_id, "Draft saved", `Your ad "${ad.title}" has been saved as a draft.`, "success");
  return ad;
}

export function mockUpdateClientAd(input: { ad_id: number; user_id: string; title?: string; description?: string; category_id?: string; city_id?: string; package_id?: string; mediaUrls?: string[] }) {
  const ad = state.ads.find((item) => item.id === input.ad_id);
  if (!ad) return { ok: false, error: "Ad not found" as const };
  if (ad.user_id !== input.user_id) return { ok: false, error: "Forbidden" as const };
  if (ad.status !== "draft") return { ok: false, error: "Only draft ads can be edited" as const };

  if (input.title) ad.title = input.title;
  if (input.description) ad.description = input.description;
  if (input.category_id) ad.category = getCategoryById(input.category_id);
  if (input.city_id) ad.city = getCityById(input.city_id);
  if (input.package_id) ad.package = getPackageById(input.package_id);
  if (input.mediaUrls?.[0]) ad.ad_media = [normalizeMedia(input.mediaUrls[0], `media-${ad.id}`)];
  ad.updated_at = nowIso();
  logAudit("ad", String(ad.id), "client:update", input.user_id, "Draft updated");
  return { ok: true, ad };
}

export function mockClientTransition(input: { ad_id: number; user_id: string; status: "submitted" | "payment_submitted"; note?: string }) {
  const ad = state.ads.find((item) => item.id === input.ad_id);
  if (!ad) return { ok: false, error: "Ad not found" as const };
  if (ad.user_id !== input.user_id) return { ok: false, error: "Forbidden" as const };

  if (input.status === "submitted" && ad.status === "draft") {
    transitionAd(ad, "submitted", input.user_id, input.note ?? "Client submitted draft");
    addNotification(ad.user_id, "Ad submitted", `Your ad "${ad.title}" is now waiting for moderator review.`, "info");
    return { ok: true, ad };
  }

  if (input.status === "payment_submitted" && ad.status === "payment_pending") {
    transitionAd(ad, "payment_submitted", input.user_id, input.note ?? "Client submitted payment proof");
    addNotification(ad.user_id, "Payment sent", `Payment proof for "${ad.title}" is now in verification queue.`, "info");
    return { ok: true, ad };
  }

  return { ok: false, error: "Invalid workflow transition" as const };
}

export function mockSubmitPayment(input: { ad_id: number; amount: number; method: string; transaction_ref: string; sender_name: string; screenshot_url?: string; user_id: string }) {
  const ad = state.ads.find((item) => item.id === input.ad_id);
  if (!ad) return { ok: false, error: "Ad not found" as const };
  if (ad.user_id !== input.user_id && input.user_id !== "demo-user") return { ok: false, error: "Forbidden" as const };
  if (!["payment_pending", "payment_submitted"].includes(ad.status)) return { ok: false, error: "Ad is not pending payment" as const };
  if (state.payments.some((payment) => payment.transaction_ref.toLowerCase() === input.transaction_ref.toLowerCase())) return { ok: false, error: "Transaction reference already used" as const };

  const payment: MockPayment = { id: getNextId(state.payments), ad_id: input.ad_id, user_id: input.user_id, amount: input.amount, method: input.method, transaction_ref: input.transaction_ref, sender_name: input.sender_name, screenshot_url: input.screenshot_url, status: "VERIFIED", submitted_at: nowIso() };
  state.payments.unshift(payment);
  transitionAd(ad, "published", input.user_id, "Payment verified and ad activated");
  ad.publish_at = nowIso();
  ad.expire_at = addDaysIso(ad.package.duration_days);
  addNotification(ad.user_id, "Ad is now live", `Payment verified for "${ad.title}" and ad is now active.`, "success");
  logAudit("payment", String(payment.id), "payment:submit", input.user_id, `Payment submitted for ad ${ad.id}`);
  return { ok: true, payment };
}

export function mockListClientDashboard(input: { user_id: string }) {
  const ads = state.ads.filter((ad) => ad.user_id === input.user_id || input.user_id === "demo-user").sort((a, b) => b.created_at.localeCompare(a.created_at));
  const notifications = state.notifications.filter((item) => item.user_id === input.user_id).slice(0, 5);
  const pendingReview = ads.filter((ad) => ["submitted", "under_review"].includes(ad.status)).length;
  const pendingPayment = ads.filter((ad) => ["payment_pending", "payment_submitted"].includes(ad.status)).length;
  const stats = {
    total: ads.length,
    active: ads.filter((ad) => ad.status === "published").length,
    pending_review: pendingReview,
    pending_payment: pendingPayment,
    pending: pendingReview,
    expired: ads.filter((ad) => ad.status === "expired").length,
  };
  return { ads, profile: getSellerByUserId(input.user_id), stats, notifications };
}

export function mockListModeratorQueue() {
  return state.ads.filter((ad) => ["submitted", "under_review"].includes(ad.status)).sort((a, b) => b.rank_score - a.rank_score).map(serializeAd);
}

export function mockModerateAd(input: { ad_id: number; actor_id: string; action: "approve" | "reject" | "flag"; note?: string }) {
  const ad = state.ads.find((item) => item.id === input.ad_id);
  if (!ad) return { ok: false, error: "Ad not found" as const };

  if (input.action === "flag") {
    transitionAd(ad, "under_review", input.actor_id, input.note ?? "Flagged for deeper review");
    ad.moderation_notes = input.note;
    addNotification(ad.user_id, "Ad flagged", `Moderator flagged "${ad.title}" for manual verification.`, "warning");
    return { ok: true, ad };
  }

  if (input.action === "reject") {
    transitionAd(ad, "rejected", input.actor_id, input.note ?? "Rejected by moderator");
    ad.moderation_notes = input.note;
    addNotification(ad.user_id, "Ad rejected", `Your ad "${ad.title}" was rejected. Review moderator notes and edit before resubmission.`, "warning");
    return { ok: true, ad };
  }

  transitionAd(ad, "payment_pending", input.actor_id, input.note ?? "Approved by moderator");
  addNotification(ad.user_id, "Ad approved for payment", `Your ad "${ad.title}" now requires payment verification before publishing.`, "success");
  return { ok: true, ad };
}

export function mockListPaymentQueue() {
  return state.payments.filter((payment) => payment.status === "PENDING").map((payment) => {
    const ad = state.ads.find((item) => item.id === payment.ad_id);
    return { ...payment, ad, seller: ad?.seller_profiles };
  });
}

export function mockVerifyPayment(input: { payment_id: number; actor_id: string; status: "VERIFIED" | "REJECTED"; note?: string }) {
  const payment = state.payments.find((item) => item.id === input.payment_id);
  if (!payment) return { ok: false, error: "Payment not found" as const };
  if (payment.status !== "PENDING") return { ok: false, error: "Payment already processed" as const };
  const ad = state.ads.find((item) => item.id === payment.ad_id);
  if (!ad) return { ok: false, error: "Ad not found" as const };

  payment.status = input.status;
  payment.note = input.note;
  logAudit("payment", String(payment.id), `payment:${input.status.toLowerCase()}`, input.actor_id, input.note ?? "Payment processed");

  if (input.status === "VERIFIED") {
    transitionAd(ad, "payment_verified", input.actor_id, input.note ?? "Payment verified");
    addNotification(ad.user_id, "Payment verified", `Payment for "${ad.title}" has been verified. Admin can now publish or schedule it.`, "success");
  } else {
    transitionAd(ad, "payment_pending", input.actor_id, input.note ?? "Payment rejected");
    addNotification(ad.user_id, "Payment rejected", `Payment for "${ad.title}" was rejected. Submit corrected proof to continue.`, "warning");
  }

  return { ok: true, payment, ad };
}

export function mockAdminPublish(input: { ad_id: number; actor_id: string; action: "publish" | "schedule" | "feature"; scheduled_for?: string; admin_boost?: number; note?: string }) {
  const ad = state.ads.find((item) => item.id === input.ad_id);
  if (!ad) return { ok: false, error: "Ad not found" as const };

  if (input.action === "feature") {
    ad.admin_boost = input.admin_boost ?? 15;
    ad.rank_score = computeRankScore({ is_featured: true, packageWeight: ad.package.weight, freshness: ad.freshness, adminBoost: ad.admin_boost, verifiedSellerBonus: ad.verified_seller_bonus });
    logAudit("ad", String(ad.id), "admin:feature", input.actor_id, input.note ?? "Admin boost applied");
    return { ok: true, ad };
  }

  if (ad.status !== "payment_verified" && ad.status !== "scheduled") return { ok: false, error: "Ad is not ready for publish or schedule" as const };

  if (input.action === "schedule") {
    ad.scheduled_for = input.scheduled_for ?? addDaysIso(1);
    transitionAd(ad, "scheduled", input.actor_id, input.note ?? "Scheduled by admin");
    addNotification(ad.user_id, "Ad scheduled", `Your ad "${ad.title}" has been scheduled for publishing.`, "info");
    return { ok: true, ad };
  }

  transitionAd(ad, "published", input.actor_id, input.note ?? "Published by admin");
  addNotification(ad.user_id, "Ad published", `Your ad "${ad.title}" is now live on AdFlow Pro.`, "success");
  return { ok: true, ad };
}

export function mockRunPublishScheduled(actor_id = "cron") {
  const due = state.ads.filter((ad) => ad.status === "scheduled" && ad.scheduled_for && new Date(ad.scheduled_for) <= new Date());
  due.forEach((ad) => transitionAd(ad, "published", actor_id, "Cron auto-published scheduled ad"));
  return { published: due.length, ads: due };
}

export function mockRunExpireAds(actor_id = "cron") {
  const expiring = state.ads.filter((ad) => ad.status === "published" && ad.expire_at && new Date(ad.expire_at) <= new Date());
  expiring.forEach((ad) => {
    transitionAd(ad, "expired", actor_id, "Cron auto-expired ad");
    addNotification(ad.user_id, "Ad expired", `Your ad "${ad.title}" has expired and is no longer publicly visible.`, "warning");
  });
  return { expired: expiring.length, ads: expiring };
}

export function mockInsertHealthLog() {
  const log: MockHealthLog = { id: `health-${state.system_health_logs.length + 1}`, status: "healthy", db_latency_ms: 35 + state.system_health_logs.length * 2, queue_depth: mockListPaymentQueue().length + mockListModeratorQueue().length, created_at: nowIso() };
  state.system_health_logs.unshift(log);
  logAudit("system", log.id, "health:insert", "cron", "System health snapshot inserted");
  return log;
}

export function mockAnalyticsSummary() {
  const totalAds = state.ads.length;
  const publishedAds = state.ads.filter((ad) => ad.status === "published").length;
  const reviewedAds = state.ads.filter((ad) => ["payment_pending", "payment_submitted", "payment_verified", "scheduled", "published", "expired"].includes(ad.status)).length;
  const approvedAds = state.ads.filter((ad) => ["payment_pending", "payment_submitted", "payment_verified", "scheduled", "published", "expired"].includes(ad.status)).length;
  const revenue = state.payments.filter((payment) => payment.status === "VERIFIED").reduce((sum, payment) => sum + payment.amount, 0);
  const adsByCategory = state.categories.map((category) => ({ name: category.name, count: state.ads.filter((ad) => ad.category.slug === category.slug).length }));
  const adsByCity = state.cities.map((city) => ({ name: city.name, count: state.ads.filter((ad) => ad.city.slug === city.slug).length }));

  return { totalAds, publishedAds, totalRevenue: revenue, approvalRate: reviewedAds ? Math.round((approvedAds / reviewedAds) * 100) : 0, adsByCategory, adsByCity, moderationQueue: mockListModeratorQueue().length, paymentQueue: mockListPaymentQueue().length, health: state.system_health_logs[0] ?? null };
}

export function mockListAdminUsers() {
  return state.users.map((user) => ({ ...user, adsCount: state.ads.filter((ad) => ad.user_id === user.id).length, verifiedSeller: getSellerByUserId(user.id).is_verified }));
}

export function mockListAllAds() {
  return state.ads.map(serializeAd);
}

export function mockListClientPayments(user_id: string) {
  return state.payments
    .filter((payment) => payment.user_id === user_id || user_id === "demo-user")
    .map((payment) => {
      const ad = state.ads.find((item) => item.id === payment.ad_id);
      return { ...payment, ad };
    });
}

export function mockGetSystemSnapshot() {
  return { audit_logs: state.audit_logs.slice(0, 12), notifications: state.notifications.slice(0, 12), ad_status_history: state.ad_status_history.slice(0, 12), system_health_logs: state.system_health_logs.slice(0, 12) };
}

export function mockSerializeAd(ad: MockAd) {
  return serializeAd(ad);
}
