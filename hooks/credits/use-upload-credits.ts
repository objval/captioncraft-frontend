"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/lib/database/supabase/client"

interface UseUploadCreditsOptions {
  onCreditUpdate?: (newCredits: number) => void
  userId?: string
}

export function useUploadCredits({ onCreditUpdate, userId }: UseUploadCreditsOptions) {
  const channelRef = useRef<any>(null)
  const isSubscribedRef = useRef(false)

  const startListening = () => {
    if (!userId || isSubscribedRef.current) return

    const supabase = createClient()
    
    console.log("Starting credit update listener for uploads...")
    
    // Listen to profile updates during upload
    channelRef.current = supabase
      .channel(`upload-credits-${userId}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new && 'credits' in payload.new) {
            const newCredits = Number(payload.new.credits) || 0
            console.log(`Credit update during upload: ${newCredits}`)
            onCreditUpdate?.(newCredits)
          }
        }
      )
      .subscribe((status) => {
        console.log("Upload credit subscription status:", status)
        isSubscribedRef.current = status === 'SUBSCRIBED'
      })
  }

  const stopListening = () => {
    if (channelRef.current) {
      console.log("Stopping credit update listener...")
      const supabase = createClient()
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
      isSubscribedRef.current = false
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [])

  return { startListening, stopListening }
}