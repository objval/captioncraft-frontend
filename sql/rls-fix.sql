-- Add RLS policies for idempotency_keys table
-- This script needs to be run by a user with sufficient privileges (e.g., database owner)

-- Drop existing policies if they exist to prevent conflicts
DROP POLICY IF EXISTS "Service role can manage idempotency keys" ON public.idempotency_keys;
DROP POLICY IF EXISTS "Users can read their own idempotency keys" ON public.idempotency_keys;
DROP POLICY IF EXISTS "Users can insert their own idempotency keys" ON public.idempotency_keys;
DROP POLICY IF EXISTS "Users can update their own idempotency keys" ON public.idempotency_keys;

-- Policy for service_role (full access)
CREATE POLICY "Service role can manage idempotency keys"
  ON public.idempotency_keys
  FOR ALL
  TO service_role
  USING (true);

-- Policy for authenticated users to read their own records
CREATE POLICY "Users can read their own idempotency keys"
  ON public.idempotency_keys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for authenticated users to insert their own records
CREATE POLICY "Users can insert their own idempotency keys"
  ON public.idempotency_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to update their own records
CREATE POLICY "Users can update their own idempotency keys"
  ON public.idempotency_keys
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
