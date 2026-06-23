-- ================================================================
--  BACKFILL reg_id for all existing registrations
--  Run this ONCE in Supabase SQL Editor after migrate_add_reg_id.sql
--
--  Rules:
--    VYG-1XXXX -> innovation_college_registrations  (ordered by submitted_at)
--    VYG-2XXXX -> talent_nominations where contact_name IS NULL  (talent-student)
--    VYG-3XXXX -> talent_nominations where contact_name IS NOT NULL (talent-combined/parent)
--    VYG-4XXXX -> shortfilm_registrations  (ordered by submitted_at)
-- ================================================================

-- ── 1. innovation_college_registrations ──────────────────────────
UPDATE innovation_college_registrations AS t
SET reg_id = ranked.new_reg_id
FROM (
  SELECT
    id,
    'VYG-1' || LPAD(ROW_NUMBER() OVER (ORDER BY submitted_at ASC, id ASC)::text, 4, '0') AS new_reg_id
  FROM innovation_college_registrations
  WHERE reg_id IS NULL
) AS ranked
WHERE t.id = ranked.id;

-- ── 2. talent_nominations (talent-student, VYG-2XXXX) ────────────
-- talent-student rows: submitted via /api/talent-student
-- They do NOT have contact_name / org_city set (only org_name + guardian fields)
-- Safest distinguisher: contact_email IS NULL  (student-only flow never sets contact_email)
UPDATE talent_nominations AS t
SET reg_id = ranked.new_reg_id
FROM (
  SELECT
    id,
    'VYG-2' || LPAD(ROW_NUMBER() OVER (ORDER BY submitted_at ASC, id ASC)::text, 4, '0') AS new_reg_id
  FROM talent_nominations
  WHERE reg_id IS NULL
    AND contact_email IS NULL   -- talent-student rows have no contact_email
) AS ranked
WHERE t.id = ranked.id;

-- ── 3. talent_nominations (talent-combined / parent, VYG-3XXXX) ──
-- talent-combined rows have contact_email set (organization contact)
UPDATE talent_nominations AS t
SET reg_id = ranked.new_reg_id
FROM (
  SELECT
    id,
    'VYG-3' || LPAD(ROW_NUMBER() OVER (ORDER BY submitted_at ASC, id ASC)::text, 4, '0') AS new_reg_id
  FROM talent_nominations
  WHERE reg_id IS NULL
    AND contact_email IS NOT NULL  -- talent-combined rows always have contact_email
) AS ranked
WHERE t.id = ranked.id;

-- ── 4. shortfilm_registrations ────────────────────────────────────
UPDATE shortfilm_registrations AS t
SET reg_id = ranked.new_reg_id
FROM (
  SELECT
    id,
    'VYG-4' || LPAD(ROW_NUMBER() OVER (ORDER BY submitted_at ASC, id ASC)::text, 4, '0') AS new_reg_id
  FROM shortfilm_registrations
  WHERE reg_id IS NULL
) AS ranked
WHERE t.id = ranked.id;

-- ── Verify: show a sample of all assigned reg_ids ─────────────────
SELECT 'innovation_college' AS source, id, reg_id, submitted_at
  FROM innovation_college_registrations ORDER BY reg_id LIMIT 10;

SELECT 'talent_student (VYG-2)' AS source, id, reg_id, contact_email, submitted_at
  FROM talent_nominations WHERE reg_id LIKE 'VYG-2%' ORDER BY reg_id LIMIT 10;

SELECT 'talent_parent (VYG-3)' AS source, id, reg_id, contact_email, submitted_at
  FROM talent_nominations WHERE reg_id LIKE 'VYG-3%' ORDER BY reg_id LIMIT 10;

SELECT 'shortfilm' AS source, id, reg_id, submitted_at
  FROM shortfilm_registrations ORDER BY reg_id LIMIT 10;
