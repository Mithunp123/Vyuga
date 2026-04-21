-- Run this in your Supabase SQL Editor
-- Adds Razorpay order tracking and payment status to talent_organizations

-- 1. Add Razorpay columns
ALTER TABLE talent_organizations
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';

-- 2. Ensure org_focus and disability_types columns exist (from earlier migration)
ALTER TABLE talent_organizations
  ADD COLUMN IF NOT EXISTS org_focus TEXT NOT NULL DEFAULT 'multiple',
  ADD COLUMN IF NOT EXISTS disability_types TEXT;

-- 3. Ensure talent-org exists in form_settings so the fee is controllable from admin
INSERT INTO form_settings (id, name, is_open, registration_fee_paise)
VALUES ('talent-org', 'Special Talent Utsav – Organization', true, 9900)
ON CONFLICT (id) DO UPDATE
  SET registration_fee_paise = EXCLUDED.registration_fee_paise;

-- 4. Ensure all event types exist in form_settings with the correct fee (₹99 = 9900 paise)
-- Change these values per event if fees differ
INSERT INTO form_settings (id, name, is_open, registration_fee_paise)
VALUES
  ('innovation-college', 'Inclusive Innovation Fest – College',  true,  9900),
  ('innovation-pwd',     'Inclusive Innovation Fest – PWD',      true,  9900),
  ('talent-student',     'Special Talent Utsav – Student',       true,  9900),
  ('short-film',         'Short Film Competition',                true,  9900),
  ('cricket',            'Blind Cricket Tournament',              true,  9900),
  ('chess',              'Blind Chess Competition',               true,  9900)
ON CONFLICT (id) DO NOTHING;
