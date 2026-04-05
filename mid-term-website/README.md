# AdFlow Pro - Classified Ads & Marketplace Platform

Welcome to **AdFlow Pro**, a robust and feature-rich classified ads and marketplace platform built with modern web standards. This project leverages the power of Next.js 14 (App Router), TypeScript, and Tailwind CSS to deliver a seamless user experience. It features a complete end-to-end ad lifecycle, dynamic user roles, moderation queues, and a comprehensive payment verification system.

## 🌟 Project Overview

AdFlow Pro is a marketplace platform where users can post, manage, and promote their classified advertisements (similar to platforms like Craigslist, OLX, or specialized vehicle marketplaces). The system is built around three distinct user roles:

1. **Client (Seller):** Can create and manage ad listings, purchase premium promotional packages, and track their ad performance.
2. **Moderator:** Responsible for reviewing newly submitted ads, ensuring content quality, and either approving, rejecting, or requesting modifications.
3. **Admin:** Oversees the entire platform, verifies user payments, manages platform-wide users and ads, and monitors overall analytics.

### The Ad Lifecycle
At the heart of the platform is a structured **Ad Lifecycle** state machine. Each advertisement transitions through several stages:
`Draft ➔ Submitted ➔ Under Review ➔ Payment Pending ➔ Payment Submitted ➔ Payment Verified ➔ Scheduled ➔ Published ➔ Expired ➔ Archived`

The platform also includes a custom ranking algorithm that sorts and displays ads based on active promotional packages (e.g., featured boosts), package weights, and freshness.

## 🛠️ Technologies Used

- **Framework:** Next.js 14+ (App Router for optimized React Server Components)
- **Language:** TypeScript (for type safety and better developer experience)
- **Styling:** Tailwind CSS (utility-first CSS framework)
- **UI Components:** Radix UI primitives with accessible, customizable components (shadcn/ui-inspired), including Lucide React icons.
- **Database / Backend:** Supabase / PostgreSQL (Includes an in-memory Mock Database for seamless local development and demo purposes).
- **Validation:** Zod (for robust schema validation of forms and API payloads).
- **Authentication:** Custom JWT (JSON Web Tokens) implementation alongside bcryptjs and Supabase Auth integration.

## 📂 Project Structure

The project follows the Next.js App Router conventions, organized for scalability and separation of concerns:

```text
mid-term-website/
├── app/                        # Next.js App Router pages, layouts, and endpoints
│   ├── (auth)/                 # Authentication routes (Login, Register, Forgot Password)
│   ├── admin/                  # Admin dashboard UI (Ads, Analytics, Payments, Users)
│   ├── dashboard/              # Client dashboard UI (My Ads, Create Ad, Payments)
│   ├── moderator/              # Moderator dashboard UI (Review Queue)
│   ├── api/                    # Backend REST/Serverless API routes
│   │   ├── admin/              # Admin-only API routes (analytics, ad publishing hooks)
│   │   ├── cron/               # Automated background jobs (expire ads, publish scheduled)
│   │   └── ...                 # Other categorized endpoints (auth, ads, categories, payments)
│   └── page.tsx                # Main Landing / Home Page
├── components/                 # Reusable React components
│   ├── ui/                     # Base UI elements (Buttons, Cards, Forms, Dialogs)
│   ├── dashboard/              # Shared dashboard layouts and navigation
│   └── landing/                # Home page specific sections (Hero, Featured, Packages)
├── lib/                        # Core business logic, utilities, and database connections
│   ├── mock-db.ts              # In-memory database fallback (for Demo mode)
│   ├── validations/            # Zod schemas for strict data validation (Ad, Auth, Payment)
│   └── utils.ts                # Shared helper functions (e.g., classname merging)
├── db/                         # Database schema definition and seed data
│   ├── schema.sql              # PostgreSQL table definitions
│   └── seed.sql                # Initial mock data for categories, cities, packages
└── package.json                # Project dependencies and npm scripts
```

## ⚙️ How It Works (Core Workflow)

1. **User Registration & Authentication:** Users sign up or log in. The system authenticates them via JWT/Supabase and assigns specific roles (Client, Moderator, Admin).
2. **Ad Creation:** Clients navigate to their dashboard to create a new ad. They fill out details (title, description, price, category, city) and select an advertising package (e.g., Standard, Premium, Featured).
3. **Moderation Queue:** Once submitted, the ad enters the `Under Review` status. **Moderators** review the ad content via their dedicated dashboard to ensure it meets platform guidelines.
4. **Payment Processing:** If the user selected a paid package, they are prompted to submit payment details (e.g., transaction IDs or receipts). The ad's status changes to `Payment Pending` / `Payment Submitted`.
5. **Admin Verification:** **Admins** review the submitted payments. Upon successful verification, the ad is approved to go live.
6. **Publishing & Scheduling:** Ads can be published immediately or scheduled for a future date. The backend automatically handles the transition from `Scheduled` to `Published`.
7. **Automated Maintenance (Cron Jobs):** The `/api/cron/*` endpoints run periodically to automatically mark outdated ads as `Expired` or `Archived`, and push `Scheduled` ads to the `Published` state dynamically.

## 🚀 Setup & Installation

Follow these steps to run the project locally on your machine:

1. **Clone the repository:**
   Navigate your terminal to your preferred workspace and clone the repository.
   
2. **Setup Environment Variables:**
   Copy the example environment file to create your local environment settings:
   ```bash
   cp .env.example .env.local
   ```
   *(Note: If Supabase keys are not provided, the project will automatically fall back to **Demo Mode**, using the in-memory mock database for instant testing).*

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *The server will start locally. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.*

## Environment Variables

Add these variables in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
```

Security notes:

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Never expose service role key in client components.
- Use a long random value for `JWT_SECRET`.

## Admin Module Setup

1. Run the SQL migration from `db/admin-rbac-migration.sql` in Supabase SQL editor.
2. Ensure admin accounts exist in `public.users` with `role = 'admin'` or `role = 'super_admin'`.
3. Use `/admin-login` for admin authentication.
4. Protected admin routes are under `/admin/*` and use server-side role checks plus client fallback validation.

## Moderator Module Setup

1. Run the SQL migration from `db/moderator-review-migration.sql` in Supabase SQL editor.
2. Ensure moderator users exist in `public.users` with role `moderator` (admins are also allowed for moderation).
3. Use `/moderator-login` for moderator authentication.
4. Protected moderator routes are under `/moderator/*` with middleware + server-side layout checks.

### Moderator Testing Checklist

- Moderator login works with moderator/admin credentials.
- Unauthorized users are redirected away from `/moderator/*`.
- Pending queue loads ads for review.
- Approve action saves `reviewed_by`, `reviewed_at`, and marks ad reviewed.
- Reject action saves `review_note` and rejection metadata.
- Filters for pending/approved/rejected work.
