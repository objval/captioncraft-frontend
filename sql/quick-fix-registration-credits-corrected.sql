-- =============================================================================
-- QUICK FIX: UPDATE EXISTING REGISTRATION TRIGGER FOR AUTOMATIC 50 CREDITS
-- =============================================================================
-- This is the corrected version that matches your actual database schema
-- Run this in Supabase SQL Editor to update the existing trigger function
-- =============================================================================

-- 1. UPDATE THE EXISTING FUNCTION TO ADD 50 WELCOME CREDITS
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

-- 2. VERIFY THE SYSTEM WORKS
-- Check that trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check the updated function
SELECT pg_get_functiondef(oid) as updated_function_definition
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. TEST WITH RECENT REGISTRATIONS
-- See recent users and their welcome credits
SELECT 
  p.id,
  p.email,
  p.credits,
  ct.amount_changed,
  ct.reason,
  ct.created_at as credit_granted_at
FROM profiles p
LEFT JOIN credit_transactions ct ON p.id = ct.user_id AND ct.reason = 'welcome_bonus'
ORDER BY ct.created_at DESC NULLS LAST
LIMIT 10;

-- 4. CHECK FOR USERS WITHOUT WELCOME CREDITS
-- Find users who might need manual credit addition
SELECT 
  p.id,
  p.email,
  p.credits,
  COUNT(ct.id) as welcome_transactions
FROM profiles p
LEFT JOIN credit_transactions ct ON p.id = ct.user_id AND ct.reason = 'welcome_bonus'
GROUP BY p.id, p.email, p.credits
HAVING COUNT(ct.id) = 0;

-- 5. MANUALLY ADD CREDITS TO EXISTING USERS (OPTIONAL)
-- Uncomment and run this if you want to give existing users welcome credits
/*
-- Add welcome bonus transactions for users who don't have them
INSERT INTO credit_transactions (user_id, amount_changed, reason)
SELECT 
  p.id,
  50,
  'welcome_bonus_retroactive'
FROM profiles p
LEFT JOIN credit_transactions ct ON p.id = ct.user_id AND ct.reason LIKE 'welcome_bonus%'
WHERE ct.id IS NULL;

-- Update their credit balances
UPDATE profiles 
SET credits = credits + 50
WHERE id IN (
  SELECT p.id
  FROM profiles p
  LEFT JOIN credit_transactions ct ON p.id = ct.user_id AND ct.reason LIKE 'welcome_bonus%'
  WHERE ct.id IS NULL
);
*/
