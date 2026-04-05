-- Admin RBAC migration for Supabase Auth + App data.

-- Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade,
  email text,
  role text default 'user',
  created_at timestamp default now(),
  primary key (id)
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Admin Access Policy
drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
on public.profiles
for select
using (
  auth.jwt() ->> 'role' = 'admin'
);

-- Optional hardening: admins can update role/status in app users table.
alter table if exists public.users enable row level security;

drop policy if exists "Admins can read users" on public.users;
create policy "Admins can read users"
on public.users
for select
using (
  coalesce(auth.jwt() ->> 'role', '') in ('admin', 'super_admin')
);

drop policy if exists "Admins can update users" on public.users;
create policy "Admins can update users"
on public.users
for update
using (
  coalesce(auth.jwt() ->> 'role', '') in ('admin', 'super_admin')
)
with check (
  coalesce(auth.jwt() ->> 'role', '') in ('admin', 'super_admin')
);

-- Optional hardening: admins can manage ads and payments.
alter table if exists public.ads enable row level security;
alter table if exists public.payments enable row level security;

drop policy if exists "Admins can manage ads" on public.ads;
create policy "Admins can manage ads"
on public.ads
for all
using (
  coalesce(auth.jwt() ->> 'role', '') in ('admin', 'super_admin')
)
with check (
  coalesce(auth.jwt() ->> 'role', '') in ('admin', 'super_admin')
);

drop policy if exists "Admins can manage payments" on public.payments;
create policy "Admins can manage payments"
on public.payments
for all
using (
  coalesce(auth.jwt() ->> 'role', '') in ('admin', 'super_admin')
)
with check (
  coalesce(auth.jwt() ->> 'role', '') in ('admin', 'super_admin')
);
