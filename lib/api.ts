import { createClient } from "@/lib/supabase"

const API_BASE_URL = "https://209f6fdb720c.ngrok-free.app:3000/v1"

// Helper function to make authenticated API calls with Supabase fallback
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(options.headers && !(options.body instanceof FormData) && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      const error = new Error(errorData.message || `API Error: ${response.status}`)
      ;(error as any).status = response.status
      ;(error as any).data = errorData
      throw error
    }

    return response.json()
  } catch (error) {
    console.warn(`External API failed for ${endpoint}, attempting Supabase fallback:`, error)
    throw error
  }
}

// Supabase fallback functions
const supabaseFallback = {
  async getVideos() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("videos")
      .select(`
        *,
        transcripts(*)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data.map((video) => ({
      ...video,
      original_video_url: video.original_video_cloudinary_id
        ? `https://res.cloudinary.com/your-cloud/video/upload/${video.original_video_cloudinary_id}`
        : null,
      final_video_url: video.final_video_cloudinary_id
        ? `https://res.cloudinary.com/your-cloud/video/upload/${video.final_video_cloudinary_id}`
        : null,
      burned_video_url: video.final_video_cloudinary_id
        ? `https://res.cloudinary.com/your-cloud/video/upload/${video.final_video_cloudinary_id}`
        : null,
    }))
  },

  async getVideo(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("videos")
      .select(`
        *,
        transcripts(*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    return {
      ...data,
      original_video_url: data.original_video_cloudinary_id
        ? `https://res.cloudinary.com/your-cloud/video/upload/${data.original_video_cloudinary_id}`
        : null,
      final_video_url: data.final_video_cloudinary_id
        ? `https://res.cloudinary.com/your-cloud/video/upload/${data.final_video_cloudinary_id}`
        : null,
      burned_video_url: data.final_video_cloudinary_id
        ? `https://res.cloudinary.com/your-cloud/video/upload/${data.final_video_cloudinary_id}`
        : null,
    }
  },

  async updateVideoTranscript(videoId: string, transcriptData: any) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("videos")
      .update({ transcript_data: transcriptData })
      .eq("id", videoId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// API functions with fallbacks
export const api = {
  // Videos (includes transcript data)
  getVideos: async () => {
    try {
      return await apiCall("/videos")
    } catch (error) {
      console.log("Using Supabase fallback for getVideos")
      return await supabaseFallback.getVideos()
    }
  },

  getVideo: async (id: string) => {
    try {
      return await apiCall(`/videos/${id}`)
    } catch (error) {
      console.log("Using Supabase fallback for getVideo")
      return await supabaseFallback.getVideo(id)
    }
  },

  uploadVideo: async (formData: FormData) => {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token

    if (!token) {
      throw new Error("No authentication token found")
    }

    try {
      const response = await fetch(`${API_BASE_URL}/videos/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let browser handle multipart/form-data boundary
        },
        credentials: "include",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Upload failed: ${response.status} ${response.statusText}`,
        }))
        const error = new Error(errorData.message || `Upload failed: ${response.status}`)
        ;(error as any).status = response.status
        ;(error as any).data = errorData
        throw error
      }

      return response.json()
    } catch (error: any) {
      // Enhanced error handling for specific cases
      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        throw new Error("Network error - please check your connection and try again")
      }
      throw error
    }
  },

  deleteVideo: (id: string) => apiCall(`/videos/${id}`, { method: "DELETE" }),
  retryVideo: (id: string) => apiCall(`/videos/${id}/retry`, { method: "POST" }),
  burnInVideo: (id: string) => apiCall(`/videos/${id}/burn-in`, { method: "POST" }),

  // New transcript endpoint - PATCH /videos/:id/transcript
  updateVideoTranscript: async (videoId: string, transcriptData: any) => {
    try {
      return await apiCall(`/videos/${videoId}/transcript`, {
        method: "PATCH",
        body: JSON.stringify({ transcript_data: transcriptData }),
      })
    } catch (error) {
      console.log("Using Supabase fallback for updateVideoTranscript")
      return await supabaseFallback.updateVideoTranscript(videoId, transcriptData)
    }
  },

  // Credits - mock data for now since external API is not available
  getCredits: async () => {
    try {
      return await apiCall("/credits/me")
    } catch (error) {
      console.log("Using mock data for credits")
      return { credits: 91 }
    }
  },

  getCreditPacks: async () => {
    try {
      return await apiCall("/credits/packs")
    } catch (error) {
      console.log("Using mock data for credit packs")
      return [
        { id: "1", name: "Starter Pack", credits_amount: 5, price_usd: 9.99 },
        { id: "2", name: "Pro Pack", credits_amount: 10, price_usd: 19.99 },
        { id: "3", name: "Business Pack", credits_amount: 25, price_usd: 49.99 },
      ]
    }
  },
}

export type VideoStatus = "uploading" | "processing" | "ready" | "burning_in" | "complete" | "failed"

export interface TranscriptWord {
  word: string
  start: number
  end: number
}

export interface TranscriptSegment {
  id: number
  start: number
  end: number
  text: string
  tokens?: number[]
  avg_logprob?: number
  temperature?: number
  no_speech_prob?: number
  compression_ratio?: number
}

export interface TranscriptData {
  task: string
  text: string
  usage?: {
    type: string
    seconds: number
  }
  words: TranscriptWord[]
  segments: TranscriptSegment[]
  duration?: number
  language?: string
}

export interface Transcript {
  id: string
  video_id: string
  transcript_data: TranscriptData
  updated_at: string
}

export interface Video {
  id: string
  user_id: string
  title: string
  status: VideoStatus
  original_video_cloudinary_id?: string
  final_video_cloudinary_id?: string
  original_video_url?: string
  final_video_url?: string
  burned_video_url?: string
  thumbnail_url?: string
  transcript_data?: TranscriptData
  created_at: string
  transcripts?: Transcript[]
}

export interface CreditPack {
  id: string
  name: string
  credits_amount: number
  price_usd: number
}
