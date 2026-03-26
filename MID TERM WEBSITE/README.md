# AdFlow Pro 🚀
**Sponsored Listing Marketplace with Moderation, Scheduling, Payment Verification, Analytics, and External Media Normalization**
# 📌 Project Outputs Showcase

Welcome to the project outputs section. Below are the visual results of the system:

---

## 🖥️ Screenshots Preview

<table>
  <tr>
    <td align="center">
      <h3>🏠 Home Screen</h3>
      <img src="https://github.com/user-attachments/assets/be872027-9d0d-4bb5-b8b0-f5f79dc6b87e" width="400"/>
    </td>
    <td align="center">
      <h3>DASHBOARD</h3>
      <img src="https://github.com/user-attachments/assets/107d19b5-655a-490a-a192-c8df5cd005de" width="400"/>
    </td>
  </tr>

  <tr>
    <td align="center">
      <h3>🔐 Login Page</h3>
      <img src="https://github.com/user-attachments/assets/61a9888f-5598-4157-ae58-8acb80bc771e" width="400"/>
    </td>
    <td align="center">
      <h3>📦 Product Listing</h3>
      <img src="https://github.com/user-attachments/assets/435aa151-ad01-4aa2-bb78-8fe85008040a" width="400"/>
    </td>
  </tr>

  <tr>
    <td align="center">
      <h3>➕ Add Product</h3>
      <img src="https://github.com/user-attachments/assets/567e730b-fc4b-4b7e-9804-93fd4e165177" width="400"/>
    </td>
    <td align="center">
      <h3>📊 Reports / Analytics</h3>
      <img src="https://github.com/user-attachments/assets/f099837e-1035-4064-8012-092ebfb4834f" width="400"/>
    </td>
  </tr>
</table>

<p align="center">
  <h3>Create ads</h3>
  <img src="https://github.com/user-attachments/assets/28b8b8c3-e1fc-4f7a-bd48-43123ea3fa98" width="300"/>
</p>






---

## Tech Stack
| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 14 (App Router)             |
| Backend     | Next.js API Routes (Serverless)     |
| Database    | Supabase (Postgres)                 |
| Auth        | Supabase Auth (JWT)                 |
| Validation  | Zod                                 |
| Deployment  | Vercel + Supabase                   |
| UI Library  | Tailwind CSS + Lucide Icons         |

---

## Project Structure
```
adflowpro/
├── (auth)/                     ← Login, Register, Forgot Password
├── admin/                      ← Admin Dashboard & Management
├── ads/                        ← Public Ad Listing & Details
├── api/                        ← Serverless API Endpoints
│   ├── admin/                  ← Review, Stats, Payment Verification
│   ├── ads/                    ← Public Ad Retrieval
│   ├── auth/                   ← Auth Session Management
│   ├── client/                 ← Dashboard, Ad Creation, Payments
│   ├── cron/                   ← Publish, Expire, Reminders
│   ├── moderator/              ← Review Queue Management
│   └── packages/               ← Package Definitions
├── components/                 ← Reusable UI (Button, Card, Input...)
├── dashboard/                  ← Client Dashboard
├── explore/                    ← Search & Filtering
├── lib/                        ← Core Logic & Utilities
│   ├── api.ts                  ← API Helper Utilities
│   ├── constants.ts            ← Categories, Cities, Packages
│   ├── supabase.ts             ← Supabase Client Config
│   ├── utils.ts                ← Helper Functions
│   └── validations.ts          ← Zod Validation Schemas
├── moderator/                  ← Moderation Workspace
├── packages/                   ← Package Comparison
├── README.md                   ← Project Documentation
└── tailwind.config.ts          ← UI Theme Configuration
```

---

## Setup Instructions

### 1. Supabase Database

1. Go to `https://supabase.com` and create a new project.
2. Open **SQL Editor** and paste the entire contents of your schema (tables: `profiles`, `ads`, `categories`, `cities`, `packages`, `ad_media`, `payments`, `notifications`, `audit_logs`, `ad_status_history`).
3. Run it — this creates all tables, custom types, triggers, and RLS policies.
4. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 2. Environment Configuration

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Installation & Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Visit `http://localhost:3000`

