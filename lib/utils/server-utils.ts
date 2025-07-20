import { createClient } from '@/lib/database/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Get authenticated user on server-side
 * Redirects to login if not authenticated
 */
export async function getServerAuthenticatedUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return data.user
}

/**
 * Get user profile from server-side
 */
export async function getServerUserProfile(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

/**
 * Get user videos from server-side
 */
export async function getServerUserVideos(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      transcripts(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching videos:', error)
    return []
  }

  return data || []
}

/**
 * Get user credit balance from server-side
 */
export async function getServerUserCredits(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching credits:', error)
    return 0
  }

  return data?.credits || 0
}

/**
 * Get user transactions from server-side
 */
export async function getServerUserTransactions(userId: string, limit: number = 10) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data || []
}

/**
 * Get video by ID with user validation
 */
export async function getServerUserVideo(videoId: string, userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      transcripts(*)
    `)
    .eq('id', videoId)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching video:', error)
    return null
  }

  return data
}

/**
 * Check if user is admin (server-side)
 */
export async function isServerUserAdmin(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }

  return data?.is_admin || false
}

/**
 * Require admin access (server-side)
 */
export async function requireServerAdmin() {
  const user = await getServerAuthenticatedUser()
  const isAdmin = await isServerUserAdmin(user.id)
  
  if (!isAdmin) {
    redirect('/dashboard')
  }
  
  return user
}
