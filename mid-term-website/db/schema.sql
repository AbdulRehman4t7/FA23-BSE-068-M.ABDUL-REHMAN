create type public.app_role as enum ('client', 'moderator', 'admin', 'super_admin');
create type public.ad_status as enum ('draft', 'submitted', 'under_review', 'payment_pending', 'payment_submitted', 'payment_verified', 'scheduled', 'published', 'expired', 'archived', 'rejected');
create type public.payment_status as enum ('pending', 'verified', 'rejected');

create table if not exists public.users (
  id uuid primary key,
  email text unique not null,
  role public.app_role not null default 'client',
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.seller_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  display_name text not null,
  business_name text not null,
  phone text not null,
  city_id uuid,
  is_verified boolean not null default false,
  verification_badge text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  price numeric(12,2) not null default 0,
  duration_days integer not null,
  weight integer not null,
  featured_boost integer not null default 0
);

create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  city_id uuid not null references public.cities(id),
  package_id uuid not null references public.packages(id),
  title text not null,
  slug text not null unique,
  description text not null,
  price numeric(12,2) not null default 0,
  status public.ad_status not null default 'draft',
  is_featured boolean not null default false,
  admin_boost integer not null default 0,
  publish_at timestamptz,
  scheduled_for timestamptz,
  expire_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ad_media (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.ads(id) on delete cascade,
  media_type text not null,
  original_url text not null,
  normalized_url text not null,
  thumbnail_url text not null
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.ads(id) on delete cascade,
  transaction_ref text not null unique,
  sender_name text not null,
  screenshot_url text,
  amount numeric(12,2) not null,
  status public.payment_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  body text not null,
  kind text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ad_status_history (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.ads(id) on delete cascade,
  previous_status public.ad_status,
  new_status public.ad_status not null,
  changed_by uuid,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.system_health_logs (
  id uuid primary key default gen_random_uuid(),
  status text not null,
  db_latency_ms integer not null,
  queue_depth integer not null,
  created_at timestamptz not null default now()
);
