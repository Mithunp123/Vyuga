ALTER TABLE innovation_college_registrations ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE innovation_college_registrations ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

ALTER TABLE innovation_pwd_registrations ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE innovation_pwd_registrations ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

ALTER TABLE cricket_team_registrations ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE cricket_team_registrations ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
