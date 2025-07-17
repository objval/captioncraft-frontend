-- Add idempotency_key column to payments table
-- Run this in your Supabase SQL editor

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS idempotency_key text;

-- Add unique constraint to prevent duplicate idempotency keys
ALTER TABLE public.payments 
ADD CONSTRAINT unique_idempotency_key UNIQUE (idempotency_key);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_payments_idempotency_key 
ON public.payments (idempotency_key);

-- Add index for hypay_transaction_id lookups
CREATE INDEX IF NOT EXISTS idx_payments_hypay_transaction_id 
ON public.payments (hypay_transaction_id);

-- Add unique constraint to prevent duplicate transaction IDs
ALTER TABLE public.payments 
ADD CONSTRAINT unique_hypay_transaction_id UNIQUE (hypay_transaction_id);

-- Create the idempotency_keys table for tracking request idempotency
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    idempotency_key text NOT NULL UNIQUE,
    request_hash text NOT NULL,
    response_data jsonb,
    status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_status 
ON public.idempotency_keys (status);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires_at 
ON public.idempotency_keys (expires_at);

-- Add RLS policies for idempotency_keys table
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to manage idempotency keys
CREATE POLICY "Service role can manage idempotency keys"
ON public.idempotency_keys
FOR ALL
TO service_role
USING (true);

-- Policy to allow authenticated users to read their own idempotency keys
CREATE POLICY "Users can read their own idempotency keys"
ON public.idempotency_keys
FOR SELECT
TO authenticated
USING (true);

-- Update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_idempotency_keys_updated_at ON public.idempotency_keys;
CREATE TRIGGER update_idempotency_keys_updated_at
    BEFORE UPDATE ON public.idempotency_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function to clean up expired idempotency keys
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM public.idempotency_keys 
    WHERE expires_at < now();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_expired_idempotency_keys() TO authenticated;

-- Create a function to be called periodically to clean up expired keys
-- This should be set up as a cron job or scheduled task
-- For example, call this every hour: SELECT cleanup_expired_idempotency_keys();

COMMENT ON TABLE public.idempotency_keys IS 'Stores idempotency keys for payment requests to prevent duplicate processing';
COMMENT ON COLUMN public.idempotency_keys.idempotency_key IS 'Unique key provided by client to ensure idempotent operations';
COMMENT ON COLUMN public.idempotency_keys.request_hash IS 'SHA-256 hash of request parameters to detect parameter changes';
COMMENT ON COLUMN public.idempotency_keys.response_data IS 'Cached response data for completed requests';
COMMENT ON COLUMN public.idempotency_keys.status IS 'Status of the idempotent request: pending, completed, or failed';
COMMENT ON COLUMN public.idempotency_keys.expires_at IS 'Timestamp when this idempotency key expires and can be cleaned up';