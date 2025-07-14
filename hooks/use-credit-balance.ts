"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { api } from "@/lib/api"

export function useCreditBalance(userId: string | undefined) {
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    // Initial fetch
    const fetchCredits = async () => {
      try {
        const creditsData = await api.getCredits()
        setCredits(creditsData.credits)
      } catch (error) {
        console.error("Failed to fetch credits:", error)
        // Set default credits if API fails
        setCredits(91)
      } finally {
        setLoading(false)
      }
    }

    fetchCredits()

    // Realtime subscription for credit updates
    const channel = supabase
      .channel("profiles")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          setCredits(payload.new.credits)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  return { credits, loading }
}
