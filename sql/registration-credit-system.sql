-- =============================================================================
-- REGISTRATION CREDIT SYSTEM MANAGEMENT
-- =============================================================================
-- This file contains SQL commands to manage the automatic welcome credit system
-- Run these commands in Supabase SQL Editor
-- =============================================================================

-- =============================================================================
-- 1. BACKUP CURRENT SYSTEM (RUN FIRST TO SAVE CURRENT STATE)
-- =============================================================================

-- Check current trigger
SELECT 
  t.tgname as trigger_name,
  p.proname as function_name,
  pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'auth' 
  AND c.relname = 'users'
  AND NOT t.tgisinternal;

-- Check current function
SELECT pg_get_functiondef(oid) as current_function_definition
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- =============================================================================
-- 2. UPDATE EXISTING SYSTEM (RECOMMENDED APPROACH)
-- =============================================================================
-- Since the trigger already exists, we just need to update the function

-- Update the handle_new_user function to add 50 welcome credits
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
-- 3. ALTERNATIVE: COMPLETE RECREATION (IF UPDATE DOESN'T WORK)
-- =============================================================================

-- Step 3a: Drop existing trigger (ONLY if needed)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3b: Recreate trigger with updated function
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 4. VERIFICATION QUERIES
-- =============================================================================

-- Verify trigger exists and is active
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Verify function is updated
SELECT pg_get_functiondef(oid) as updated_function_definition
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Check recent user registrations and their credits
SELECT 
  p.id,
  p.email,
  p.credits,
  ct.amount_changed,
  ct.reason,
  ct.created_at as credit_transaction_time
FROM profiles p
LEFT JOIN credit_transactions ct ON p.id = ct.user_id AND ct.reason = 'welcome_bonus'
ORDER BY p.id DESC
LIMIT 10;

-- =============================================================================
-- 5. MANUAL CREDIT ADDITION (FALLBACK FOR EXISTING USERS)
-- =============================================================================
-- Add 50 credits to users who registered before the automatic system was active

-- First, check which users don't have welcome bonuses
SELECT 
  p.id,
  p.email,
  p.credits,
  COUNT(ct.id) as welcome_transactions
FROM profiles p
LEFT JOIN credit_transactions ct ON p.id = ct.user_id AND ct.reason = 'welcome_bonus'
GROUP BY p.id, p.email, p.credits
HAVING COUNT(ct.id) = 0;

-- Add welcome credits to users who don't have them (RUN CAREFULLY)
-- Uncomment and run this ONLY if you want to give existing users welcome credits
/*
INSERT INTO credit_transactions (user_id, amount_changed, reason)
SELECT 
  p.id,
  50,
  'welcome_bonus_retroactive'
FROM profiles p
LEFT JOIN credit_transactions ct ON p.id = ct.user_id AND ct.reason LIKE 'welcome_bonus%'
WHERE ct.id IS NULL;

UPDATE profiles 
SET credits = credits + 50
WHERE id IN (
  SELECT p.id
  FROM profiles p
  LEFT JOIN credit_transactions ct ON p.id = ct.user_id AND ct.reason LIKE 'welcome_bonus%'
  WHERE ct.id IS NULL
);
*/

-- =============================================================================
-- 6. SYSTEM MONITORING QUERIES
-- =============================================================================

-- Monitor new registrations and their automatic credits
SELECT 
  p.id,
  p.email,
  p.credits,
  ct.amount_changed,
  ct.created_at as credit_granted_at
FROM profiles p
JOIN credit_transactions ct ON p.id = ct.user_id 
WHERE ct.reason = 'welcome_bonus'
ORDER BY ct.created_at DESC
LIMIT 20;

-- Check for failed automatic credit assignments (recent users without welcome bonus)
SELECT 
  p.id,
  p.email,
  p.credits,
  COUNT(ct.id) as welcome_transactions
FROM profiles p
LEFT JOIN credit_transactions ct ON p.id = ct.user_id AND ct.reason = 'welcome_bonus'
GROUP BY p.id, p.email, p.credits
HAVING COUNT(ct.id) = 0;
