-- =================================================================
--  Migration: Update talent_nominations table for combined form
--  Adds organization details and team functionality
-- =================================================================

-- Add organization details columns
ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS org_address TEXT;
ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS org_city TEXT;
ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS org_state TEXT;
ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS org_zip TEXT;
ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS org_size TEXT;
ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS org_disability_focus TEXT CHECK (org_disability_focus IN ('single', 'multiple'));
ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS contact_designation TEXT;
ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Add nomination type and team details
ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS nomination_type TEXT CHECK (nomination_type IN ('individual', 'team'));
ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS team_size INTEGER;
ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS team_members JSONB;  -- Store array of team member objects

-- Ensure performance_url column exists (from original schema)
ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS performance_url TEXT;

-- Make individual-specific fields nullable for team nominations
ALTER TABLE talent_nominations ALTER COLUMN student_age DROP NOT NULL;
ALTER TABLE talent_nominations ALTER COLUMN student_name DROP NOT NULL;
ALTER TABLE talent_nominations ALTER COLUMN guardian_name DROP NOT NULL;
ALTER TABLE talent_nominations ALTER COLUMN guardian_phone DROP NOT NULL;

-- Update existing records to have nomination_type = 'individual' for backward compatibility
UPDATE talent_nominations SET nomination_type = 'individual' WHERE nomination_type IS NULL;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_talent_nom_type ON talent_nominations (nomination_type);
CREATE INDEX IF NOT EXISTS idx_talent_nom_org_city ON talent_nominations (org_city);
CREATE INDEX IF NOT EXISTS idx_talent_nom_contact_email ON talent_nominations (contact_email);
CREATE INDEX IF NOT EXISTS idx_talent_nom_org_disability_focus ON talent_nominations (org_disability_focus);