-- =================================================================
--  Table: Accommodation Requests
--  API Endpoint: POST /api/accommodation-request
-- =================================================================

CREATE TABLE IF NOT EXISTS accommodation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  organization TEXT,
  arrival_date DATE,
  departure_date DATE,
  room_type TEXT CHECK (room_type IN ('single', 'double', 'shared')),
  accessibility_needs TEXT,
  special_requests TEXT,
  dietary_requirements TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
  admin_notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_accommodation_email ON accommodation_requests (email);
CREATE INDEX IF NOT EXISTS idx_accommodation_status ON accommodation_requests (status);
CREATE INDEX IF NOT EXISTS idx_accommodation_dates ON accommodation_requests (arrival_date, departure_date);

-- Add comments for documentation
COMMENT ON TABLE accommodation_requests IS 'Accommodation requests from VYUGA event attendees';
COMMENT ON COLUMN accommodation_requests.accessibility_needs IS 'Special accessibility requirements';
COMMENT ON COLUMN accommodation_requests.special_requests IS 'Any special requests or preferences';