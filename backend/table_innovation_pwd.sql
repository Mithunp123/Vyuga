-- =================================================================
--  Table 2: Innovation Fest – PWD Category
--  API Endpoint: POST /api/innovation-pwd
-- =================================================================

CREATE TABLE IF NOT EXISTS innovation_pwd_registrations (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  participation_type TEXT        NOT NULL CHECK (participation_type IN ('individual','team')),
  idea_title         TEXT        NOT NULL,
  idea_description   TEXT        NOT NULL,
  -- Primary participant / leader
  name               TEXT        NOT NULL,
  email              TEXT        NOT NULL,
  phone              TEXT        NOT NULL,
  disability_type    TEXT        NOT NULL,
  -- Extra team members (empty array for individual participation)
  members            JSONB       NOT NULL DEFAULT '[]'::jsonb,
  prototype_image_path TEXT,     -- saved locally as phonenumber_timestamp.ext
  submitted_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_innov_pwd_email
  ON innovation_pwd_registrations (email);

-- Run this if the table already exists:
-- ALTER TABLE innovation_pwd_registrations ADD COLUMN IF NOT EXISTS prototype_image_path TEXT;
