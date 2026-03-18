-- Quick fix: Add missing performance_url column
-- Run this immediately to fix the current 500 error

ALTER TABLE talent_nominations ADD COLUMN IF NOT EXISTS performance_url TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'talent_nominations' 
AND column_name = 'performance_url';