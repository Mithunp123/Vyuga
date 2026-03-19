-- =================================================================
--  Migration: Add tournament_experience field to cricket table
--  Adds tournament_experience JSONB field to cricket_team_registrations
-- =================================================================

-- Add tournament_experience field to cricket_team_registrations table
ALTER TABLE cricket_team_registrations
  ADD COLUMN IF NOT EXISTS tournament_experience JSONB;

-- Create index for better search performance on JSONB field
CREATE INDEX IF NOT EXISTS idx_cricket_tournament_experience ON cricket_team_registrations USING GIN (tournament_experience jsonb_ops);

-- Add comment to document field purpose
COMMENT ON COLUMN cricket_team_registrations.tournament_experience IS 'JSONB field storing tournament experience details: {hasPlayedBefore: boolean, tournamentCount?: number, eventNames?: string}';