"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/database/supabase/client"

interface UseCreditBalanceOptions {
  // Initial value to avoid loading state
  initialCredits?: number
  // Enable polling as fallback (default: false)
  enablePolling?: boolean
  // Polling interval in ms (default: 5000)
  pollingInterval?: number
  // Enable debug logging (default: false)
  debug?: boolean
  // Subscribe to credit transactions for immediate updates (default: false)
  watchTransactions?: boolean
}

interface CreditBalanceReturn {
  credits: number
  loading: boolean
  error: string | null
  refreshCredits: () => Promise<void>
  // Only included when debug is true
  isConnected?: boolean
}

export function useCreditBalance(
  userId: string | undefined,
  options: UseCreditBalanceOptions = {}
): CreditBalanceReturn {
  const {
    initialCredits,
    enablePolling = false,
    pollingInterval = 5000,
    debug = false,
    watchTransactions = false
  } = options

  const [credits, setCredits] = useState(initialCredits ?? 0)
  const [loading, setLoading] = useState(!initialCredits)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  const pollingIntervalRef = useRef<NodeJS.Timeout>()
  const lastKnownCreditsRef = useRef<number>(initialCredits ?? 0)

  const log = useCallback((message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[CreditBalance] ${message}`, ...args)
    }
  }, [debug])

  const fetchCredits = useCallback(async (showLoading = true) => {
    if (!userId) return

    const supabase = createClient()
    try {
      if (showLoading) setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", userId)
        .single()

      if (fetchError) {
        console.error("Error fetching credits:", fetchError)
        setError("Failed to fetch credits")
        return
      }

      const newCredits = data?.credits || 0
      
      // Only update if credits changed
      if (newCredits !== lastKnownCreditsRef.current) {
        log(`Credits updated: ${lastKnownCreditsRef.current} -> ${newCredits}`)
        setCredits(newCredits)
        lastKnownCreditsRef.current = newCredits
      }
    } catch (err) {
      console.error("Credits fetch error:", err)
      setError("Failed to fetch credits")
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [userId, log])

  // Polling setup
  useEffect(() => {
    if (!userId || !enablePolling) return

    log(`Starting polling (interval: ${pollingInterval}ms)`)
    pollingIntervalRef.current = setInterval(() => {
      fetchCredits(false)
    }, pollingInterval)

    return () => {
      if (pollingIntervalRef.current) {
        log("Stopping polling")
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [userId, enablePolling, pollingInterval, fetchCredits, log])

  // Main effect for initial fetch and real-time subscription
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    const channels: any[] = []

    // Initial fetch
    if (initialCredits === undefined) {
      fetchCredits()
    } else {
      setLoading(false)
      lastKnownCreditsRef.current = initialCredits
    }

    // Only set up real-time subscriptions on the client side
    if (typeof window === 'undefined') {
      return
    }

    // Real-time subscription for profile updates
    log("Setting up real-time subscription")
    const profileChannel = supabase
      .channel(`profile-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          log("Profile updated:", payload)
          if (payload.new && 'credits' in payload.new) {
            const newCredits = Number(payload.new.credits) || 0
            const oldCredits = lastKnownCreditsRef.current
            log(`Real-time update: ${oldCredits} -> ${newCredits} (diff: ${newCredits - oldCredits})`)
            setCredits(newCredits)
            lastKnownCreditsRef.current = newCredits
          }
        }
      )
      .subscribe((status, err) => {
        log("Profile subscription status:", status)
        setIsConnected(status === 'SUBSCRIBED')
        
        if (err) {
          console.error("Subscription error:", err)
        }
        
        if (status === "SUBSCRIPTION_ERROR") {
          console.error("Failed to subscribe to profile updates")
          if (enablePolling) {
            log("Falling back to polling")
          }
        }
      })

    channels.push(profileChannel)

    // Optional: Subscribe to credit transactions for immediate feedback
    if (watchTransactions) {
      log("Setting up transaction monitoring")
      const transactionChannel = supabase
        .channel(`transactions-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "credit_transactions",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            log("New transaction detected:", payload)
            // Immediately fetch latest balance
            fetchCredits(false)
          }
        )
        .subscribe()

      channels.push(transactionChannel)
    }

    return () => {
      log("Cleaning up subscriptions")
      channels.forEach(channel => {
        supabase.removeChannel(channel)
      })
    }
  }, [userId, initialCredits, enablePolling, watchTransactions, debug]) // Exclude fetchCredits to avoid re-subscribing

  const refreshCredits = useCallback(async () => {
    log("Manual refresh requested")
    await fetchCredits(false)
  }, [fetchCredits, log])

  // Build return object based on options
  const result: CreditBalanceReturn = {
    credits,
    loading,
    error,
    refreshCredits
  }

  // Only include isConnected in debug mode
  if (debug) {
    result.isConnected = isConnected
  }

  return result
}

// Convenience hooks for common use cases
export function useCreditBalanceSimple(userId: string | undefined, initialCredits?: number) {
  return useCreditBalance(userId, { initialCredits })
}

export function useCreditBalanceWithPolling(userId: string | undefined, initialCredits?: number) {
  return useCreditBalance(userId, { 
    initialCredits, 
    enablePolling: true,
    pollingInterval: 5000 
  })
}

export function useCreditBalanceDebug(userId: string | undefined) {
  return useCreditBalance(userId, { 
    debug: true,
    enablePolling: true,
    watchTransactions: true,
    pollingInterval: 2000
  })
}