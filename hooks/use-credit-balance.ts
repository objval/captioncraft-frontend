"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/database/supabase/client"

export function useCreditBalance(userId: string | undefined, initialCredits?: number) {
  const [credits, setCredits] = useState(initialCredits ?? 0)
  const [loading, setLoading] = useState(!initialCredits)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    let cleanup: (() => void) | null = null

    // Initial fetch from Supabase
    const fetchCredits = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("credits")
          .eq("id", userId)
          .single()

        if (fetchError) {
          console.error("Error fetching credits:", fetchError)
          setError("Failed to fetch credits")
          // Set default value on error
          setCredits(0)
        } else {
          setCredits(data?.credits || 0)
        }
      } catch (err) {
        console.error("Credits fetch error:", err)
        setError("Failed to fetch credits")
        setCredits(0)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if no initial data provided
    if (initialCredits === undefined) {
      fetchCredits()
    }

    // Set up real-time subscription for credit updates
    const channel = supabase
      .channel(`credits-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log("Credits updated via real-time:", payload)
          if (payload.new && typeof payload.new === 'object' && 'credits' in payload.new) {
            const newCredits = Number(payload.new.credits) || 0
            const oldCredits = payload.old && typeof payload.old === 'object' && 'credits' in payload.old 
              ? Number(payload.old.credits) : credits
            console.log(`Real-time update: Credits changed from ${oldCredits} to ${newCredits} (diff: ${newCredits - oldCredits})`)
            setCredits(newCredits)
          }
        }
      )
      .subscribe((status) => {
        console.log("Credit subscription status:", status)
        if (status === "SUBSCRIPTION_ERROR") {
          console.error("Failed to subscribe to credit updates")
        }
      })

    cleanup = () => {
      supabase.removeChannel(channel)
    }

    return cleanup
  }, [userId, initialCredits])

  const refreshCredits = async () => {
    if (!userId) return

    const supabase = createClient()
    try {
      setError(null)
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", userId)
        .single()

      if (fetchError) {
        console.error("Error refreshing credits:", fetchError)
        setError("Failed to refresh credits")
      } else {
        setCredits(data?.credits || 0)
      }
    } catch (err) {
      console.error("Credits refresh error:", err)
      setError("Failed to refresh credits")
    }
  }

  return { 
    credits, 
    loading, 
    error,
    refreshCredits 
  }
}
