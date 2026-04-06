ALTER TABLE innovation_college_registrations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE innovation_pwd_registrations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE cricket_team_registrations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
