-- Add unique constraint on payment_id to invoices table
-- This ensures one invoice per payment and enables proper upsert functionality

ALTER TABLE public.invoices 
ADD CONSTRAINT invoices_payment_id_unique UNIQUE (payment_id);

-- Create index for performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_invoices_payment_id ON public.invoices (payment_id);