-- Create certificate_logs table to track individual email delivery status, positions, and errors
CREATE TABLE IF NOT EXISTS certificate_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  team_name TEXT,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_role TEXT NOT NULL DEFAULT 'Member', -- 'Leader' or 'Member'
  position_title TEXT DEFAULT 'Selected Project',
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by registration_id and event_type
CREATE INDEX IF NOT EXISTS idx_certificate_logs_reg ON certificate_logs(registration_id, event_type);
CREATE INDEX IF NOT EXISTS idx_certificate_logs_email ON certificate_logs(recipient_email);

-- Add certificate_sent flag to registration tables if not present
ALTER TABLE innovation_college_registrations ADD COLUMN IF NOT EXISTS certificate_sent BOOLEAN DEFAULT false;
ALTER TABLE innovation_college_registrations ADD COLUMN IF NOT EXISTS certificate_sent_at TIMESTAMPTZ;

ALTER TABLE innovation_pwd_registrations ADD COLUMN IF NOT EXISTS certificate_sent BOOLEAN DEFAULT false;
ALTER TABLE innovation_pwd_registrations ADD COLUMN IF NOT EXISTS certificate_sent_at TIMESTAMPTZ;

ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS certificate_sent BOOLEAN DEFAULT false;
ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS certificate_sent_at TIMESTAMPTZ;

ALTER TABLE cricket_team_registrations ADD COLUMN IF NOT EXISTS certificate_sent BOOLEAN DEFAULT false;
ALTER TABLE cricket_team_registrations ADD COLUMN IF NOT EXISTS certificate_sent_at TIMESTAMPTZ;

ALTER TABLE blind_chess_registrations ADD COLUMN IF NOT EXISTS certificate_sent BOOLEAN DEFAULT false;
ALTER TABLE blind_chess_registrations ADD COLUMN IF NOT EXISTS certificate_sent_at TIMESTAMPTZ;

ALTER TABLE shortfilm_registrations ADD COLUMN IF NOT EXISTS certificate_sent BOOLEAN DEFAULT false;
ALTER TABLE shortfilm_registrations ADD COLUMN IF NOT EXISTS certificate_sent_at TIMESTAMPTZ;
