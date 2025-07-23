import { createClient } from "@/lib/database/supabase/client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://nesontheshet.com/v1"
const YOUR_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dl32shhkk"
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
        ...(options.body && !(options.body instanceof FormData) && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      console.error("API Error Details:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url: `${API_BASE_URL}${endpoint}`
      })
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
        ? `https://res.cloudinary.com/${YOUR_CLOUD_NAME}/video/upload/${video.original_video_cloudinary_id}`
        : null,
      final_video_url: video.final_video_cloudinary_id
        ? `https://res.cloudinary.com/${YOUR_CLOUD_NAME}/video/upload/${video.final_video_cloudinary_id}`
        : null,
      burned_video_url: video.final_video_cloudinary_id
        ? `https://res.cloudinary.com/${YOUR_CLOUD_NAME}/video/upload/${video.final_video_cloudinary_id}`
        : null,
      cut_original_url: video.cut_original_cloudinary_id
        ? `https://res.cloudinary.com/${YOUR_CLOUD_NAME}/video/upload/${video.cut_original_cloudinary_id}`
        : null,
      cut_burned_url: video.cut_burned_cloudinary_id
        ? `https://res.cloudinary.com/${YOUR_CLOUD_NAME}/video/upload/${video.cut_burned_cloudinary_id}`
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
        ? `https://res.cloudinary.com/${YOUR_CLOUD_NAME}/video/upload/${data.original_video_cloudinary_id}`
        : null,
      final_video_url: data.final_video_cloudinary_id
        ? `https://res.cloudinary.com/${YOUR_CLOUD_NAME}/video/upload/${data.final_video_cloudinary_id}`
        : null,
      burned_video_url: data.final_video_cloudinary_id
        ? `https://res.cloudinary.com/${YOUR_CLOUD_NAME}/video/upload/${data.final_video_cloudinary_id}`
        : null,
      cut_original_url: data.cut_original_cloudinary_id
        ? `https://res.cloudinary.com/${YOUR_CLOUD_NAME}/video/upload/${data.cut_original_cloudinary_id}`
        : null,
      cut_burned_url: data.cut_burned_cloudinary_id
        ? `https://res.cloudinary.com/${YOUR_CLOUD_NAME}/video/upload/${data.cut_burned_cloudinary_id}`
        : null,
    }
  },

  async updateVideoTranscript(videoId: string, transcriptData: any) {
    const supabase = createClient()
    
    // Check if transcript exists
    const { data: existingTranscript } = await supabase
      .from("transcripts")
      .select("id")
      .eq("video_id", videoId)
      .single()
    
    if (existingTranscript) {
      // Update existing transcript
      const { data, error } = await supabase
        .from("transcripts")
        .update({ 
          transcript_data: transcriptData,
          edited_transcript_data: transcriptData,
          updated_at: new Date().toISOString()
        })
        .eq("video_id", videoId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      // Create new transcript
      const { data, error } = await supabase
        .from("transcripts")
        .insert({ 
          video_id: videoId,
          transcript_data: transcriptData,
          edited_transcript_data: transcriptData
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    }
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

  deleteVideo: async (id: string) => {
    try {
      return await apiCall(`/videos/${id}`, { method: "DELETE" })
    } catch (error) {
      console.log("Using Supabase fallback for deleteVideo")
      const supabase = createClient()
      
      // Delete related records first (due to foreign key constraints)
      // Delete transcripts
      await supabase
        .from("transcripts")
        .delete()
        .eq("video_id", id)
      
      // Delete the video
      const { error: deleteError } = await supabase
        .from("videos")
        .delete()
        .eq("id", id)
      
      if (deleteError) throw deleteError
      
      return { success: true, message: "Video deleted successfully" }
    }
  },

  // Bulk delete videos - uses the new bulk endpoint
  deleteVideos: async (videoIds: string[]) => {
    try {
      return await apiCall<{
        deleted: number
        failed: number
        errors: { videoId: string; error: string }[]
      }>("/videos", { 
        method: "DELETE",
        body: JSON.stringify({ videoIds })
      })
    } catch (error: any) {
      // Check if it's a 404 - bulk endpoint might not be deployed yet
      if (error.status === 404 || error.message?.includes('Cannot DELETE')) {
        console.log("Bulk delete endpoint not available, falling back to individual deletes")
        
        // Fall back to individual deletes
        let deleted = 0
        let failed = 0
        const errors: { videoId: string; error: string }[] = []
        
        for (const videoId of videoIds) {
          try {
            await api.deleteVideo(videoId)
            deleted++
          } catch (err: any) {
            failed++
            errors.push({ 
              videoId, 
              error: err.message || "Failed to delete video" 
            })
          }
        }
        
        return { deleted, failed, errors }
      }
      
      // For other errors, use Supabase fallback
      console.log("Using Supabase fallback for bulk deleteVideos")
      const supabase = createClient()
      
      let deleted = 0
      let failed = 0
      const errors: { videoId: string; error: string }[] = []
      
      // Process deletions in batches to avoid overwhelming the database
      for (const videoId of videoIds) {
        try {
          // Delete transcripts first
          await supabase
            .from("transcripts")
            .delete()
            .eq("video_id", videoId)
          
          // Delete the video
          const { error: deleteError } = await supabase
            .from("videos")
            .delete()
            .eq("id", videoId)
          
          if (deleteError) throw deleteError
          deleted++
        } catch (err: any) {
          failed++
          errors.push({ 
            videoId, 
            error: err.message || "Failed to delete video" 
          })
        }
      }
      
      return { deleted, failed, errors }
    }
  },
  retryVideo: (id: string) => apiCall(`/videos/${id}/retry`, { method: "POST" }),
  burnInVideo: (id: string) => apiCall(`/videos/${id}/burn-in`, { method: "POST" }),

  // Video cutting endpoints
  analyzeSilence: (id: string, config?: Partial<CuttingConfig>) => 
    apiCall<SilenceAnalysisResult>(`/videos/${id}/analyze-silence`, {
      method: "POST",
      body: config ? JSON.stringify({ config }) : JSON.stringify({}),
    }),

  cutVideo: (id: string, options: {
    sourceType: 'original' | 'burned'
    mode: 'automatic' | 'manual'
    config?: Partial<CuttingConfig>
    manualSegments?: CutSegment[]
  }) => apiCall(`/videos/${id}/cut`, {
    method: "POST",
    body: JSON.stringify(options),
  }),

  getVideoCuts: (id: string) => 
    apiCall<{ cuts: VideoCut[], message: string }>(`/videos/${id}/cuts`),

  deleteVideoCut: (videoId: string, cutId: string) => 
    apiCall(`/videos/${videoId}/cuts/${cutId}`, { method: "DELETE" }),

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

  // Credits - fallback to Supabase since external API is not available
  getCredits: async () => {
    try {
      return await apiCall("/credits/me")
    } catch (error) {
      console.log("Using Supabase fallback for credits")
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { credits: 0 }
      }

      const { data, error: creditsError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single()

      if (creditsError) {
        console.error("Error fetching credits from Supabase:", creditsError)
        return { credits: 0 }
      }

      return { credits: data?.credits || 0 }
    }
  },

  getCreditPacks: async () => {
    try {
      return await apiCall("/credits/packs")
    } catch (error) {
      console.log("Using Supabase fallback for credit packs")
      const supabase = createClient()
      const { data, error: packsError } = await supabase
        .from("credit_packs")
        .select("*")
        .order("credits_amount", { ascending: true })

      if (packsError) {
        console.error("Supabase error:", packsError)
        throw packsError
      }
      
      console.log("Credit packs from Supabase:", data)
      return data || []
    }
  },
  
  // Payments - Hypay integration
  

  // Profile management
  getProfile: async (): Promise<UserProfile> => {
    try {
      return await apiCall("/profile/me")
    } catch (error) {
      console.log("Using Supabase fallback for profile")
      const supabase = createClient()
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .single()

      if (profileError) throw profileError
      return data
    }
  },

  updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      return await apiCall("/profile/me", {
        method: "PATCH",
        body: JSON.stringify(profileData),
      })
    } catch (error) {
      console.log("Using Supabase fallback for profile update")
      const supabase = createClient()
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update(profileData)
        .select("*")
        .single()

      if (updateError) throw updateError
      return data
    }
  },

  // Payment history
  getPayments: async (): Promise<Payment[]> => {
    try {
      return await apiCall("/payments")
    } catch (error) {
      console.log("Using Supabase fallback for payments")
      const supabase = createClient()
      const { data, error: paymentsError } = await supabase
        .from("payments")
        .select(`
          *,
          credit_packs(name, credits_amount),
          invoices(invoice_number, invoice_url, status)
        `)
        .order("created_at", { ascending: false })

      if (paymentsError) throw paymentsError
      return data || []
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
  // Cutting fields
  cutting_config?: CuttingConfig
  cut_segments?: CutSegment[]
  original_duration?: number
  cut_duration?: number
  cut_original_cloudinary_id?: string
  cut_burned_cloudinary_id?: string
  cut_original_url?: string
  cut_burned_url?: string
  has_cut_original?: boolean
  has_cut_burned?: boolean
}

// Cutting related interfaces
export interface CuttingConfig {
  silenceThreshold: number
  offsetBefore: number
  offsetAfter: number
  minSegmentLength: number
}

export interface CutSegment {
  start: number
  end: number
  duration: number
  words: number
  reason: string
}

export interface SilenceGap {
  start: number
  end: number
  duration: number
}

export interface SilenceAnalysisResult {
  silenceGaps: SilenceGap[]
  cutSegments: CutSegment[]
  summary: {
    originalDuration: number
    cutDuration: number
    removedDuration: number
    removedPercentage: number
    segmentCount: number
  }
}

export interface VideoCut {
  id: string
  originalVideoId: string
  sourceType: 'original' | 'burned'
  cutCloudinaryId: string
  cutSegments: CutSegment[]
  cuttingConfig: CuttingConfig
  originalDuration: number
  cutDuration: number
  removedDuration: number
  removedPercentage: number
  createdAt: string
  cutVideoUrl?: string
}

export interface CreditPack {
  id: string
  name: string
  credits_amount: number
  price_nis: number
}



export interface UserProfile {
  id: string
  email: string
  credits: number
  first_name?: string
  last_name?: string
  phone_number?: string
  street?: string
  city?: string
  zip_code?: string
}

export interface Payment {
  id: string
  user_id: string
  credit_pack_id: string
  amount: number
  status: "pending" | "succeeded" | "failed"
  hypay_transaction_id?: string
  provider_response?: any
  created_at: string
  updated_at: string
  credit_packs?: {
    name: string
    credits_amount: number
  }
  invoices?: Array<{
    invoice_number?: string
    invoice_url?: string
    status?: string
  }>
}
