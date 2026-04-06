CREATE TABLE IF NOT EXISTS payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  event_type        TEXT NOT NULL,
  amount            INTEGER NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'INR',
  status            TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created','paid','failed')),
  payer_name        TEXT,
  payer_email       TEXT,
  payer_phone       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
