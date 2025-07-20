"use client"

import { useEffect, useState } from "react"
import { getUserVideos, subscribeToUserVideos } from "@/lib/media/videos"
import type { Video } from "@/lib/api/api"
import { createClient } from "@/lib/database/supabase/client"
import toast from "react-hot-toast"

export function useVideoSubscription(userId: string | undefined, initialVideos?: Video[]) {
  const [videos, setVideos] = useState<Video[]>(initialVideos || [])
  const [loading, setLoading] = useState(!initialVideos)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    let cleanup: (() => void) | null = null

    // Initial fetch using direct Supabase connection
    const fetchVideos = async () => {
      try {
        const videosData = await getUserVideos()
        setVideos(videosData)
      } catch (error) {
        console.error("Failed to fetch videos:", error)
        toast.error("Failed to load videos")
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if no initial data provided
    if (!initialVideos) {
      fetchVideos()
    }

    // Set up real-time subscription using the videos library
    cleanup = subscribeToUserVideos(userId, (payload) => {
      handleVideoUpdate(payload)
    })

    return () => {
      if (cleanup) cleanup()
    }
  }, [userId, supabase])

  const handleVideoUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    setVideos((prev) => {
      switch (eventType) {
        case "INSERT":
          return [...prev, newRecord]
        case "UPDATE":
          return prev.map((video) => (video.id === newRecord.id ? newRecord : video))
        case "DELETE":
          return prev.filter((video) => video.id !== oldRecord.id)
        default:
          return prev
      }
    })

    // Show status notifications
    if (eventType === "UPDATE" && newRecord.status) {
      const statusMessages = {
        processing: "Video is being transcribed...",
        ready: "Transcription complete! Ready for editing.",
        burning_in: "Burning captions into video...",
        complete: "Video processing complete!",
        failed: "Video processing failed. Please try again.",
      }

      const message = statusMessages[newRecord.status as keyof typeof statusMessages]
      if (message) {
        if (newRecord.status === "failed") {
          toast.error(message)
        } else {
          toast.success(message)
        }
      }
    }
  }

  return { videos, loading, setVideos }
}
