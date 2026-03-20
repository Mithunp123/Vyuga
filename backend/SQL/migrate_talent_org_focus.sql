-- =================================================================
--  Migration: Add Organization Focus and Disability Types to talent_organizations and talent_nominations
--  Adds focus type and supported disability types
-- =================================================================

-- Add organization focus column to talent_organizations
ALTER TABLE talent_organizations ADD COLUMN IF NOT EXISTS org_focus TEXT CHECK (org_focus IN ('single', 'multiple'));

-- Add disability types column to talent_organizations (JSON array for multiple selection)
ALTER TABLE talent_organizations ADD COLUMN IF NOT EXISTS disability_types JSONB;

-- Add organization disability types column to talent_nominations (already has org_disability_focus from migrate_talent_combined.sql)
ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS org_disability_types JSONB;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_talent_org_focus ON talent_organizations (org_focus);
CREATE INDEX IF NOT EXISTS idx_talent_org_disability_types ON talent_organizations USING GIN (disability_types);
CREATE INDEX IF NOT EXISTS idx_talent_nom_org_disability_types ON talent_nominations USING GIN (org_disability_types);

-- Add comments for documentation
COMMENT ON COLUMN talent_organizations.org_focus IS 'Whether organization focuses on single or multiple disability types';
COMMENT ON COLUMN talent_organizations.disability_types IS 'JSON array of disability types the organization works with';
COMMENT ON COLUMN talent_nominations.org_disability_types IS 'JSON array of disability types the organization works with (for nominations)';