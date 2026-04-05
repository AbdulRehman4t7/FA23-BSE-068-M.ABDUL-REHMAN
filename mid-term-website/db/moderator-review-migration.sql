-- Moderator review workflow migration

alter table if exists public.ads
  add column if not exists moderation_status text not null default 'pending',
  add column if not exists reviewed_by uuid,
  add column if not exists reviewed_at timestamp,
  add column if not exists review_note text;

-- Optional normalization for existing rows
update public.ads
set moderation_status = case
  when status = 'rejected' then 'rejected'
  when status in ('payment_pending', 'payment_verified', 'scheduled', 'published') then 'approved'
  else 'pending'
end
where moderation_status is null
   or moderation_status not in ('pending', 'approved', 'rejected');

alter table if exists public.ads enable row level security;

drop policy if exists "Moderators can review ads" on public.ads;
create policy "Moderators can review ads"
on public.ads
for update
using (
  coalesce(auth.jwt() ->> 'role', '') in ('moderator', 'admin', 'super_admin')
)
with check (
  coalesce(auth.jwt() ->> 'role', '') in ('moderator', 'admin', 'super_admin')
);

-- Optional: allow moderators/admin to read queue records.
drop policy if exists "Moderators can read ads" on public.ads;
create policy "Moderators can read ads"
on public.ads
for select
using (
  coalesce(auth.jwt() ->> 'role', '') in ('moderator', 'admin', 'super_admin')
);
