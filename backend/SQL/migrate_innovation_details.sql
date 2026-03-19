-- =================================================================
--  Migration: Add detailed fields to innovation tables
--  Adds pain_point, solution, and usp fields to both innovation tables
-- =================================================================

-- Add new fields to innovation_college_registrations table
ALTER TABLE innovation_college_registrations
  ADD COLUMN IF NOT EXISTS idea_description TEXT,
  ADD COLUMN IF NOT EXISTS pain_point TEXT,
  ADD COLUMN IF NOT EXISTS solution TEXT,
  ADD COLUMN IF NOT EXISTS usp TEXT;

-- Add new fields to innovation_pwd_registrations table
ALTER TABLE innovation_pwd_registrations
  ADD COLUMN IF NOT EXISTS idea_description TEXT,
  ADD COLUMN IF NOT EXISTS pain_point TEXT,
  ADD COLUMN IF NOT EXISTS solution TEXT,
  ADD COLUMN IF NOT EXISTS usp TEXT;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_innov_college_idea_description ON innovation_college_registrations (idea_description);
CREATE INDEX IF NOT EXISTS idx_innov_college_pain_point ON innovation_college_registrations (pain_point);
CREATE INDEX IF NOT EXISTS idx_innov_college_solution ON innovation_college_registrations (solution);
CREATE INDEX IF NOT EXISTS idx_innov_college_usp ON innovation_college_registrations (usp);

CREATE INDEX IF NOT EXISTS idx_innov_pwd_idea_description ON innovation_pwd_registrations (idea_description);
CREATE INDEX IF NOT EXISTS idx_innov_pwd_pain_point ON innovation_pwd_registrations (pain_point);
CREATE INDEX IF NOT EXISTS idx_innov_pwd_solution ON innovation_pwd_registrations (solution);
CREATE INDEX IF NOT EXISTS idx_innov_pwd_usp ON innovation_pwd_registrations (usp);