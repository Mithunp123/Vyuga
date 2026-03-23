-- Create error_logs table if not exists
CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  source text NOT NULL,
  endpoint text NOT NULL,
  method text NOT NULL,
  error_type text NOT NULL,
  message text NOT NULL,
  stack text NULL,
  request_body jsonb NULL,
  user_agent text NULL,
  ip_address text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text DEFAULT 'new',
  CONSTRAINT error_logs_pkey PRIMARY KEY (id)
);

-- Add status column if it doesn't exist (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'error_logs' AND column_name = 'status') THEN
        ALTER TABLE public.error_logs ADD COLUMN status text DEFAULT 'new';
    END IF;
END
$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_error_logs_source ON public.error_logs USING btree (source);
CREATE INDEX IF NOT EXISTS idx_error_logs_endpoint ON public.error_logs USING btree (endpoint);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON public.error_logs USING btree (error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs USING btree (created_at desc);
CREATE INDEX IF NOT EXISTS idx_error_logs_status ON public.error_logs USING btree (status);
