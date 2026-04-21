-- Fix registration fees in form_settings
-- Razorpay minimum is 100 paise (₹1.00) for the TOTAL invoice amount
-- Run this in Supabase SQL Editor

-- First, ensure the column exists
ALTER TABLE form_settings
  ADD COLUMN IF NOT EXISTS registration_fee_paise INTEGER NOT NULL DEFAULT 9900;

-- Set the correct base fee (in PAISE) for each event
-- ₹99 = 9900 paise | ₹199 = 19900 paise | ₹499 = 49900 paise
-- Change these values to whatever fee you want per event

UPDATE form_settings SET registration_fee_paise = 9900 WHERE id = 'innovation-college';
UPDATE form_settings SET registration_fee_paise = 9900 WHERE id = 'innovation-pwd';
UPDATE form_settings SET registration_fee_paise = 9900 WHERE id = 'talent-org';
UPDATE form_settings SET registration_fee_paise = 9900 WHERE id = 'talent-student';
UPDATE form_settings SET registration_fee_paise = 9900 WHERE id = 'short-film';
UPDATE form_settings SET registration_fee_paise = 9900 WHERE id = 'cricket';
UPDATE form_settings SET registration_fee_paise = 9900 WHERE id = 'chess';

-- Verify
SELECT id, name, registration_fee_paise,
       ROUND(registration_fee_paise / 100.0, 2) AS fee_rupees,
       ROUND(registration_fee_paise * 1.18 / 100.0, 2) AS total_with_gst
FROM form_settings
ORDER BY id;
