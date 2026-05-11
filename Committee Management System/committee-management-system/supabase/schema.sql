create extension if not exists "uuid-ossp";

do $$ begin
  create type badge_type as enum ('new', 'trusted', 'verified', 'elite');
exception when duplicate_object then null; end $$;

do $$ begin
  create type committee_status as enum ('pending', 'active', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type member_status as enum ('active', 'removed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('bank', 'jazzcash', 'easypaisa');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'paid', 'overdue');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum ('turn_reminder', 'payment_due', 'new_committee', 'payment_confirmed', 'member_added');
exception when duplicate_object then null; end $$;

do $$ begin
  create type request_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  cnic text,
  avatar_url text,
  iban text,
  bank_name text,
  jazzcash_number text,
  easypaisa_number text,
  reputation_score numeric(2,1) not null default 0 check (reputation_score >= 0 and reputation_score <= 5),
  total_committees_completed integer not null default 0,
  badge badge_type not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.committees (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text not null,
  total_months integer not null check (total_months >= 2),
  monthly_amount numeric(12,2) not null check (monthly_amount > 0),
  max_members integer not null check (max_members between 2 and 10),
  current_members_count integer not null default 0,
  start_date date not null,
  status committee_status not null default 'pending',
  is_public boolean not null default true,
  payment_methods payment_method[] not null,
  created_at timestamptz not null default now()
);

create table if not exists public.committee_members (
  id uuid primary key default uuid_generate_v4(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  slot_number integer not null check (slot_number > 0),
  turn_month integer not null check (turn_month > 0),
  iban text,
  bank_name text,
  jazzcash_number text,
  easypaisa_number text,
  joined_at timestamptz not null default now(),
  status member_status not null default 'active',
  unique (committee_id, user_id),
  unique (committee_id, slot_number),
  unique (committee_id, turn_month)
);

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  month_number integer not null check (month_number > 0),
  amount numeric(12,2) not null check (amount > 0),
  payment_date timestamptz,
  method payment_method,
  transaction_reference text,
  proof_url text,
  status payment_status not null default 'pending',
  confirmed_by uuid references public.profiles(id),
  confirmed_at timestamptz,
  notes text,
  unique (committee_id, member_id, month_number)
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type notification_type not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  related_committee_id uuid references public.committees(id) on delete set null
);

create table if not exists public.join_requests (
  id uuid primary key default uuid_generate_v4(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  status request_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (committee_id, requester_id)
);

create or replace function public.recompute_badge()
returns trigger
language plpgsql
as $$
begin
  update public.profiles
  set badge = case
    when reputation_score >= 4.5 then 'elite'::badge_type
    when reputation_score >= 3.5 then 'verified'::badge_type
    when reputation_score >= 2.5 then 'trusted'::badge_type
    else 'new'::badge_type
  end
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists trg_recompute_badge on public.profiles;
create trigger trg_recompute_badge
after insert or update of reputation_score on public.profiles
for each row execute function public.recompute_badge();

alter table public.profiles enable row level security;
alter table public.committees enable row level security;
alter table public.committee_members enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.join_requests enable row level security;

drop policy if exists "profiles own read" on public.profiles;
create policy "profiles own read" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles own write" on public.profiles;
create policy "profiles own write" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "committees creator full access" on public.committees;
create policy "committees creator full access" on public.committees for all
using (auth.uid() = creator_id) with check (auth.uid() = creator_id);
drop policy if exists "committees members can view" on public.committees;
create policy "committees members can view" on public.committees for select
using (
  is_public = true
  or auth.uid() = creator_id
  or exists (
    select 1 from public.committee_members cm
    where cm.committee_id = id and cm.user_id = auth.uid() and cm.status = 'active'
  )
);

drop policy if exists "members creator full access" on public.committee_members;
create policy "members creator full access" on public.committee_members for all
using (
  exists (
    select 1 from public.committees c
    where c.id = committee_id and c.creator_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.committees c
    where c.id = committee_id and c.creator_id = auth.uid()
  )
);

drop policy if exists "members own read" on public.committee_members;
create policy "members own read" on public.committee_members for select
using (user_id = auth.uid());

drop policy if exists "payments creator or member read" on public.payments;
create policy "payments creator or member read" on public.payments for select
using (
  member_id = auth.uid()
  or exists (
    select 1 from public.committees c
    where c.id = committee_id and c.creator_id = auth.uid()
  )
);

drop policy if exists "payments creator write" on public.payments;
create policy "payments creator write" on public.payments for all
using (
  exists (
    select 1 from public.committees c
    where c.id = committee_id and c.creator_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.committees c
    where c.id = committee_id and c.creator_id = auth.uid()
  )
);

drop policy if exists "notifications own access" on public.notifications;
create policy "notifications own access" on public.notifications for all
using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "join requester create/read" on public.join_requests;
create policy "join requester create/read" on public.join_requests for all
using (requester_id = auth.uid()) with check (requester_id = auth.uid());

drop policy if exists "join creator review" on public.join_requests;
create policy "join creator review" on public.join_requests for select
using (
  exists (
    select 1 from public.committees c
    where c.id = committee_id and c.creator_id = auth.uid()
  )
);

drop policy if exists "join creator update" on public.join_requests;
create policy "join creator update" on public.join_requests for update
using (
  exists (
    select 1 from public.committees c
    where c.id = committee_id and c.creator_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.committees c
    where c.id = committee_id and c.creator_id = auth.uid()
  )
);
