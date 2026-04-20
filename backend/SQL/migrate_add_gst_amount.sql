-- Add GST columns to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gst_amount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS base_amount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS registration_id UUID;

-- Backfill existing rows: treat old amount as total (18% inclusive)
UPDATE payments
SET gst_amount = ROUND(amount * 18.0 / 118.0),
    base_amount = amount - ROUND(amount * 18.0 / 118.0)
WHERE gst_amount = 0 AND amount > 0;
