-- =================================================================
--  Table 3: Special Talent Utsav – Organization Registration
--  API Endpoint: POST /api/talent-org
-- =================================================================

CREATE TABLE IF NOT EXISTS talent_organizations (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name      TEXT        NOT NULL,
  org_type      TEXT        NOT NULL,
  address       TEXT,
  student_count INTEGER     NOT NULL DEFAULT 0,
  contact_name  TEXT        NOT NULL,
  contact_email TEXT        NOT NULL UNIQUE,
  contact_phone TEXT        NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_talent_org_email
  ON talent_organizations (contact_email);
