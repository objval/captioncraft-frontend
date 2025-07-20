// DEPRECATED: Use @/utils/supabase/client instead
// This file is kept for backward compatibility
import { createClient as createNewClient } from '@/lib/database/supabase/client'

/**
 * @deprecated Use createClient from @/utils/supabase/client instead
 */
export function createClient() {
  console.warn('DEPRECATED: lib/supabase.ts is deprecated. Use @/utils/supabase/client instead')
  return createNewClient()
}
