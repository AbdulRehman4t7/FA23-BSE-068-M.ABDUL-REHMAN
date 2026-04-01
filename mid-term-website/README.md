<div align="center">

<br/>

<!-- ═══════════════════════════════════════════════════════════════ -->
<!--                     LOGO / BANNER AREA                        -->
<!-- ═══════════════════════════════════════════════════════════════ -->

# ⚡ AdFlow Pro

### A Modern Classified Ads & Marketplace Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
  <img src="https://img.shields.io/badge/Zod-Validation-E3A008?style=for-the-badge" alt="Zod"/>
</p>

<p align="center">
  <a href="YOUR_VERCEL_LINK_HERE" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-View_Project-5C6BC0?style=for-the-badge" alt="Live Demo"/>
  </a>
  &nbsp;
  <img src="https://img.shields.io/badge/Status-Active-22C55E?style=for-the-badge" alt="Status"/>
</p>

<br/>

> **AdFlow Pro** is a full-stack classified ads marketplace — similar to OLX or Craigslist — featuring a complete ad lifecycle engine, multi-role dashboards, moderation queues, and payment verification workflows. Built for real-world scale.

<br/>

---

</div>

<br/>

## 🌐 Live Demo

> 🚀 **[View Live Project →](https://fa-23-bse-068-m-abdul-rehman.vercel.app/dashboard/ads/new)**

<br/>

---

<br/>

## 🖼️ Project Screenshots

> *(Add your project screenshots below. Replace the placeholder images with actual screenshots of your running application.)*

<br/>

<!-- ═══════ SCREENSHOT 1 ═══════ -->
<div align="center">
  <strong>🏠 Landing Page / Home</strong><br/><br/>
  <!-- Replace this with your actual screenshot -->
  <img src="YOUR_SCREENSHOT_1_HERE" alt="AdFlow Pro - Landing Page" width="80%" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);"/>
</div>

<br/><br/>

<!-- ═══════ SCREENSHOT 2 ═══════ -->
<div align="center">
  <strong>📋 Client Dashboard — My Ads</strong><br/><br/>
  <img src="YOUR_SCREENSHOT_2_HERE" alt="AdFlow Pro - Client Dashboard" width="80%" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);"/>
</div>

<br/><br/>

<!-- ═══════ SCREENSHOT 3 ═══════ -->
<div align="center">
  <strong>🛡️ Moderator Review Queue</strong><br/><br/>
  <img src="YOUR_SCREENSHOT_3_HERE" alt="AdFlow Pro - Moderator Panel" width="80%" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);"/>
</div>

<br/><br/>

<!-- ═══════ SCREENSHOT 4 ═══════ -->
<div align="center">
  <strong>⚙️ Admin Panel — Analytics & Payments</strong><br/><br/>
  <img src="YOUR_SCREENSHOT_4_HERE" alt="AdFlow Pro - Admin Dashboard" width="80%" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);"/>
</div>

<br/>

---

<br/>

## 🌟 What is AdFlow Pro?

AdFlow Pro is a production-ready classified advertising platform with a structured, state-machine-driven **Ad Lifecycle** at its core. It supports three distinct user roles — each with their own dedicated dashboard — and includes everything from ad creation and content moderation to payment processing and automated background jobs.

Think of it as the engine that powers a platform like **OLX, Craigslist, or a specialized vehicle marketplace**, but built from scratch with modern tooling.

<br/>

---

<br/>

## 👥 User Roles

| Role | Responsibilities |
|---|---|
| 🧑‍💼 **Client (Seller)** | Create & manage ad listings, purchase promotional packages, track ad performance |
| 🛡️ **Moderator** | Review submitted ads, approve / reject / request changes for quality control |
| 👑 **Admin** | Verify payments, manage platform users & ads, view analytics |

<br/>

---

<br/>

## 🔄 The Ad Lifecycle

Every advertisement on AdFlow Pro moves through a clearly defined state machine:

```
Draft  ➔  Submitted  ➔  Under Review  ➔  Payment Pending
                                                  ↓
Archived  ←  Expired  ←  Published  ←  Scheduled  ←  Payment Verified
```

