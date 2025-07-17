-- Update existing idempotency_keys table to support comprehensive idempotency
-- Run this in your Supabase SQL editor

-- First, add the missing columns to the existing table
ALTER TABLE public.idempotency_keys 
ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS request_hash text,
ADD COLUMN IF NOT EXISTS response_data jsonb,
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

-- Update existing records to have the new required fields
UPDATE public.idempotency_keys 
SET 
  status = 'completed',
  updated_at = created_at,
  expires_at = created_at + interval '24 hours',
  request_hash = md5(key || payment_id::text)
WHERE status IS NULL;

-- Add the missing columns to payments table
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS idempotency_key text;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_status 
ON public.idempotency_keys (status);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires_at 
ON public.idempotency_keys (expires_at);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_request_hash 
ON public.idempotency_keys (request_hash);

CREATE INDEX IF NOT EXISTS idx_payments_idempotency_key 
ON public.payments (idempotency_key);

CREATE INDEX IF NOT EXISTS idx_payments_hypay_transaction_id 
ON public.payments (hypay_transaction_id);

-- Add unique constraint to prevent duplicate transaction IDs (if not exists)
DO $ 
BEGIN
    -- Add unique constraint to prevent duplicate transaction IDs (if not exists)
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'unique_hypay_transaction_id'
    ) THEN
        ALTER TABLE public.payments 
        ADD CONSTRAINT unique_hypay_transaction_id UNIQUE (hypay_transaction_id);
    END IF;
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Constraint unique_hypay_transaction_id already exists';
END $;

-- Add foreign key constraint from payments to idempotency_keys
DO $$ 
BEGIN
    ALTER TABLE public.payments 
    ADD CONSTRAINT payments_idempotency_key_fkey 
    FOREIGN KEY (idempotency_key) REFERENCES public.idempotency_keys(key);
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Constraint payments_idempotency_key_fkey already exists';
END $$;

-- Enable RLS on idempotency_keys if not already enabled
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
DROP POLICY IF EXISTS "Service role can manage idempotency keys" ON public.idempotency_keys;
CREATE POLICY "Service role can manage idempotency keys"
ON public.idempotency_keys
FOR ALL
TO service_role
USING (true);

DROP POLICY IF EXISTS "Users can read their own idempotency keys" ON public.idempotency_keys;
CREATE POLICY "Users can read their own idempotency keys"
ON public.idempotency_keys
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own idempotency keys" ON public.idempotency_keys;
CREATE POLICY "Users can insert their own idempotency keys"
ON public.idempotency_keys
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own idempotency keys" ON public.idempotency_keys;
CREATE POLICY "Users can update their own idempotency keys"
ON public.idempotency_keys
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create or update the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to update updated_at
DROP TRIGGER IF EXISTS update_idempotency_keys_updated_at ON public.idempotency_keys;
CREATE TRIGGER update_idempotency_keys_updated_at
    BEFORE UPDATE ON public.idempotency_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create cleanup function
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION cleanup_expired_idempotency_keys() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_idempotency_keys() TO service_role;

-- Add helpful comments
COMMENT ON TABLE public.idempotency_keys IS 'Enhanced idempotency tracking for payment requests';
COMMENT ON COLUMN public.idempotency_keys.key IS 'Unique idempotency key (now acts as primary key)';
COMMENT ON COLUMN public.idempotency_keys.request_hash IS 'SHA-256 hash of request parameters';
COMMENT ON COLUMN public.idempotency_keys.response_data IS 'Cached response data for completed requests';
COMMENT ON COLUMN public.idempotency_keys.status IS 'Request status: pending, completed, or failed';
COMMENT ON COLUMN public.idempotency_keys.expires_at IS 'Expiration time for cleanup';

-- Verify the updated structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'idempotency_keys' 
AND table_schema = 'public'
ORDER BY ordinal_position;