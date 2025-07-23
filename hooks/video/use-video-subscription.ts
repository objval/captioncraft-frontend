"use client"

import { useEffect, useState, useCallback } from "react"
import { getUserVideos, subscribeToUserVideos } from "@/lib/media/videos"
import type { Video } from "@/lib/api/api"
import toast from "@/lib/utils/toast"

const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dl32shhkk/video/upload"

export function useVideoSubscription(userId: string | undefined, initialVideos?: Video[]) {
  const [videos, setVideos] = useState<Video[]>(initialVideos || [])
  // Only show loading if we don't have initial data and need to fetch
  const [loading, setLoading] = useState(!initialVideos && !!userId)
  const [subscriptionKey, setSubscriptionKey] = useState(0) // Force re-subscription

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
    if (initialVideos === undefined) {
      fetchVideos()
    } else {
      // If we have initial data, ensure loading is false
      setLoading(false)
    }

    // Only set up real-time subscriptions on the client side
    let timeoutId: NodeJS.Timeout | undefined
    
    if (typeof window !== 'undefined') {
      // Delay subscription setup to ensure client hydration
      timeoutId = setTimeout(() => {
        try {
          // Set up real-time subscription using the videos library
          cleanup = subscribeToUserVideos(userId, (payload) => {
            handleVideoUpdate(payload)
          })
        } catch (error) {
          console.error("Failed to set up video subscription:", error)
          toast.error("Failed to connect to real-time updates")
        }
      }, 100)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (cleanup) cleanup()
    }
  }, [userId, subscriptionKey]) // Re-run when subscriptionKey changes

  const transformVideoRecord = (record: any): Video => {
    return {
      ...record,
      original_video_url: record.original_video_cloudinary_id
        ? `${CLOUDINARY_BASE_URL}/${record.original_video_cloudinary_id}`
        : undefined,
      final_video_url: record.final_video_cloudinary_id
        ? `${CLOUDINARY_BASE_URL}/${record.final_video_cloudinary_id}`
        : undefined,
      burned_video_url: record.final_video_cloudinary_id
        ? `${CLOUDINARY_BASE_URL}/${record.final_video_cloudinary_id}`
        : undefined,
    }
  }

  const handleVideoUpdate = (payload: any) => {
    console.log("Video update received:", payload)
    const { eventType, new: newRecord, old: oldRecord } = payload

    if (!eventType) {
      console.warn("Received update without eventType:", payload)
      return
    }

    setVideos((prev) => {
      switch (eventType) {
        case "INSERT":
          if (!newRecord || !newRecord.id) {
            console.warn("INSERT event without valid new record:", payload)
            return prev
          }
          return [...prev, transformVideoRecord(newRecord)]
        case "UPDATE":
          if (!newRecord || !newRecord.id) {
            console.warn("UPDATE event without valid new record:", payload)
            return prev
          }
          return prev.map((video) => (video.id === newRecord.id ? transformVideoRecord(newRecord) : video))
        case "DELETE":
          if (!oldRecord || !oldRecord.id) {
            console.warn("DELETE event without valid old record:", payload)
            return prev
          }
          return prev.filter((video) => video.id !== oldRecord.id)
        default:
          console.warn("Unknown event type:", eventType)
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

  // Function to force refresh subscription and fetch latest videos
  const refreshSubscription = useCallback(async () => {
    console.log("Refreshing video subscription...")
    
    // Fetch latest videos immediately
    try {
      const videosData = await getUserVideos()
      setVideos(videosData)
    } catch (error) {
      console.error("Failed to refresh videos:", error)
    }
    
    // Force subscription to reconnect
    setSubscriptionKey(prev => prev + 1)
  }, [])

  return { videos, loading, setVideos, refreshSubscription }
}
