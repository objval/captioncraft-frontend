"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { api, type Video } from "@/lib/api"
import toast from "react-hot-toast"

export function useVideoSubscription(userId: string | undefined) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    // Initial fetch
    const fetchVideos = async () => {
      try {
        const videosData = await api.getVideos()
        setVideos(videosData)
      } catch (error) {
        console.error("Failed to fetch videos:", error)
        toast.error("Failed to load videos")
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()

    // Realtime subscription
    const channel = supabase
      .channel("videos")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "videos",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          handleVideoUpdate(payload)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
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
