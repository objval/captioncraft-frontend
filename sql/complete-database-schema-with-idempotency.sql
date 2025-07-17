-- CaptionCraft Complete Database Schema with Security Enhancements
-- Includes idempotency keys for duplicate payment prevention
-- Compatible with Supabase/PostgreSQL

-- Drop existing tables if recreating (use with caution in production)
-- DROP TABLE IF EXISTS public.idempotency_keys CASCADE;
-- DROP TABLE IF EXISTS public.credit_transactions CASCADE;
-- DROP TABLE IF EXISTS public.invoices CASCADE;
-- DROP TABLE IF EXISTS public.payments CASCADE;
-- DROP TABLE IF EXISTS public.transcripts CASCADE;
-- DROP TABLE IF EXISTS public.videos CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;
-- DROP TABLE IF EXISTS public.credit_packs CASCADE;

-- Create custom types
CREATE TYPE public.payment_status AS ENUM ('pending', 'succeeded', 'failed', 'cancelled');
CREATE TYPE public.video_status AS ENUM ('uploading', 'processing', 'ready', 'burning_in', 'complete', 'failed');

-- Credit Packs Table
-- Defines available credit packages for purchase
CREATE TABLE public.credit_packs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  credits_amount integer NOT NULL CHECK (credits_amount > 0),
  price_nis numeric NOT NULL CHECK (price_nis > 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT credit_packs_pkey PRIMARY KEY (id),
  CONSTRAINT credit_packs_name_unique UNIQUE (name)
);

-- User Profiles Table
-- Extended user information including billing details
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  credits integer DEFAULT 0 CHECK (credits >= 0),
  first_name text,
  last_name text,
  phone_number text,
  street text,
  city text,
  zip_code text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Idempotency Keys Table
-- Prevents duplicate payment processing and API calls
CREATE TABLE public.idempotency_keys (
  key text NOT NULL,
  resource_type text NOT NULL DEFAULT 'payment',
  resource_id uuid,
  request_hash text,
  response_data jsonb,
  status text NOT NULL DEFAULT 'processing',
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '24 hours'),
  CONSTRAINT idempotency_keys_pkey PRIMARY KEY (key),
  CONSTRAINT idempotency_keys_key_check CHECK (length(key) >= 10),
  CONSTRAINT idempotency_keys_status_check CHECK (status IN ('processing', 'completed', 'failed'))
);

-- Create index for fast lookups and cleanup
CREATE INDEX idx_idempotency_keys_expires_at ON public.idempotency_keys (expires_at);
CREATE INDEX idx_idempotency_keys_resource ON public.idempotency_keys (resource_type, resource_id);

-- Payments Table
-- Core payment transaction records
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  credit_pack_id uuid NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  amount_nis numeric GENERATED ALWAYS AS (amount) STORED, -- For backward compatibility
  status public.payment_status NOT NULL DEFAULT 'pending',
  hypay_transaction_id text,
  provider_response jsonb,
  payment_url text,
  idempotency_key text,
  test_mode boolean NOT NULL DEFAULT false,
  client_ip inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_credit_pack_id_fkey FOREIGN KEY (credit_pack_id) REFERENCES public.credit_packs(id),
  CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT payments_idempotency_key_fkey FOREIGN KEY (idempotency_key) REFERENCES public.idempotency_keys(key),
  CONSTRAINT payments_hypay_transaction_id_unique UNIQUE (hypay_transaction_id)
);

-- Create indexes for performance
CREATE INDEX idx_payments_user_id ON public.payments (user_id);
CREATE INDEX idx_payments_status ON public.payments (status);
CREATE INDEX idx_payments_created_at ON public.payments (created_at DESC);
CREATE INDEX idx_payments_hypay_transaction_id ON public.payments (hypay_transaction_id) WHERE hypay_transaction_id IS NOT NULL;
CREATE INDEX idx_payments_test_mode ON public.payments (test_mode);

-- Invoices Table
-- Invoice generation and tracking
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL,
  invoice_number text,
  invoice_url text,
  status text NOT NULL DEFAULT 'pending',
  provider_response jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE,
  CONSTRAINT invoices_payment_id_unique UNIQUE (payment_id),
  CONSTRAINT invoices_invoice_number_unique UNIQUE (invoice_number) WHERE invoice_number IS NOT NULL,
  CONSTRAINT invoices_status_check CHECK (status IN ('pending', 'generated', 'sent', 'failed'))
);

-- Credit Transactions Table
-- Audit trail for all credit movements
CREATE TABLE public.credit_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount_changed integer NOT NULL,
  reason text NOT NULL,
  payment_id uuid,
  balance_before integer NOT NULL CHECK (balance_before >= 0),
  balance_after integer NOT NULL CHECK (balance_after >= 0),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT credit_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT credit_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT credit_transactions_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id),
  CONSTRAINT credit_transactions_balance_check CHECK (balance_after = balance_before + amount_changed)
);

