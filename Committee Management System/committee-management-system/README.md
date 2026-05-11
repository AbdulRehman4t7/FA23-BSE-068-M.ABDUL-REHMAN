# Committee Management System (Angular + Supabase)

Production-focused rotating savings/BC management app using **Angular 17 standalone + signals**, **Supabase**, **Tailwind CSS**, and **Angular Material**.

## Implemented Modules

- Supabase auth: signup, login, reset password, first-login profile completion
- User profile: edit/view/public profile, reputation + badge display
- Committee workflows: create, my committees, explore public committees, join request
- Committee detail: progress, payout banner, timeline, payment grid
- Payment management: payment log + mark payment with proof upload
- Notifications: realtime stream + unread badge + mark all as read
- Route guards: auth + profile completion
- Shared UI: navbar, sidebar, reputation badge, payment grid, progress stepper, member card
- Tailwind + Angular Material themed app shell

## Project Structure

```text
src/app/
├── core/
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   └── services/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── committee/
│   ├── profile/
│   └── notifications/
├── shared/
│   ├── components/
│   └── pipes/
└── environments/
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure env placeholders:
   - `src/environments/environment.ts`
   - `src/environments/environment.prod.ts`
3. Set your values:
   - `supabaseUrl`
   - `supabaseAnonKey`
4. Create Supabase storage buckets:
   - `profile-photos` (public)
   - `payment-proofs` (public/private as per your policy)
5. Run SQL:
   - `supabase/schema.sql`
   - `supabase/seed.sql`
6. Start app:
   ```bash
   npm start
   ```

## Supabase Deliverables Included

- Full schema SQL: `supabase/schema.sql`
  - tables, enums, constraints
  - RLS enabled on all required tables
  - policies for creator/member/profile ownership rules
- Seed data SQL: `supabase/seed.sql`
  - 5 sample users (profile rows)
  - 2 sample committees
  - sample members, payments, join request, notifications

## Notes

- For seed users, UUIDs must map to existing `auth.users.id` in your Supabase project.
- If email confirmation is enabled, users must verify email before login.