This ensures complete traceability — from the moment a seller creates a draft, all the way to when the ad expires and gets archived automatically.

<br/>

---

<br/>

## ✨ Key Features

- **🔐 Authentication & Role-Based Access** — Custom JWT with bcryptjs + Supabase Auth integration. Each role gets its own protected dashboard.
- **📝 Full Ad Lifecycle Management** — Ads move through 10 distinct stages with automated state transitions.
- **🧐 Moderation Queue** — Dedicated moderator interface to review, approve, reject, or flag submitted ads.
- **💳 Payment Verification System** — Clients submit transaction receipts; admins verify them before ads go live.
- **📅 Ad Scheduling** — Publish ads immediately or schedule them for a future date.
- **⏱️ Cron Job Automation** — Background jobs automatically expire outdated ads and push scheduled ads to published state.
- **🏆 Smart Ranking Algorithm** — Ads are ranked by active promotional packages (e.g., Featured Boost), package weight, and freshness.
- **📊 Admin Analytics Dashboard** — Platform-wide insights for admins.
- **🧪 Demo Mode** — No database setup required. Falls back to an in-memory mock DB automatically.
- **✅ Schema Validation** — Every form and API payload is validated with Zod.

<br/>

---

<br/>

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14+ (App Router + React Server Components) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **UI Components** | Radix UI + shadcn/ui-inspired components, Lucide React icons |
| **Database** | Supabase / PostgreSQL *(with in-memory Mock DB fallback)* |
| **Validation** | Zod |
| **Auth** | Custom JWT + bcryptjs + Supabase Auth |

<br/>

---

<br/>

## 📂 Project Structure

```
adflow-pro/
├── app/
│   ├── (auth)/                 # Login, Register, Forgot Password
│   ├── admin/                  # Admin dashboard (Ads, Analytics, Payments, Users)
│   ├── dashboard/              # Client dashboard (My Ads, Create Ad, Payments)
│   ├── moderator/              # Moderator review queue
│   ├── api/
│   │   ├── admin/              # Admin-only API routes
│   │   ├── cron/               # Automated background jobs
│   │   └── ...                 # Auth, ads, categories, payments endpoints
│   └── page.tsx                # Main landing page
│
├── components/
│   ├── ui/                     # Base UI elements (Buttons, Cards, Dialogs, Forms)
│   ├── dashboard/              # Shared dashboard layouts & navigation
│   └── landing/                # Hero, Featured Ads, Packages sections
│
├── lib/
│   ├── mock-db.ts              # In-memory database (Demo mode)
│   ├── validations/            # Zod schemas (Ad, Auth, Payment)
│   └── utils.ts                # Helper functions
│
├── db/
│   ├── schema.sql              # PostgreSQL table definitions
│   └── seed.sql                # Seed data (categories, cities, packages)
│
└── package.json
```

<br/>

---

<br/>

## ⚙️ Core Workflow

```
1. Register / Login          →   JWT issued, role assigned (Client / Mod / Admin)
         ↓
2. Create Ad (Client)        →   Fill details, select promotional package
         ↓
3. Moderation Review         →   Moderator approves, rejects, or requests changes
         ↓
4. Payment Submission        →   Client submits transaction ID / receipt
         ↓
5. Admin Verification        →   Admin confirms payment → Ad approved to go live
         ↓
6. Publish / Schedule        →   Immediate publish or future-dated scheduling
         ↓
7. Cron Automation           →   Auto-expire old ads, push scheduled → published
```

<br/>

---

<br/>

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn



**2. Set up environment variables:**
```bash
cp .env.example .env.local
```


**3. Install dependencies:**
```bash
npm install
```

**4. Start the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

<br/>

---

<br/>

## 📄 License

This project is for educational purposes. All rights reserved © 2024 Abdul Rehman.

<br/>

---

<div align="center">
  <sub>Built with ❤️ using Next.js, TypeScript & Tailwind CSS</sub>
</div>
