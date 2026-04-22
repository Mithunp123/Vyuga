-- Fix: Insert/update 'talent-combined' in form_settings to ₹399 (39900 paise)
-- This is used by /register/talent-parent (Parent / Individual Nomination)
-- Run this in your Supabase SQL Editor

INSERT INTO form_settings (id, name, is_open, registration_fee_paise)
VALUES ('talent-combined', 'Special Talent Utsav – Parent / Individual Nomination', true, 39900)
ON CONFLICT (id) DO UPDATE
  SET registration_fee_paise = EXCLUDED.registration_fee_paise,
      name = EXCLUDED.name;
