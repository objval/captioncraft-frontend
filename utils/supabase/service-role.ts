import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with service role key
 * This bypasses RLS policies and should only be used for:
 * - Payment callbacks from external services
 * - Admin operations
 * - System-level operations that don't have user context
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for service role operations')
  }
  
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}