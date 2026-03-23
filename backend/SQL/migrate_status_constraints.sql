-- Migration: Update status enum constraints to include 'selected'
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. Innovation College
ALTER TABLE innovation_college_registrations DROP CONSTRAINT IF EXISTS innovation_college_registrations_status_check;
-- Migrate existing 'approved' to 'selected'
UPDATE innovation_college_registrations SET status = 'selected' WHERE status = 'approved';
-- Add new constraint
ALTER TABLE innovation_college_registrations ADD CONSTRAINT innovation_college_registrations_status_check 
  CHECK (status IN ('pending', 'selected', 'rejected'));


-- 2. Innovation PWD
ALTER TABLE innovation_pwd_registrations DROP CONSTRAINT IF EXISTS innovation_pwd_registrations_status_check;
UPDATE innovation_pwd_registrations SET status = 'selected' WHERE status = 'approved';
ALTER TABLE innovation_pwd_registrations ADD CONSTRAINT innovation_pwd_registrations_status_check 
  CHECK (status IN ('pending', 'selected', 'rejected'));


-- 3. Talent Organizations
ALTER TABLE talent_organizations DROP CONSTRAINT IF EXISTS talent_organizations_status_check;
UPDATE talent_organizations SET status = 'selected' WHERE status = 'approved';
ALTER TABLE talent_organizations ADD CONSTRAINT talent_organizations_status_check 
  CHECK (status IN ('pending', 'selected', 'rejected'));


-- 4. Talent Nominations
ALTER TABLE talent_nominations DROP CONSTRAINT IF EXISTS talent_nominations_status_check;
UPDATE talent_nominations SET status = 'selected' WHERE status = 'approved';
ALTER TABLE talent_nominations ADD CONSTRAINT talent_nominations_status_check 
  CHECK (status IN ('pending', 'selected', 'rejected'));


-- 5. Cricket Team Registrations
ALTER TABLE cricket_team_registrations DROP CONSTRAINT IF EXISTS cricket_team_registrations_status_check;
UPDATE cricket_team_registrations SET status = 'selected' WHERE status = 'approved';
ALTER TABLE cricket_team_registrations ADD CONSTRAINT cricket_team_registrations_status_check 
  CHECK (status IN ('pending', 'selected', 'rejected'));


-- 6. Blind Chess Registrations
ALTER TABLE blind_chess_registrations DROP CONSTRAINT IF EXISTS blind_chess_registrations_status_check;
UPDATE blind_chess_registrations SET status = 'selected' WHERE status = 'approved';
ALTER TABLE blind_chess_registrations ADD CONSTRAINT blind_chess_registrations_status_check 
  CHECK (status IN ('pending', 'selected', 'rejected'));


-- 7. Accommodation Requests
ALTER TABLE accommodation_requests DROP CONSTRAINT IF EXISTS accommodation_requests_status_check;
UPDATE accommodation_requests SET status = 'selected' WHERE status IN ('confirmed', 'approved');
ALTER TABLE accommodation_requests ADD CONSTRAINT accommodation_requests_status_check 
  CHECK (status IN ('pending', 'selected', 'rejected'));

COMMIT;
