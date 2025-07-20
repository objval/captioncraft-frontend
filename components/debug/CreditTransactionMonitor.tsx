"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/database/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface Transaction {
  id: string
  user_id: string
  amount_changed: number
  reason: string
  created_at: string
  balance_after: number
}

export function CreditTransactionMonitor({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [duplicates, setDuplicates] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    
    // Fetch recent transactions
    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (!error && data) {
        setTransactions(data)
        checkForDuplicates(data)
      }
    }

    fetchTransactions()

    // Subscribe to new transactions
    const channel = supabase
      .channel(`monitor-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'credit_transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newTransaction = payload.new as Transaction
          setTransactions(prev => {
            const updated = [newTransaction, ...prev].slice(0, 20)
            checkForDuplicates(updated)
            return updated
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const checkForDuplicates = (txns: Transaction[]) => {
    const newDuplicates = new Set<string>()
    
    for (let i = 0; i < txns.length - 1; i++) {
      const current = txns[i]
      const next = txns[i + 1]
      
      const currentTime = new Date(current.created_at).getTime()
      const nextTime = new Date(next.created_at).getTime()
      const timeDiff = Math.abs(currentTime - nextTime)
      
      // If transactions are within 2 seconds and have same amount
      if (timeDiff < 2000 && current.amount_changed === next.amount_changed) {
        newDuplicates.add(current.id)
        newDuplicates.add(next.id)
      }
    }
    
    setDuplicates(newDuplicates)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Credit Transaction Monitor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {transactions.map((tx) => {
            const isDuplicate = duplicates.has(tx.id)
            const timestamp = new Date(tx.created_at)
            
            return (
              <div
                key={tx.id}
                className={`p-2 rounded-md border text-sm ${
                  isDuplicate ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isDuplicate && <AlertCircle className="h-4 w-4 text-red-500" />}
                    <span className={tx.amount_changed < 0 ? 'text-red-600' : 'text-green-600'}>
                      {tx.amount_changed > 0 ? '+' : ''}{tx.amount_changed}
                    </span>
                    <span className="text-muted-foreground">{tx.reason}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {timestamp.toLocaleTimeString()}.{timestamp.getMilliseconds()}ms
                  </div>
                </div>
                {tx.balance_after !== undefined && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Balance after: {tx.balance_after}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {duplicates.size > 0 && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Detected {duplicates.size / 2} potential duplicate transactions within 2 seconds
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}