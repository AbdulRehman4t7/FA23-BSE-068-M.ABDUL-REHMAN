export const CATEGORIES = [
  { name: "Real Estate", slug: "real-estate", icon: "🏠", description: "Zameen, plots, aur ghar" },
  { name: "Electronics", slug: "electronics", icon: "📱", description: "Mobile, laptop, aur accessories" },
  { name: "Vehicles", slug: "vehicles", icon: "🚗", description: "Gaarian, bikes, aur spare parts" },
  { name: "Services", slug: "services", icon: "🛠️", description: "Repairing, teaching, aur other services" },
  { name: "Fashion", slug: "fashion", icon: "👕", description: "Kapray, jootay, aur watches" },
  { name: "Jobs", slug: "jobs", icon: "💼", description: "Hiring aur career opportunities" },
  { name: "Collectibles", slug: "collectibles", icon: "🧿", description: "Watches, rares, aur collectors items" },
];

export const PAKISTAN_CITIES = [
  { name: "Karachi", slug: "karachi" },
  { name: "Lahore", slug: "lahore" },
  { name: "Islamabad", slug: "islamabad" },
  { name: "Rawalpindi", slug: "rawalpindi" },
  { name: "Faisalabad", slug: "faisalabad" },
  { name: "Multan", slug: "multan" },
  { name: "Peshawar", slug: "peshawar" },
  { name: "Quetta", slug: "quetta" },
];

export const PACKAGES = [
  { id: "basic", name: "Basic", price: 0, duration: 7, weight: 1, featuredBoost: 0, description: "Starter visibility for 7 days" },
  { id: "standard", name: "Standard", price: 500, duration: 15, weight: 2, featuredBoost: 10, description: "Balanced reach for 15 days" },
  { id: "premium", name: "Premium", price: 1500, duration: 30, weight: 3, featuredBoost: 50, description: "30-day premium placement with featured priority" },
];

export const CURRENCY = "PKR";

export const LIFE_CYCLE = [
  "draft",
  "submitted",
  "under_review",
  "payment_pending",
  "payment_submitted",
  "payment_verified",
  "scheduled",
  "published",
  "expired",
  "archived",
] as const;
