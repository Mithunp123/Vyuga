-- =================================================================
--  Table 4: Special Talent Utsav – Student Nominations
--  API Endpoint: POST /api/talent-student
-- =================================================================

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
  video_file_path TEXT,        -- populated when a video file is uploaded via Multer
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_talent_nom_org
  ON talent_nominations (org_name);
