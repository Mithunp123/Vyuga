-- =================================================================
--  Table 5: Blind Cricket Tournament – Team Registrations
--  API Endpoint: POST /api/cricket
-- =================================================================

CREATE TABLE IF NOT EXISTS cricket_team_registrations (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name         TEXT        NOT NULL,
  city              TEXT        NOT NULL,
  state             TEXT        NOT NULL,
  player_count      INTEGER     NOT NULL,
  has_played_before BOOLEAN     NOT NULL DEFAULT false,
  additional_info   TEXT,
  contact_name      TEXT        NOT NULL,
  contact_email     TEXT        NOT NULL,
  contact_phone     TEXT        NOT NULL,
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cricket_email
  ON cricket_team_registrations (contact_email);
