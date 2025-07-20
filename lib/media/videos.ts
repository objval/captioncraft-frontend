import { createClient } from "@/lib/database/supabase/client"
import type { Video, VideoStatus, TranscriptData } from "@/lib/api/api"

const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dl32shhkk/video/upload"

interface VideoRecord {
  id: string
  user_id: string
  title: string
  status: VideoStatus
  original_video_cloudinary_id?: string
  final_video_cloudinary_id?: string
  thumbnail_url?: string
  created_at: string
  active_transcript_type: string
  job_error_message?: string
  caption_style?: any
  transcripts?: TranscriptRecord[]
}

interface TranscriptRecord {
  id: string
  video_id: string
  transcript_data: TranscriptData
  edited_transcript_data?: TranscriptData
  updated_at: string
}

/**
 * Transform a database video record into the frontend Video interface
 */
function transformVideoRecord(video: VideoRecord): Video {
  return {
    ...video,
    original_video_url: video.original_video_cloudinary_id
      ? `${CLOUDINARY_BASE_URL}/${video.original_video_cloudinary_id}`
      : undefined,
    final_video_url: video.final_video_cloudinary_id
      ? `${CLOUDINARY_BASE_URL}/${video.final_video_cloudinary_id}`
      : undefined,
    burned_video_url: video.final_video_cloudinary_id
      ? `${CLOUDINARY_BASE_URL}/${video.final_video_cloudinary_id}`
      : undefined,
    // Include transcript data from the active transcript
    transcript_data: video.transcripts?.[0]?.transcript_data || undefined,
    transcripts: video.transcripts?.map(transcript => ({
      ...transcript,
      transcript_data: transcript.transcript_data || {} as TranscriptData,
    })) || []
  }
}

/**
 * Get all videos for the current user
 */
export async function getUserVideos(): Promise<Video[]> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("videos")
    .select(`
      *,
      transcripts(*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user videos:", error)
    throw new Error(`Failed to fetch videos: ${error.message}`)
  }

  return (data || []).map(transformVideoRecord)
}

/**
 * Get a specific video by ID for the current user
 */
export async function getUserVideo(videoId: string): Promise<Video> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("videos")
    .select(`
      *,
      transcripts(*)
    `)
    .eq("id", videoId)
    .eq("user_id", user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error("Video not found")
    }
    console.error("Error fetching video:", error)
    throw new Error(`Failed to fetch video: ${error.message}`)
  }

  return transformVideoRecord(data)
}

/**
 * Update video transcript data
 */
export async function updateVideoTranscript(
  videoId: string, 
  transcriptData: TranscriptData
): Promise<Video> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  // First, check if the video belongs to the current user
  const { data: video, error: videoError } = await supabase
    .from("videos")
    .select("id, user_id")
    .eq("id", videoId)
    .eq("user_id", user.id)
    .single()

  if (videoError || !video) {
    throw new Error("Video not found or access denied")
  }

  // Update the transcript in the transcripts table
  const { error: transcriptError } = await supabase
    .from("transcripts")
    .update({ 
      transcript_data: transcriptData,
      updated_at: new Date().toISOString()
    })
    .eq("video_id", videoId)

  if (transcriptError) {
    console.error("Error updating transcript:", transcriptError)
    throw new Error(`Failed to update transcript: ${transcriptError.message}`)
  }

  // Return the updated video
  return getUserVideo(videoId)
}

/**
 * Get video statistics for the current user
 */
export async function getUserVideoStats(): Promise<{
  totalVideos: number
  completedVideos: number
  processingVideos: number
  failedVideos: number
}> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("videos")
    .select("status")
    .eq("user_id", user.id)

  if (error) {
    console.error("Error fetching video stats:", error)
    throw new Error(`Failed to fetch video statistics: ${error.message}`)
  }

  const stats = {
    totalVideos: data.length,
    completedVideos: 0,
    processingVideos: 0,
    failedVideos: 0
  }

  data.forEach(video => {
    switch (video.status) {
      case 'complete':
        stats.completedVideos++
        break
      case 'uploading':
      case 'processing':
      case 'burning_in':
        stats.processingVideos++
        break
      case 'failed':
        stats.failedVideos++
        break
    }
  })

  return stats
}

/**
 * Delete a video (only if it belongs to the current user)
 */
export async function deleteUserVideo(videoId: string): Promise<void> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  // Delete the video (this will cascade to transcripts due to foreign key)
  const { error } = await supabase
    .from("videos")
    .delete()
    .eq("id", videoId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error deleting video:", error)
    throw new Error(`Failed to delete video: ${error.message}`)
  }
}

/**
 * Subscribe to real-time video updates for the current user
 */
export function subscribeToUserVideos(
  userId: string,
  onUpdate: (payload: any) => void
) {
  const supabase = createClient()
  
  const channel = supabase
    .channel(`videos:user_id=eq.${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "videos",
        filter: `user_id=eq.${userId}`,
      },
      onUpdate
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
