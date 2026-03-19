-- -----------------------------------------------------------------
-- Blind Chess Competition
-- API: POST /api/chess
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blind_chess_registrations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_name TEXT       NOT NULL,
  email           TEXT        NOT NULL,
  phone           TEXT        NOT NULL,
  age             INTEGER     NOT NULL,
  city            TEXT        NOT NULL,
  state           TEXT        NOT NULL,
  disability_type TEXT        NOT NULL,
  has_played_before BOOLEAN   NOT NULL DEFAULT false,
  experience_level TEXT       NOT NULL,
  additional_info TEXT,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  status          TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected')),
  admin_note      TEXT
);

-- Index for quick email lookups
CREATE INDEX IF NOT EXISTS idx_chess_email ON blind_chess_registrations (email);
