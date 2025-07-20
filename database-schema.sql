-- CaptionCraft Database Schema
-- This SQL file contains the complete database structure to replicate the database
-- Generated on 2025-01-20

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA graphql;
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA vault;

-- Create custom ENUM types
CREATE TYPE public.video_status AS ENUM (
  'uploading',
  'processing',
  'ready',
  'burning_in',
  'complete',
  'failed'
);

CREATE TYPE public.payment_status AS ENUM (
  'pending',
  'succeeded',
  'failed'
);

-- Create tables
-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL,
  email TEXT,
  credits INTEGER DEFAULT 0,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  street TEXT,
  city TEXT,
  zip_code TEXT,
  role TEXT DEFAULT 'user'::text,
  is_banned BOOLEAN DEFAULT false,
  banned_at TIMESTAMPTZ,
  banned_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT profiles_role_check CHECK (role = ANY (ARRAY['user'::text, 'admin'::text]))
);

-- 2. Videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID DEFAULT gen_random_uuid() NOT NULL,
  user_id UUID,
  title TEXT,
  status public.video_status DEFAULT 'uploading'::video_status,
  original_video_cloudinary_id TEXT,
  final_video_cloudinary_id TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  active_transcript_type TEXT NOT NULL DEFAULT 'original'::text,
  job_error_message TEXT,
  caption_style JSONB DEFAULT '{"preset": "default", "shadow": true, "outline": true, "fontSize": 24, "maxWidth": 80, "position": "bottom", "wordWrap": true, "alignment": "center", "fontColor": "white", "fontFamily": "Arial", "lineSpacing": 1.2, "shadowColor": "black", "outlineColor": "black", "outlineWidth": 2, "shadowOffsetX": 2, "shadowOffsetY": 2, "animationStyle": "none", "backgroundColor": "black", "backgroundOpacity": 0.8}'::jsonb,
  CONSTRAINT videos_pkey PRIMARY KEY (id),
  CONSTRAINT videos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT videos_active_transcript_type_check CHECK (active_transcript_type = ANY (ARRAY['original'::text, 'edited'::text]))
);

COMMENT ON COLUMN public.videos.caption_style IS 'JSONB object containing caption styling options for video burn-in process';

-- 3. Transcripts table
CREATE TABLE IF NOT EXISTS public.transcripts (
  id UUID DEFAULT gen_random_uuid() NOT NULL,
  video_id UUID,
  transcript_data JSONB,
  edited_transcript_data JSONB,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT transcripts_pkey PRIMARY KEY (id),
  CONSTRAINT transcripts_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE
);

-- 4. Credit packs table
CREATE TABLE IF NOT EXISTS public.credit_packs (
  id UUID DEFAULT gen_random_uuid() NOT NULL,
  name TEXT NOT NULL,
  credits_amount INTEGER NOT NULL,
  price_nis NUMERIC NOT NULL,
  CONSTRAINT credit_packs_pkey PRIMARY KEY (id)
);

-- 5. Credit transactions table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT gen_random_uuid() NOT NULL,
  user_id UUID,
  amount_changed INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT credit_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT credit_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 6. Idempotency keys table
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  key TEXT NOT NULL,
  payment_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  id UUID DEFAULT gen_random_uuid(),
  request_hash TEXT,
  response_data JSONB,
  status TEXT DEFAULT 'pending'::text,
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  user_id UUID,
  CONSTRAINT idempotency_keys_pkey PRIMARY KEY (key),
  CONSTRAINT idempotency_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT idempotency_keys_status_check CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text]))
);

COMMENT ON TABLE public.idempotency_keys IS 'Enhanced idempotency tracking for payment requests';
COMMENT ON COLUMN public.idempotency_keys.key IS 'Unique idempotency key (now acts as primary key)';
COMMENT ON COLUMN public.idempotency_keys.request_hash IS 'SHA-256 hash of request parameters';
COMMENT ON COLUMN public.idempotency_keys.response_data IS 'Cached response data for completed requests';
COMMENT ON COLUMN public.idempotency_keys.status IS 'Request status: pending, completed, or failed';
COMMENT ON COLUMN public.idempotency_keys.expires_at IS 'Expiration time for cleanup';

-- 7. Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() NOT NULL,
  user_id UUID,
  credit_pack_id UUID,
  amount NUMERIC NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending'::payment_status,
  hypay_transaction_id TEXT,
  provider_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  payment_url TEXT,
  test_mode BOOLEAN DEFAULT false,
  idempotency_key TEXT,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT unique_hypay_transaction_id UNIQUE (hypay_transaction_id),
  CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT payments_credit_pack_id_fkey FOREIGN KEY (credit_pack_id) REFERENCES public.credit_packs(id) ON DELETE SET NULL,
  CONSTRAINT payments_idempotency_key_fkey FOREIGN KEY (idempotency_key) REFERENCES public.idempotency_keys(key) ON DELETE SET NULL
);

-- Add payment_id foreign key to idempotency_keys after payments table is created
ALTER TABLE public.idempotency_keys
  ADD CONSTRAINT idempotency_keys_payment_id_fkey 
  FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE;

