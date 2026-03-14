-- =================================================================
--  VYUGA – Inclusive Innovation Fest
--  Database Schema  |  Run in Supabase SQL Editor
-- =================================================================

-- -----------------------------------------------------------------
-- 1. Innovation Fest – College Category
--    API: POST /api/innovation-college
-- -----------------------------------------------------------------
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
  -- Members 2 & 3 stored as JSON array: [{name,email,phone}, ...]
  members          JSONB       NOT NULL DEFAULT '[]'::jsonb,
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------
-- 2. Innovation Fest – PWD Category
--    API: POST /api/innovation-pwd
-- -----------------------------------------------------------------
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
  -- Extra team members (empty array for individual)
  members            JSONB       NOT NULL DEFAULT '[]'::jsonb,
  submitted_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------
-- 3. Special Talent Utsav – Organization Registration
--    API: POST /api/talent-org
-- -----------------------------------------------------------------
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

-- -----------------------------------------------------------------
-- 4. Special Talent Utsav – Student Nomination
--    API: POST /api/talent-student
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS talent_nominations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name        TEXT        NOT NULL,
  student_name    TEXT        NOT NULL,
  student_age     INTEGER     NOT NULL,
  disability_type TEXT        NOT NULL,
  talent_category TEXT        NOT NULL,
  talent_desc     TEXT,
  guardian_name   TEXT        NOT NULL,
  guardian_phone  TEXT        NOT NULL,
  video_link      TEXT        NOT NULL,
  video_file_path TEXT,                    -- set by Multer if file uploaded
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------
-- 5. Blind Cricket Tournament
--    API: POST /api/cricket
-- -----------------------------------------------------------------
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

-- -----------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_innov_college_email ON innovation_college_registrations (leader_email);
CREATE INDEX IF NOT EXISTS idx_innov_pwd_email     ON innovation_pwd_registrations (email);
CREATE INDEX IF NOT EXISTS idx_talent_org_email    ON talent_organizations (contact_email);
CREATE INDEX IF NOT EXISTS idx_talent_nom_org      ON talent_nominations (org_name);
CREATE INDEX IF NOT EXISTS idx_cricket_email       ON cricket_team_registrations (contact_email);

-- -----------------------------------------------------------------
-- Status & Admin Note columns (run these if tables already exist)
-- -----------------------------------------------------------------
ALTER TABLE innovation_college_registrations
  ADD COLUMN IF NOT EXISTS prototype_image_path TEXT,
  ADD COLUMN IF NOT EXISTS status     TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','approved','rejected')),
  ADD COLUMN IF NOT EXISTS admin_note TEXT;

ALTER TABLE innovation_pwd_registrations
  ADD COLUMN IF NOT EXISTS prototype_image_path TEXT,
  ADD COLUMN IF NOT EXISTS status     TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','approved','rejected')),
  ADD COLUMN IF NOT EXISTS admin_note TEXT;

ALTER TABLE talent_organizations
  ADD COLUMN IF NOT EXISTS status     TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','approved','rejected')),
  ADD COLUMN IF NOT EXISTS admin_note TEXT;

ALTER TABLE talent_nominations
  ADD COLUMN IF NOT EXISTS guardian_email TEXT,
  ADD COLUMN IF NOT EXISTS status         TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','approved','rejected')),
  ADD COLUMN IF NOT EXISTS admin_note     TEXT;

ALTER TABLE cricket_team_registrations
  ADD COLUMN IF NOT EXISTS status     TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','approved','rejected')),
  ADD COLUMN IF NOT EXISTS admin_note TEXT;