-- Create indexes for credit transaction queries
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions (user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions (created_at DESC);
CREATE INDEX idx_credit_transactions_payment_id ON public.credit_transactions (payment_id) WHERE payment_id IS NOT NULL;

-- Videos Table
-- Video processing and caption generation
CREATE TABLE public.videos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  status public.video_status DEFAULT 'uploading',
  original_video_cloudinary_id text,
  final_video_cloudinary_id text,
  thumbnail_url text,
  active_transcript_type text NOT NULL DEFAULT 'original' CHECK (active_transcript_type IN ('original', 'edited')),
  job_error_message text,
  caption_style jsonb DEFAULT '{"preset": "default", "shadow": true, "outline": true, "fontSize": 24, "maxWidth": 80, "position": "bottom", "wordWrap": true, "alignment": "center", "fontColor": "white", "fontFamily": "Arial", "lineSpacing": 1.2, "shadowColor": "black", "outlineColor": "black", "outlineWidth": 2, "shadowOffsetX": 2, "shadowOffsetY": 2, "animationStyle": "none", "backgroundColor": "black", "backgroundOpacity": 0.8}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT videos_pkey PRIMARY KEY (id),
  CONSTRAINT videos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for video queries
CREATE INDEX idx_videos_user_id ON public.videos (user_id);
CREATE INDEX idx_videos_status ON public.videos (status);
CREATE INDEX idx_videos_created_at ON public.videos (created_at DESC);

-- Transcripts Table
-- AI-generated and manually edited transcripts
CREATE TABLE public.transcripts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL,
  transcript_data jsonb,
  edited_transcript_data jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transcripts_pkey PRIMARY KEY (id),
  CONSTRAINT transcripts_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE,
  CONSTRAINT transcripts_video_id_unique UNIQUE (video_id)
);

-- Row Level Security (RLS) Policies
-- Ensure users can only access their own data

-- Enable RLS on all user-specific tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Invoices policies (through payment relationship)
CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.payments 
      WHERE payments.id = invoices.payment_id 
      AND payments.user_id = auth.uid()
    )
  );

-- Credit transactions policies
CREATE POLICY "Users can view own credit transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Videos policies
CREATE POLICY "Users can manage own videos" ON public.videos
  FOR ALL USING (auth.uid() = user_id);

-- Transcripts policies (through video relationship)
CREATE POLICY "Users can manage own transcripts" ON public.transcripts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.videos 
      WHERE videos.id = transcripts.video_id 
      AND videos.user_id = auth.uid()
    )
  );

-- Database Functions

-- Function to add credits with audit trail
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id uuid,
  p_amount integer,
  p_reason text DEFAULT 'Credit purchase',
  p_payment_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance integer;
  new_balance integer;
BEGIN
  -- Get current balance
  SELECT credits INTO current_balance
  FROM public.profiles
  WHERE id = p_user_id;
  
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance + p_amount;
  
  -- Update profile
  UPDATE public.profiles
  SET credits = new_balance,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Insert audit record
  INSERT INTO public.credit_transactions (
    user_id,
    amount_changed,
    reason,
    payment_id,
    balance_before,
    balance_after
  ) VALUES (
    p_user_id,
    p_amount,
    p_reason,
    p_payment_id,
    current_balance,
    new_balance
  );
END;
$$;

-- Function to deduct credits with validation
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id uuid,
  p_amount integer,
  p_reason text DEFAULT 'Credit usage'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance integer;
  new_balance integer;
BEGIN
  -- Get current balance
  SELECT credits INTO current_balance
  FROM public.profiles
  WHERE id = p_user_id;
  
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
  
  -- Check if sufficient credits
  IF current_balance < p_amount THEN
    RETURN false;
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance - p_amount;
  
  -- Update profile
  UPDATE public.profiles
  SET credits = new_balance,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Insert audit record
  INSERT INTO public.credit_transactions (
    user_id,
    amount_changed,
    reason,
    balance_before,
    balance_after
  ) VALUES (
    p_user_id,
    -p_amount,
    p_reason,
    current_balance,
    new_balance
  );
  
  RETURN true;
END;
$$;

-- Function to cleanup expired idempotency keys
CREATE OR REPLACE FUNCTION public.cleanup_expired_idempotency_keys()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.idempotency_keys
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sample data for testing (optional)
/*
INSERT INTO public.credit_packs (name, credits_amount, price_nis) VALUES
  ('Starter Pack', 10, 29.90),
  ('Popular Pack', 50, 99.90),
  ('Pro Pack', 100, 179.90),
  ('Enterprise Pack', 500, 799.90);
*/

-- Comments for documentation
COMMENT ON TABLE public.idempotency_keys IS 'Prevents duplicate API operations and payment processing';
COMMENT ON TABLE public.payments IS 'Core payment transaction records with Hypay integration';
COMMENT ON TABLE public.credit_transactions IS 'Immutable audit trail of all credit movements';
COMMENT ON FUNCTION public.add_credits IS 'Safely adds credits to user account with audit trail';
COMMENT ON FUNCTION public.deduct_credits IS 'Safely deducts credits with balance validation and audit trail';
COMMENT ON FUNCTION public.cleanup_expired_idempotency_keys IS 'Maintenance function to remove expired idempotency keys';

-- Indexes for performance optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_user_status 
  ON public.payments (user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_credit_transactions_user_date 
  ON public.credit_transactions (user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_user_status 
  ON public.videos (user_id, status);

-- Grant necessary permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
-- GRANT SELECT ON public.credit_packs TO authenticated;
-- GRANT SELECT ON public.credit_transactions TO authenticated;