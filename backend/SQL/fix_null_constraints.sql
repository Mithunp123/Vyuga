-- Remove NOT NULL constraints for fields that don't apply to team nominations
ALTER TABLE talent_nominations ALTER COLUMN student_age DROP NOT NULL;
ALTER TABLE talent_nominations ALTER COLUMN student_name DROP NOT NULL;
ALTER TABLE talent_nominations ALTER COLUMN guardian_name DROP NOT NULL;
ALTER TABLE talent_nominations ALTER COLUMN guardian_phone DROP NOT NULL;