-- 8. Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() NOT NULL,
  payment_id UUID,
  invoice_number TEXT,
  invoice_url TEXT,
  status TEXT,
  provider_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_payment_id_unique UNIQUE (payment_id),
  CONSTRAINT invoices_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles USING btree (role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON public.profiles USING btree (is_banned);
CREATE INDEX IF NOT EXISTS idx_payments_hypay_transaction_id ON public.payments USING btree (hypay_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_idempotency_key ON public.payments USING btree (idempotency_key);
CREATE INDEX IF NOT EXISTS idx_payments_test_mode ON public.payments USING btree (test_mode);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_id ON public.invoices USING btree (payment_id);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_request_hash ON public.idempotency_keys USING btree (request_hash);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_status ON public.idempotency_keys USING btree (status);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires_at ON public.idempotency_keys USING btree (expires_at);

-- Create functions
-- 1. Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. Trigger set timestamp function
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 3. Is admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id
  LIMIT 1;
  
  RETURN user_role = 'admin';
END;
$function$;

-- 4. Current user is admin function
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN user_role = 'admin';
END;
$function$;

-- 5. Add credits function
CREATE OR REPLACE FUNCTION public.add_credits(p_user_id uuid, p_amount integer)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE profiles
  SET credits = credits + p_amount
  WHERE id = p_user_id;

  INSERT INTO credit_transactions (user_id, amount_changed, reason)
  VALUES (p_user_id, p_amount, 'credit_purchase');
END;
$function$;

-- 6. Deduct credits function
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id uuid, p_amount integer)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Select the current credits into a variable, with a lock to prevent race conditions
  SELECT credits INTO current_credits FROM profiles WHERE id = p_user_id FOR UPDATE;

  -- Check if the user has enough credits
  IF current_credits < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits. You need at least % credits to perform this action.', p_amount;
  END IF;

  -- Deduct the credits
  UPDATE profiles SET credits = credits - p_amount WHERE id = p_user_id;

  -- Log the transaction
  INSERT INTO credit_transactions (user_id, amount_changed, reason)
  VALUES (p_user_id, -p_amount, 'Action');

END;
$function$;

-- 7. Handle new user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, credits, role, created_at, updated_at)
  VALUES (
    new.id, 
    new.email, 
    50,  -- Default 50 credits for new users
    'user',  -- Default role is 'user'
    new.created_at,
    new.created_at
  );
  RETURN new;
END;
$function$;

-- 8. Cleanup expired idempotency keys function
CREATE OR REPLACE FUNCTION public.cleanup_expired_idempotency_keys()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM public.idempotency_keys 
    WHERE expires_at < now();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$function$;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_payments_timestamp 
  BEFORE UPDATE ON public.payments 
  FOR EACH ROW 
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_invoices_timestamp 
  BEFORE UPDATE ON public.invoices 
  FOR EACH ROW 
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER update_idempotency_keys_updated_at 
  BEFORE UPDATE ON public.idempotency_keys 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create auth trigger for new users
CREATE TRIGGER on_auth_user_created 
  AFTER INSERT ON auth.users 
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles policies
CREATE POLICY "Users can view their own profile." ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile during signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles" ON public.profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Videos policies
CREATE POLICY "Allow user to insert their own videos" ON public.videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow user to view their own videos" ON public.videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own videos." ON public.videos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "videos_insert_own" ON public.videos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "videos_select_policy" ON public.videos
  FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR current_user_is_admin());

CREATE POLICY "videos_update_own" ON public.videos
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Transcripts policies
CREATE POLICY "Users can manage transcripts for their videos." ON public.transcripts
  FOR ALL USING (EXISTS (
    SELECT 1 FROM videos 
    WHERE videos.id = transcripts.video_id 
    AND videos.user_id = auth.uid()
  ));

CREATE POLICY "transcripts_select_policy" ON public.transcripts
  FOR SELECT TO authenticated USING (
    (EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = transcripts.video_id 
      AND videos.user_id = auth.uid()
    )) OR current_user_is_admin()
  );

-- Credit packs policies
CREATE POLICY "Authenticated users can view credit packs." ON public.credit_packs
  FOR SELECT TO public USING (true);

-- Credit transactions policies
CREATE POLICY "Allow user to insert their own credit transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow user to view their own credit transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own credit transactions." ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Allow users to create their own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to see their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Invoices policies
CREATE POLICY "Allow users to see their own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = (
    SELECT payments.user_id 
    FROM payments 
    WHERE payments.id = invoices.payment_id
  ));

-- Idempotency keys policies
CREATE POLICY "Service role can manage idempotency keys" ON public.idempotency_keys
  FOR ALL TO service_role USING (true);

CREATE POLICY "Users can insert their own idempotency keys" ON public.idempotency_keys
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own idempotency keys" ON public.idempotency_keys
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own idempotency keys" ON public.idempotency_keys
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Insert default credit packs
INSERT INTO public.credit_packs (name, credits_amount, price_nis) VALUES
  ('Starter Pack', 50, 29.00),
  ('Standard Pack', 250, 99.00),
  ('Pro Pack', 600, 199.00),
  ('Enterprise Pack', 1500, 399.00);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Grant specific permissions for authenticated users
GRANT SELECT ON public.credit_packs TO anon, authenticated;
GRANT SELECT, INSERT ON public.profiles TO anon, authenticated;
GRANT UPDATE (email, credits, first_name, last_name, phone_number, street, city, zip_code, updated_at) ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.videos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transcripts TO authenticated;
GRANT SELECT, INSERT ON public.credit_transactions TO authenticated;
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT SELECT ON public.invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.idempotency_keys TO authenticated;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_transactions;