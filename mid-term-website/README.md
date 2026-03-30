# AdFlow Pro

AdFlow Pro is a production-style sponsored listing marketplace built with Next.js App Router, TypeScript, Tailwind CSS, Zod, and Supabase-ready APIs.

## Included

- Public landing page, explore flow, package page, FAQ, terms, privacy, category pages, and city pages
- Client, moderator, and admin dashboard experiences
- Full ad lifecycle modeling:
  `Draft -> Submitted -> Under Review -> Payment Pending -> Payment Submitted -> Payment Verified -> Scheduled -> Published -> Expired -> Archived`
- Simulated payment verification with duplicate transaction prevention
- Ranking algorithm with featured boost, package weight, freshness, admin boost, and verified seller bonus
- Demo-mode in-memory workflow engine for local presentation without Supabase
- Supabase schema and seed starter files in [`db/schema.sql`](/C:/Users/a0348/OneDrive/Documents/GitHub/FA23-BSE-068-M.ABDUL-REHMAN/MID%20TERM%20WEBSITE/db/schema.sql) and [`db/seed.sql`](/C:/Users/a0348/OneDrive/Documents/GitHub/FA23-BSE-068-M.ABDUL-REHMAN/MID%20TERM%20WEBSITE/db/seed.sql)

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase / PostgreSQL
- JWT-based auth helper
- Zod validation

## Key API Routes

- `/api/auth/login`
- `/api/auth/register`
- `/api/ads`
- `/api/ads/[slug]`
- `/api/categories`
- `/api/cities`
- `/api/packages`
- `/api/client/ads`
- `/api/client/ads/[id]`
- `/api/client/payments`
- `/api/client/dashboard`
- `/api/moderator/review-queue`
- `/api/moderator/ads/[id]/review`
- `/api/admin/payment-queue`
- `/api/admin/payments/[id]/verify`
- `/api/admin/ads/[id]/publish`
- `/api/admin/analytics/summary`
- `/api/cron/publish-scheduled`
- `/api/cron/expire-ads`
- `/api/cron/system-health`

## Setup

1. Copy `.env.example` to `.env.local`
2. Add your Supabase keys
3. Run `npm install`
4. Run `npm run dev`

If Supabase env vars are missing or placeholders, the app automatically runs in demo mode using the in-memory marketplace engine in [`lib/mock-db.ts`](/C:/Users/a0348/OneDrive/Documents/GitHub/FA23-BSE-068-M.ABDUL-REHMAN/MID%20TERM%20WEBSITE/lib/mock-db.ts).

## Submission Notes

- Demo catalog includes 15+ ads across statuses for moderation, payment, scheduling, publication, and expiry flows
- Media handling uses external URLs only
- Cron endpoints simulate auto-publish, auto-expiry, and health logging
- SQL files are ready to extend for live Supabase deployment
