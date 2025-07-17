-- Simple migration to add test_mode column to payments table
-- Run this in your Supabase SQL editor

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS test_mode boolean DEFAULT false;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_payments_test_mode 
ON public.payments (test_mode);

-- Update existing payments to be production mode
UPDATE public.payments 
SET test_mode = false 
WHERE test_mode IS NULL;