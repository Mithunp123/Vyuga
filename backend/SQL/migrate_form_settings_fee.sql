-- Run this in your Supabase SQL Editor
-- Adds per-event registration fee to form_settings so admin can control it from the dashboard

-- 1. Add column (safe to run on existing table)
ALTER TABLE form_settings
  ADD COLUMN IF NOT EXISTS registration_fee_paise INTEGER NOT NULL DEFAULT 9900;

-- 2. Set default fee for all known events (₹99 = 9900 paise)
--    Admin can override these per-event from the dashboard
UPDATE form_settings SET registration_fee_paise = 9900 WHERE registration_fee_paise = 9900;

-- If you want event-specific fees, update them individually:
-- UPDATE form_settings SET registration_fee_paise = 9900 WHERE id = 'shortfilm';
-- UPDATE form_settings SET registration_fee_paise = 9900 WHERE id = 'innovation-college';
-- UPDATE form_settings SET registration_fee_paise = 9900 WHERE id = 'innovation-pwd';
-- UPDATE form_settings SET registration_fee_paise = 9900 WHERE id = 'shortfilm';
-- etc.
