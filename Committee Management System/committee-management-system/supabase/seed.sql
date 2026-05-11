-- Replace these UUIDs with actual auth.users IDs if needed.
insert into public.profiles (id, full_name, phone, cnic, reputation_score, total_committees_completed, badge)
values
  ('11111111-1111-1111-1111-111111111111', 'Ali Khan', '+923001111111', '35202-1111111-1', 4.6, 8, 'elite'),
  ('22222222-2222-2222-2222-222222222222', 'Ayesha Malik', '+923002222222', '35202-2222222-2', 3.8, 5, 'verified'),
  ('33333333-3333-3333-3333-333333333333', 'Bilal Ahmed', '+923003333333', null, 3.1, 3, 'trusted'),
  ('44444444-4444-4444-4444-444444444444', 'Hira Saeed', '+923004444444', null, 2.2, 1, 'new'),
  ('55555555-5555-5555-5555-555555555555', 'Usman Tariq', '+923005555555', null, 2.7, 2, 'trusted')
on conflict (id) do nothing;

insert into public.committees
  (id, creator_id, name, description, total_months, monthly_amount, max_members, current_members_count, start_date, status, is_public, payment_methods)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Gold Circle 6M', '6 month savings pool for freelancers', 6, 10000, 6, 4, current_date + interval '7 day', 'pending', true, array['bank','jazzcash']::payment_method[]),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Family BC 10M', 'Private family committee', 10, 5000, 10, 10, current_date - interval '20 day', 'active', false, array['bank','easypaisa']::payment_method[])
on conflict (id) do nothing;

insert into public.committee_members
  (committee_id, user_id, slot_number, turn_month, status)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 1, 3, 'active'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 2, 1, 'active'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 3, 2, 'active'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 4, 4, 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 1, 1, 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 2, 2, 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 3, 3, 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 4, 4, 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 5, 5, 'active')
on conflict do nothing;

insert into public.payments
  (committee_id, member_id, month_number, amount, payment_date, method, transaction_reference, status)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 1, 5000, now() - interval '12 day', 'bank', 'TXN-1001', 'paid'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 1, 5000, now() - interval '11 day', 'easypaisa', 'TXN-1002', 'paid'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 1, 5000, now() - interval '10 day', 'bank', 'TXN-1003', 'paid'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 1, 5000, null, null, null, 'pending')
on conflict do nothing;

insert into public.join_requests (committee_id, requester_id, status)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'pending')
on conflict do nothing;

insert into public.notifications (user_id, title, message, type, is_read, related_committee_id)
values
  ('33333333-3333-3333-3333-333333333333', 'Payment due for Gold Circle 6M — Month 1', 'Please pay your monthly contribution before due date.', 'payment_due', false, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('44444444-4444-4444-4444-444444444444', 'Your turn is coming next month!', 'Get ready to receive payout for your assigned month.', 'turn_reminder', false, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
on conflict do nothing;
