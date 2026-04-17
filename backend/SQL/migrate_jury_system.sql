-- 1. Create jury_users table
CREATE TABLE IF NOT EXISTS jury_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    name TEXT,
    phone TEXT,
    organization TEXT,
    designation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create jury_evaluations table
CREATE TABLE IF NOT EXISTS jury_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jury_id UUID REFERENCES jury_users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    registration_id UUID NOT NULL,
    score INTEGER NOT NULL,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(jury_id, event_type, registration_id)
);

-- 3. Create jury_assignments table
CREATE TABLE IF NOT EXISTS jury_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jury_id UUID REFERENCES jury_users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    registration_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(jury_id, event_type, registration_id)
);

-- 4. Add email_sent boolean to all registration tables
DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT unnest(array[
      'innovation_college_registrations',
      'innovation_pwd_registrations',
      'talent_nominations',
      'cricket_team_registrations',
      'blind_chess_registrations',
      'shortfilm_registrations',
      'accommodation_requests'
    ])
  LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false', t);
  END LOOP;
END $$;
