-- =================================================================
--  Table 1: Innovation Fest – College Category
--  API Endpoint: POST /api/innovation-college
-- =================================================================

CREATE TABLE IF NOT EXISTS innovation_college_registrations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name        TEXT        NOT NULL,
  college_name     TEXT        NOT NULL,
  theme            TEXT        NOT NULL,
  idea_title       TEXT        NOT NULL,
  idea_description TEXT        NOT NULL,
  -- Team leader
  leader_name      TEXT        NOT NULL,
  leader_email     TEXT        NOT NULL,
  leader_phone     TEXT        NOT NULL,
  -- Members 2 & 3 stored as JSON array: [{name, email, phone}, ...]
  members          JSONB       NOT NULL DEFAULT '[]'::jsonb,
  prototype_image_path TEXT,   -- saved locally as phonenumber_timestamp.ext
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_innov_college_email
  ON innovation_college_registrations (leader_email);

-- Run this if the table already exists:
-- ALTER TABLE innovation_college_registrations ADD COLUMN IF NOT EXISTS prototype_image_path TEXT;
