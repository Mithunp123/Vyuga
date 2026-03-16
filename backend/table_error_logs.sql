-- =================================================================
--  Table: Error Logs
--  Stores all errors from both user-facing and admin operations
-- =================================================================

CREATE TABLE IF NOT EXISTS error_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source      TEXT        NOT NULL,     -- 'user' or 'admin'
  endpoint    TEXT        NOT NULL,     -- e.g. '/api/innovation-college', '/api/admin/status'
  method      TEXT        NOT NULL,     -- 'GET', 'POST', 'PATCH'
  error_type  TEXT        NOT NULL,     -- 'db_error', 'validation_error', 'upload_error', 'email_error', 'auth_error', 'client_error', 'server_error'
  message     TEXT        NOT NULL,     -- error message
  stack       TEXT,                     -- stack trace (if available)
  request_body JSONB,                   -- sanitised request body (no passwords/tokens)
  user_agent  TEXT,                     -- browser user-agent
  ip_address  TEXT,                     -- client IP
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_source     ON error_logs (source);
CREATE INDEX IF NOT EXISTS idx_error_logs_endpoint   ON error_logs (endpoint);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs (error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs (created_at DESC);

-- Run this in Supabase SQL editor to create the table
