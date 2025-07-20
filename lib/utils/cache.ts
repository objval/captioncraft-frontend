import { cache } from 'react'
import { createClient } from '@/lib/database/supabase/server'
import type { User } from '@supabase/supabase-js'
import type { Video, Profile } from '@/lib/api/api'

/**
 * Cache user data fetching to prevent duplicate requests
 * This function will dedupe requests across a single render
 */
export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
})

/**
 * Cache user profile data fetching
 */
export const getUserProfile = cache(async (userId: string): Promise<Profile | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data as Profile
})

/**
 * Cache user videos fetching
 */
export const getUserVideos = cache(async (userId: string): Promise<Video[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error || !data) {
    return []
  }
  
  return data as Video[]
})

/**
 * Cache user credit balance fetching
 */
export const getUserCredits = cache(async (userId: string): Promise<number> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()
  
  if (error || !data) {
    return 0
  }
  
  return data.credits || 0
})

/**
 * Cache credit packs fetching
 */
export const getCreditPacks = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('credit_packs')
    .select('*')
    .order('credits_amount', { ascending: true })
  
  if (error || !data) {
    return []
  }
  
  return data
})

/**
 * Cache recent transactions fetching
 */
export const getRecentTransactions = cache(async (userId: string, limit: number = 10) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error || !data) {
    return []
  }
  
  return data
})

/**
 * Cache system stats for admin dashboard
 */
export const getSystemStats = cache(async () => {
  const supabase = await createClient()
  
  // Fetch all stats in parallel
  const [
    { count: totalUsers },
    { count: bannedUsers },
    { count: totalVideos },
    { data: creditData },
    { count: totalTranscripts }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true),
    supabase.from('videos').select('*', { count: 'exact', head: true }),
    supabase.from('credit_transactions').select('amount_changed'),
    supabase.from('transcripts').select('*', { count: 'exact', head: true })
  ])
  
  const totalCredits = creditData?.reduce((sum, t) => sum + (t.amount_changed || 0), 0) || 0
  
  return {
    totalUsers: totalUsers || 0,
    bannedUsers: bannedUsers || 0,
    totalVideos: totalVideos || 0,
    totalCredits: Math.abs(totalCredits),
    totalTranscripts: totalTranscripts || 0
  }
})