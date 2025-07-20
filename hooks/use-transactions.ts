"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/database/supabase/client"

export interface Transaction {
  id: string
  user_id: string
  amount_changed: number
  reason: string
  created_at: string
}

// Helper function to get display name for transaction reason
export function getTransactionDisplayName(transaction: Transaction): string {
  // Map based on amount_changed for credit deductions
  if (transaction.amount_changed === -5) {
    return "Video Burn in"
  } else if (transaction.amount_changed === -1) {
    return "Video upload"
  } else if (transaction.amount_changed > 0) {
    return "Credit purchase"
  } else {
    // Fallback to reason field for other cases
    switch (transaction.reason?.toLowerCase()) {
      case "video_burn_in":
      case "burn_in":
        return "Video Burn in"
      case "video_upload":
      case "upload":
        return "Video upload"
      case "credit_purchase":
      case "purchase":
        return "Credit purchase"
      case "refund":
        return "Refund"
      case "bonus":
        return "Bonus credits"
      default:
        return transaction.reason || "Transaction"
    }
  }
}

export function useTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    // Initial fetch
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from("credit_transactions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10)

        if (error) {
          console.error("Failed to fetch transactions:", error)
          return
        }

        setTransactions(data || [])
      } catch (error) {
        console.error("Failed to fetch transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()

    // Realtime subscription for new transactions
    const channel = supabase
      .channel("credit_transactions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "credit_transactions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          handleTransactionUpdate(payload)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const handleTransactionUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    setTransactions((prev) => {
      switch (eventType) {
        case "INSERT":
          return [newRecord, ...prev].slice(0, 10) // Keep only latest 10
        case "UPDATE":
          return prev.map((transaction) => 
            transaction.id === newRecord.id ? newRecord : transaction
          )
        case "DELETE":
          return prev.filter((transaction) => transaction.id !== oldRecord.id)
        default:
          return prev
      }
    })
  }

  return { transactions, loading }
} 