---

## Demo Accounts

Register via the app and manually change the `role` in the Supabase `profiles` table:

| Role       | Email              | Password  |
|------------|--------------------|-----------|
| Client     | client@demo.com    | demo123   |
| Moderator  | mod@demo.com       | demo123   |
| Admin      | admin@demo.com     | demo123   |

```sql
-- Run in Supabase SQL Editor after registering accounts:
UPDATE profiles SET role = 'moderator' WHERE email = 'mod@demo.com';
UPDATE profiles SET role = 'admin'     WHERE email = 'admin@demo.com';
```

---

## Ad Lifecycle

```
Draft → Submitted → Under Review → Payment Pending → Payment Submitted 
      → Payment Verified → Scheduled → Published → Expired 
```

Each transition is logged in:
- `ad_status_history` table (full timeline)
- `audit_logs` table (actor, action, old/new values)
- `notifications` table (in-app alerts for the client)

---

## Rank Score Formula

```js
rankScore = (is_featured ? 50 : 0) 
           + (package.weight * 10)       // Basic=10, Standard=20, Premium=30 
           + freshnessPoints              // Up to 20, decays over 7 days 
           + admin_boost                  // Manual admin adjustment 
           + (seller.is_verified ? 5 : 0) 
```

---

## Media Normalization

The platform stores **URLs only** — no file uploads. The system handles:

| URL Type      | Detection                  | Action                              |
|---------------|----------------------------|-------------------------------------|
| YouTube       | Regex on `youtube.com` / `youtu.be` | Extract video ID → generate thumbnail |
| Image URL     | `.jpg`, `.png`, `.webp` etc. | Validate protocol + domain          |
| Cloudinary    | `cloudinary.com` hostname  | Treat as valid image                |
| Other         | Fallback                   | Attempt validation, store as-is     |

Invalid/broken media shows a placeholder in the UI.

---

## REST API Reference

### Public
| Method | Endpoint                  | Description               |
|--------|---------------------------|---------------------------|
| POST   | `/api/auth/register`      | Register new client        |
| POST   | `/api/auth/login`         | Login, receive JWT         |
| GET    | `/api/ads`                | Browse active ads (search, filter, sort, paginate) |
| GET    | `/api/ads/[slug]`         | Single ad detail           |
| GET    | `/api/packages`           | All active packages        |
| GET    | `/api/categories`         | All active categories      |
| GET    | `/api/cities`             | All active cities          |
| GET    | `/api/health/db`          | DB heartbeat check         |

### Client (JWT required, role: client)
| Method | Endpoint                        | Description                    |
|--------|---------------------------------|--------------------------------|
| GET    | `/api/client/dashboard`         | Summary + ads + notifications  |
| POST   | `/api/client/ads`               | Create ad draft                |
| PATCH  | `/api/client/ads/[id]`          | Edit draft                     |
| POST   | `/api/client/ads/[id]/submit`   | Submit draft for review        |
| POST   | `/api/client/payments`          | Submit payment proof           |

### Moderator (JWT required, role: moderator/admin)
| Method | Endpoint                          | Description                  |
|--------|-----------------------------------|------------------------------|
| GET    | `/api/moderator/review-queue`     | Get submitted ads queue      |
| PATCH  | `/api/moderator/ads/[id]/review`  | approve / reject / flag      |

### Admin (JWT required, role: admin/superadmin)
| Method | Endpoint                          | Description                    |
|--------|-----------------------------------|--------------------------------|
| GET    | `/api/admin/payment-queue`        | Pending payments               |
| PATCH  | `/api/admin/payments/[id]/verify` | verify / reject payment        |
| PATCH  | `/api/admin/ads/[id]/publish`     | publish / schedule / reject    |
| GET    | `/api/admin/analytics/summary`    | KPIs, revenue, moderation stats|

### Cron (x-cron-secret header required)
| Method | Endpoint                        | Description                     |
|--------|---------------------------------|---------------------------------|
| POST   | `/api/cron/publish-scheduled`   | Publish due scheduled ads       |
| POST   | `/api/cron/expire-ads`          | Expire outdated ads             |

