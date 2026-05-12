-- Add invoice_link column to payments table
-- Stores the Razorpay short URL (invoice short link) for the payment invoice
ALTER TABLE payments ADD COLUMN IF NOT EXISTS invoice_link TEXT;
