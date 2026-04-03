<div align="center">

<br/>

# ⚡ AdFlow Pro

### A Modern Classified Ads & Marketplace Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Zod-Validation-E3A008?style=for-the-badge" alt="Zod"/>
</p>

<p align="center">
  <a href="https://fa-23-bse-068-m-abdul-rehman.vercel.app/dashboard/ads/new" target="_blank">
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
CREDENTIALS<br>
EMAIL: a03480748044@gmail.com<br>
password: 00000000

---

<br/>

## 🖼️ Project Screenshots

<br/>

<div align="center">
  <strong>🏠 Landing Page / Home</strong><br/><br/>
  <img src="https://github.com/user-attachments/assets/6e343604-7c27-4557-988a-a947a04a4acc" alt="AdFlow Pro - Landing Page" width="80%" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);"/>
</div>

<br/><br/>

<div align="center">
  <strong>🏠 Home — Featured Listings</strong><br/><br/>
  <img src="https://github.com/user-attachments/assets/23a2b882-64b9-4dd4-95ae-fb6d9641d6b1" alt="AdFlow Pro - Featured Listings" width="80%" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);"/>
</div>

<br/><br/>

<div align="center">
  <strong>📋 Client Dashboard — My Ads</strong><br/><br/>
  <img src="https://github.com/user-attachments/assets/423a1759-8f8a-461f-a636-a48d661c2a7a" alt="AdFlow Pro - Client Dashboard" width="80%" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);"/>
</div>

<br/><br/>

<div align="center">
  <strong>📝 Create New Ad</strong><br/><br/>
  <img src="https://github.com/user-attachments/assets/62773101-78dc-41d4-9ed5-674cc38eed2a" alt="AdFlow Pro - Create Ad" width="80%" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);"/>
</div>

<br/><br/>

<div align="center">
  <strong>🛡️ Moderator Review Queue</strong><br/><br/>
  <img src="https://github.com/user-attachments/assets/4aefd640-fe74-465e-b707-4a90fd2c401c" alt="AdFlow Pro - Moderator Panel" width="80%" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);"/>
</div>

<br/><br/>

<div align="center">
  <strong>⚙️ Admin Panel — Analytics & Payments</strong><br/><br/>
  <img src="https://github.com/user-attachments/assets/6602572a-8d91-4bbe-bbc7-dd3875c79a14" alt="AdFlow Pro - Admin Dashboard" width="80%" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);"/>
</div>

<br/><br/>

<div align="center">
  <strong>👑 Admin — User Management</strong><br/><br/>
  <img src="https://github.com/user-attachments/assets/e20a97b6-4f12-4712-8bb8-b478cdfd8972" alt="AdFlow Pro - User Management" width="80%" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);"/>
</div>

<br/><br/>

<div align="center">
  <strong>💳 Payment Verification</strong><br/><br/>
  <img src="https://github.com/user-attachments/assets/f82e7a57-c64e-4ae3-aeca-b9a536895d13" alt="AdFlow Pro - Payment Verification" width="80%" style="border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);"/>
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

<br/>

---

<br/>

## ✨ Key Features

- **🔐 Authentication & Role-Based Access** — Custom JWT with bcryptjs + Supabase Auth integration. Each role gets its own protected dashboard.
- **📝 Full Ad Lifecycle Management** — Ads move through 10 distinct stages with automated state transitions.
- **🗄️ Supabase Backend** — PostgreSQL database hosted on Supabase with Row Level Security (RLS) policies for data protection.
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
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth + Custom JWT + bcryptjs |
| **ORM / Queries** | Supabase JS Client (`@supabase/supabase-js`) |
| **Validation** | Zod |
| **Deployment** | Vercel |

<br/>

---

<br/>

## 🗄️ Supabase Setup

AdFlow Pro uses **Supabase** as its primary backend — providing a hosted PostgreSQL database, authentication, and real-time capabilities.

### 1. Create a Supabase Project

Go to [supabase.com](https://supabase.com) → New Project → note your **Project URL** and **Anon Key**.

### 2. Run the Schema

In your Supabase dashboard → **SQL Editor**, run:
```sql
-- From db/schema.sql
-- Creates: users, ads, categories, cities, packages, payments tables
```

Then seed the data:
```sql
-- From db/seed.sql
-- Inserts: default categories, cities, promotional packages
```

### 3. Configure Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ **Demo Mode:** If these variables are not set, AdFlow Pro automatically falls back to an **in-memory mock database** — no Supabase account needed to explore the project.

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
│   ├── supabase.ts             # Supabase client initialization
│   ├── mock-db.ts              # In-memory database (Demo mode fallback)
│   ├── validations/            # Zod schemas (Ad, Auth, Payment)
│   └── utils.ts                # Helper functions
│
├── db/
│   ├── schema.sql              # PostgreSQL table definitions (run in Supabase)
│   └── seed.sql                # Seed data (categories, cities, packages)
│
└── package.json
```

<br/>

---

<br/>

## ⚙️ Core Workflow
```
1. Register / Login          →   JWT issued via Supabase Auth, role assigned
         ↓
2. Create Ad (Client)        →   Saved to Supabase PostgreSQL, package selected
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
- Supabase account *(optional — Demo Mode works without it)*

**1. Clone the repository:**
```bash
git clone https://github.com/AbdulRehman4t7/adflow-pro.git
cd adflow-pro
```

**2. Set up environment variables:**
```bash
cp .env.example .env.local
# Add your Supabase URL and keys (see Supabase Setup section above)
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

> 💡 **No Supabase?** Skip step 2 — the app runs in Demo Mode with mock data automatically.

<br/>

---

<br/>

## 📄 License

This project is for educational purposes. All rights reserved © 2024 Abdul Rehman.

<br/>

---

<div align="center">
  <sub>Built with ❤️ using Next.js, TypeScript, Tailwind CSS & Supabase</sub>
</div>
