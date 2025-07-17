-- Fix RLS policies for invoices table to ensure proper access
-- This allows users to access invoices for their own payments

-- Enable RLS on invoices table (if not already enabled)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view invoices for their payments" ON public.invoices;

-- Create policy to allow users to view invoices for their own payments
CREATE POLICY "Users can view invoices for their payments" ON public.invoices
  FOR SELECT
  USING (
    payment_id IN (
      SELECT id FROM public.payments WHERE user_id = auth.uid()
    )
  );

-- Create policy to allow service role to insert/update invoices
DROP POLICY IF EXISTS "Service role can manage invoices" ON public.invoices;
CREATE POLICY "Service role can manage invoices" ON public.invoices
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;