---

## Vercel Deployment

### Frontend & API

1. Push the project to a GitHub repo.
2. Create a new Vercel project and set root to `/`.
3. Add all `.env.local` values as Environment Variables in Vercel dashboard.
4. Deploy.

### Cron Jobs on Vercel

Add to `vercel.json` or use Vercel Cron (Pro plan):
```json
{
  "crons": [
    { "path": "/api/cron/publish-scheduled", "schedule": "0 * * * *"  },
    { "path": "/api/cron/expire-ads",        "schedule": "0 0 * * *"  }
  ]
}
```

---

## Database Tables

| Table               | Purpose                              |
|---------------------|--------------------------------------|
| `profiles`          | Account + role identity              |
| `packages`          | Basic / Standard / Premium           |
| `categories`        | Listing classification               |
| `cities`            | Location taxonomy                    |
| `ads`               | Main listing record + workflow state |
| `ad_media`          | Normalized external media URLs       |
| `payments`          | Payment proof records                |
| `notifications`     | In-app alerts                        |
| `audit_logs`        | Full traceability                    |
| `ad_status_history` | Per-ad status timeline               |

---

## Grading Checklist

| Criterion             | Implemented                                              |
|-----------------------|----------------------------------------------------------|
| Architecture Design   | ✅ Clean separation: routes/components/lib/api            |
| Database Design       | ✅ 10+ normalized tables, indexes, FK constraints        |
| Authentication & RBAC | ✅ Supabase Auth, 3 roles, server-side role checks        |
| Workflow Logic        | ✅ Full lifecycle, business rules enforced                |
| API Quality           | ✅ REST endpoints, Zod validation, error handling         |
| Frontend UX           | ✅ Next.js App Router, responsive, role-protected         |
| Analytics & Automation| ✅ Dashboard, cron jobs, health checks                    |
| Code Quality          | ✅ TypeScript, service-like logic in lib, clear naming    |
| Deployment            | ✅ Vercel + Supabase config documented                    |

---

## Viva Q&A Preparation

**Q: Why Supabase Postgres instead of local file storage?**
A: Supabase provides a managed Postgres instance with built-in auth, real-time subscriptions, and an auto-generated REST API. It eliminates server storage management, scales automatically, and the service-role client gives us full control server-side.

**Q: How does the ad lifecycle protect business logic?**
A: Each state transition is guarded by server-side checks. For example, a payment cannot be submitted unless the ad is in `payment_pending` status. Admins cannot publish without a verified payment. Every transition is logged in `ad_status_history` and `audit_logs`.

**Q: How is RBAC implemented?**
A: Supabase Auth handles identity. The application layer checks the `role` column in the `profiles` table (synced with `auth.users` metadata) before allowing access to protected routes or API endpoints.

**Q: How are external media URLs validated and normalized?**
A: The system detects the source type using regex (YouTube) or URL parsing. YouTube URLs have the video ID extracted and a thumbnail URL generated automatically. Image URLs are validated for HTTPS protocol.

**Q: What happens when an ad reaches its expiry date?**
A: The `expire-ads` cron job runs daily, queries all `PUBLISHED` ads where `expire_at < NOW()`, sets their status to `EXPIRED`, and logs the change.

**Q: How is payment verification modeled?**
A: The `payments` table stores `ad_id`, `amount`, `method`, `transaction_id`, and `status`. When an admin verifies, `payments.status` → `VERIFIED`, and the associated ad moves to `PAYMENT_VERIFIED`.

**Q: How does the ranking formula work?**
A: `rankScore = (featured ? 50 : 0) + (weight * 10) + freshnessPoints + adminBoost + verifiedPoints`. Featured ads jump 50 points. Premium package (weight=3) adds 30 vs Basic (weight=1) adding 10. Freshness gives points decaying over 7 days.

**Q: What tables support traceability?**
A: `audit_logs` records every significant action (actor, action type, target). `ad_status_history` records every status change per ad. Together they provide a complete audit trail.
