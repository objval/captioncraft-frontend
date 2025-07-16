-- =============================================================================
-- QUICK FIX: Update Registration Credit System
-- =============================================================================
-- The trigger already exists, we just need to update the function
-- Run this single command in Supabase SQL Editor:

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create profile with 50 welcome credits
  INSERT INTO public.profiles (id, email, credits)
  VALUES (new.id, new.email, 50);
  
  -- Record the welcome credits transaction
  INSERT INTO public.credit_transactions (user_id, amount_changed, reason)
  VALUES (new.id, 50, 'welcome_bonus');
  
  RETURN new;
END;
$$;

-- =============================================================================
-- Verification: Check if it worked
-- =============================================================================
-- Run this after the function update to verify:

SELECT pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'handle_new_user';
