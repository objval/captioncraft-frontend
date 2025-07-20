import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Video } from '@/lib/api'
import toast from 'react-hot-toast'

export function useVideoSubscription(
  videoId: string,
  onVideoUpdate: (video: Video) => void,
  onStatusChange: (status: string, finalVideoUrl: string | null) => void
) {
  useEffect(() => {
    if (!videoId) return

    const supabase = createClient()
    
    const channel = supabase
      .channel(`video-${videoId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "videos",
          filter: `id=eq.${videoId}`,
        },
        (payload: any) => {
          const updatedVideo = payload.new as Video
          console.log("Video updated:", updatedVideo)
          
          // Construct final_video_url if we have the cloudinary ID but not the URL
          const finalVideoUrl = updatedVideo.final_video_url || 
            (updatedVideo.final_video_cloudinary_id 
              ? `https://res.cloudinary.com/dl32shhkk/video/upload/${updatedVideo.final_video_cloudinary_id}`
              : null)

          onVideoUpdate({
            ...updatedVideo,
            final_video_url: finalVideoUrl
          })

          // Handle status changes
          if (updatedVideo.status === "complete" && (updatedVideo.final_video_cloudinary_id || updatedVideo.final_video_url)) {
            onStatusChange("complete", finalVideoUrl)
            toast.success("Video processing complete! Showing final video with burned-in captions.")
          } else if (updatedVideo.status === "burning_in") {
            toast.success("Burning captions into video...")
          } else if (updatedVideo.status === "failed") {
            toast.error("Video processing failed. Please try again.")
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [videoId, onVideoUpdate, onStatusChange])
}