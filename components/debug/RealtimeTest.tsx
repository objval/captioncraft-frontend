"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/database/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function RealtimeTest({ userId }: { userId: string }) {
  const [credits, setCredits] = useState<number | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 10))
  }

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    
    // Initial fetch
    const fetchCredits = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()
      
      if (error) {
        addLog(`Error fetching credits: ${error.message}`)
      } else {
        setCredits(data?.credits || 0)
        addLog(`Initial credits fetched: ${data?.credits || 0}`)
      }
    }

    fetchCredits()

    // Subscribe to changes
    const channel = supabase
      .channel(`test-credits-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          addLog(`Real-time update received: ${JSON.stringify(payload)}`)
          if (payload.new && typeof payload.new === 'object' && 'credits' in payload.new) {
            const newCredits = Number(payload.new.credits) || 0
            setCredits(newCredits)
            addLog(`Credits updated to: ${newCredits}`)
          }
        }
      )
      .subscribe((status, err) => {
        addLog(`Subscription status: ${status}`)
        if (err) {
          addLog(`Subscription error: ${err.message}`)
        }
      })

    return () => {
      addLog('Unsubscribing from channel')
      supabase.removeChannel(channel)
    }
  }, [userId])

  const testDeduction = async () => {
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ credits: (credits || 0) - 1 })
      .eq('id', userId)
    
    if (error) {
      addLog(`Error deducting credit: ${error.message}`)
    } else {
      addLog('Credit deduction triggered')
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Real-time Credits Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-lg">Current Credits:</span>
          <span className="text-2xl font-bold">{credits ?? 'Loading...'}</span>
        </div>
        
        <Button onClick={testDeduction} className="w-full">
          Test Deduct 1 Credit
        </Button>
        
        <div className="space-y-2">
          <h3 className="font-semibold">Real-time Logs:</h3>
          <div className="bg-muted p-3 rounded-md h-48 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-muted-foreground">No logs yet...</p>
            ) : (
              logs.map((log, i) => (
                <p key={i} className="text-xs font-mono">{log}</p>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}