-- Seed data for testing
-- Note: Run this after creating test users through Supabase Auth UI

-- Insert sample profiles (replace UUIDs with actual auth.users IDs after creating them)
-- User 1: Ahmed Khan (Creator)
-- User 2: Fatima Ali
-- User 3: Hassan Raza
-- User 4: Ayesha Malik
-- User 5: Bilal Ahmed

-- Sample data assumes you've created 5 users in Supabase Auth
-- Replace these UUIDs with actual user IDs from auth.users table

-- Update profiles with sample data
-- UPDATE profiles SET
--   full_name = 'Ahmed Khan',
--   phone = '+92-300-1234567',
--   cnic = '12345-1234567-1',
--   iban = 'PK36HABB0000123456789012',
--   bank_name = 'Habib Bank Limited',
--   jazzcash_number = '03001234567',
--   reputation_score = 4.5,
--   total_committees_completed = 3,
--   badge = 'elite'
-- WHERE id = 'USER_1_UUID';

-- Sample Committee 1: Monthly Savings Committee
INSERT INTO committees (
  id,
  creator_id,
  name,
  description,
  total_months,
  monthly_amount,
  max_members,
  current_members_count,
  start_date,
  status,
  is_public,
  payment_methods
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'USER_1_UUID', -- Replace with actual user ID
  'Monthly Savings Committee - 50K',
  'A 6-month rotating savings committee for trusted members. Each member contributes PKR 50,000 monthly and receives the full amount on their turn.',
  6,
  50000.00,
  6,
  4,
  CURRENT_DATE + INTERVAL '7 days',
  'pending',
  true,
  ARRAY['bank', 'jazzcash', 'easypaisa']::payment_method[]
);

-- Sample Committee 2: Business Investment Committee
INSERT INTO committees (
  id,
  creator_id,
  name,
  description,
  total_months,
  monthly_amount,
  max_members,
  current_members_count,
  start_date,
  status,
  is_public,
  payment_methods
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'USER_2_UUID', -- Replace with actual user ID
  'Business Investment Committee',
  'A 10-month committee for business owners looking to invest. Monthly contribution of PKR 100,000.',
  10,
  100000.00,
  10,
  6,
  CURRENT_DATE + INTERVAL '14 days',
  'pending',
  true,
  ARRAY['bank']::payment_method[]
);

-- Sample Committee Members for Committee 1
INSERT INTO committee_members (
  committee_id,
  user_id,
  slot_number,
  turn_month,
  iban,
  bank_name,
  jazzcash_number
) VALUES
  ('11111111-1111-1111-1111-111111111111', 'USER_1_UUID', 1, 1, 'PK36HABB0000123456789012', 'Habib Bank Limited', '03001234567'),
  ('11111111-1111-1111-1111-111111111111', 'USER_2_UUID', 2, 3, 'PK36MEBL0000987654321098', 'Meezan Bank', '03009876543'),
  ('11111111-1111-1111-1111-111111111111', 'USER_3_UUID', 3, 5, NULL, NULL, '03007654321'),
  ('11111111-1111-1111-1111-111111111111', 'USER_4_UUID', 4, 2, 'PK36ALFH0000456789012345', 'Alfalah Bank', NULL);

-- Sample Committee Members for Committee 2
INSERT INTO committee_members (
  committee_id,
  user_id,
  slot_number,
  turn_month,
  iban,
  bank_name
) VALUES
  ('22222222-2222-2222-2222-222222222222', 'USER_2_UUID', 1, 2, 'PK36MEBL0000987654321098', 'Meezan Bank'),
  ('22222222-2222-2222-2222-222222222222', 'USER_1_UUID', 2, 5, 'PK36HABB0000123456789012', 'Habib Bank Limited'),
  ('22222222-2222-2222-2222-222222222222', 'USER_3_UUID', 3, 1, 'PK36UNIL0000111222333444', 'United Bank Limited'),
  ('22222222-2222-2222-2222-222222222222', 'USER_4_UUID', 4, 8, 'PK36ALFH0000456789012345', 'Alfalah Bank'),
  ('22222222-2222-2222-2222-222222222222', 'USER_5_UUID', 5, 3, 'PK36STAN0000555666777888', 'Standard Chartered'),
  ('22222222-2222-2222-2222-222222222222', 'USER_1_UUID', 6, 10, 'PK36HABB0000123456789012', 'Habib Bank Limited');

-- Sample Payments for Committee 1 (Month 1)
INSERT INTO payments (
  committee_id,
  member_id,
  month_number,
  amount,
  payment_date,
  method,
  transaction_reference,
  status,
  confirmed_by,
  confirmed_at
) VALUES
  ('11111111-1111-1111-1111-111111111111', 'USER_1_UUID', 1, 50000.00, CURRENT_DATE - INTERVAL '5 days', 'bank', 'TXN001234567', 'paid', 'USER_1_UUID', CURRENT_DATE - INTERVAL '5 days'),
  ('11111111-1111-1111-1111-111111111111', 'USER_2_UUID', 1, 50000.00, CURRENT_DATE - INTERVAL '4 days', 'jazzcash', 'JC987654321', 'paid', 'USER_1_UUID', CURRENT_DATE - INTERVAL '4 days'),
  ('11111111-1111-1111-1111-111111111111', 'USER_3_UUID', 1, 50000.00, NULL, NULL, NULL, 'pending', NULL, NULL),
  ('11111111-1111-1111-1111-111111111111', 'USER_4_UUID', 1, 50000.00, CURRENT_DATE - INTERVAL '3 days', 'bank', 'TXN007654321', 'paid', 'USER_1_UUID', CURRENT_DATE - INTERVAL '3 days');

-- Sample Notifications
INSERT INTO notifications (
  user_id,
  title,
  message,
  type,
  is_read,
  related_committee_id
) VALUES
  ('USER_1_UUID', 'Committee Created', 'Your committee "Monthly Savings Committee - 50K" has been created successfully.', 'new_committee', true, '11111111-1111-1111-1111-111111111111'),
  ('USER_2_UUID', 'Added to Committee', 'You have been added to "Monthly Savings Committee - 50K". Your turn is Month 3.', 'member_added', false, '11111111-1111-1111-1111-111111111111'),
  ('USER_3_UUID', 'Payment Due', 'Your payment for Month 1 of "Monthly Savings Committee - 50K" is due.', 'payment_due', false, '11111111-1111-1111-1111-111111111111'),
  ('USER_1_UUID', 'Payment Confirmed', 'Your payment for Month 1 has been confirmed.', 'payment_confirmed', true, '11111111-1111-1111-1111-111111111111');

-- Sample Join Requests
INSERT INTO join_requests (
  committee_id,
  requester_id,
  status
) VALUES
  ('11111111-1111-1111-1111-111111111111', 'USER_5_UUID', 'pending'),
  ('22222222-2222-2222-2222-222222222222', 'USER_4_UUID', 'approved');

-- Instructions for setup:
-- 1. Create 5 test users in Supabase Auth Dashboard
-- 2. Note their UUIDs from auth.users table
-- 3. Replace all 'USER_X_UUID' placeholders in this file with actual UUIDs
-- 4. Run this seed file in Supabase SQL Editor
-- 5. Optionally update profile details for each user using UPDATE statements
