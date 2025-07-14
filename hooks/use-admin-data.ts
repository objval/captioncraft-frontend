"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"

interface Profile {
  id: string
  email: string
  credits: number
  // Fallback data since auth.users might not be accessible
  created_at: string
  updated_at: string
  full_name: string
  avatar_url?: string
}

interface VideoWithUser {
  id: string
  user_id: string
  title: string
  status: string
  created_at: string
  profiles?: {
    email: string
    full_name: string
  }
}

interface SystemStats {
  total_users: number
  total_videos: number
  total_transcripts: number
  videos_by_status: Record<string, number>
  credits_distributed: number
}

interface AdminData {
  profiles: Profile[]
  recentVideos: VideoWithUser[]
  systemStats: SystemStats
}

export function useAdminData() {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch user profiles (only available columns)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          credits
        `)
        .order('credits', { ascending: false })
        .limit(50)

      if (profilesError) {
        console.error('Profiles error:', profilesError)
        throw new Error(`Failed to fetch profiles: ${profilesError.message}`)
      }

      // Enrich profiles with fallback data
      const enrichedProfiles: Profile[] = profilesData?.map(profile => ({
        ...profile,
        full_name: profile.email?.split('@')[0] || 'User',
        created_at: new Date().toISOString(), // Fallback
        updated_at: new Date().toISOString(), // Fallback
        avatar_url: undefined
      })) || []

      // Fetch recent videos with user information
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select(`
          id,
          user_id,
          title,
          status,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (videosError) {
        console.error('Videos error:', videosError)
        throw new Error(`Failed to fetch videos: ${videosError.message}`)
      }

      // Enrich video data with user names from profiles
      const enrichedVideos: VideoWithUser[] = videosData?.map(video => {
        const userProfile = enrichedProfiles.find(p => p.id === video.user_id)
        const email = userProfile?.email || 'Unknown'
        
        return {
          ...video,
          profiles: {
            email,
            full_name: email.split('@')[0] || 'Unknown User'
          }
        }
      }) || []

      // Get system statistics with proper error handling
      const [
        { count: totalUsers, error: usersCountError },
        { count: totalVideos, error: videosCountError },
        { count: totalTranscripts, error: transcriptsCountError },
        { data: videosByStatus, error: statusError }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('videos').select('*', { count: 'exact', head: true }),
        supabase.from('transcripts').select('*', { count: 'exact', head: true }),
        supabase.from('videos').select('status')
      ])

      // Check for errors in statistics queries
      if (usersCountError) throw new Error(`Failed to count users: ${usersCountError.message}`)
      if (videosCountError) throw new Error(`Failed to count videos: ${videosCountError.message}`)
      if (transcriptsCountError) throw new Error(`Failed to count transcripts: ${transcriptsCountError.message}`)
      if (statusError) throw new Error(`Failed to fetch video statuses: ${statusError.message}`)

      // Calculate credits distributed
      const totalCredits = profilesData?.reduce((sum, profile) => sum + (profile.credits || 0), 0) || 0

      // Group videos by status
      const statusCounts = (videosByStatus || []).reduce((acc: Record<string, number>, video) => {
        acc[video.status] = (acc[video.status] || 0) + 1
        return acc
      }, {})

      const systemStats: SystemStats = {
        total_users: totalUsers || 0,
        total_videos: totalVideos || 0,
        total_transcripts: totalTranscripts || 0,
        videos_by_status: statusCounts,
        credits_distributed: totalCredits
      }

      setData({
        profiles: enrichedProfiles,
        recentVideos: enrichedVideos,
        systemStats
      })

    } catch (error: any) {
      console.error('Failed to load admin data:', error)
      setError(error.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchAdminData 
  }
}

// Simplified version that works with actual database structure
export function useAdminProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, credits')
          .order('credits', { ascending: false })
          .limit(50)

        if (error) throw error
        
        // Create display names from email
        const enrichedData: Profile[] = data?.map(profile => ({
          ...profile,
          full_name: profile.email?.split('@')[0] || 'User',
          created_at: new Date().toISOString(), // Fallback since we don't have created_at
          updated_at: new Date().toISOString(),
          avatar_url: undefined
        })) || []
        
        setProfiles(enrichedData)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  return { profiles, loading, error }
}

export function useAdminStats() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { count: totalUsers },
          { count: totalVideos },
          { count: totalTranscripts },
          { data: profilesData },
          { data: videosByStatus }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('videos').select('*', { count: 'exact', head: true }),
          supabase.from('transcripts').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('credits'),
          supabase.from('videos').select('status')
        ])

        const totalCredits = profilesData?.reduce((sum, profile) => sum + (profile.credits || 0), 0) || 0
        const statusCounts = (videosByStatus || []).reduce((acc: Record<string, number>, video) => {
          acc[video.status] = (acc[video.status] || 0) + 1
          return acc
        }, {})

        setStats({
          total_users: totalUsers || 0,
          total_videos: totalVideos || 0,
          total_transcripts: totalTranscripts || 0,
          videos_by_status: statusCounts,
          credits_distributed: totalCredits
        })
      } catch (error: any) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
} 