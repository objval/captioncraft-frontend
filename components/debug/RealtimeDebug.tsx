"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/database/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function RealtimeDebug({ userId }: { userId: string }) {
  const [events, setEvents] = useState<any[]>([])
  const [profileSub, setProfileSub] = useState<string>("")
  const [transSub, setTransSub] = useState<string>("")

  useEffect(() => {
    const supabase = createClient()
    
    // Profile subscription
    const profileChannel = supabase
      .channel(`debug-profile-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const event = {
            time: new Date().toISOString(),
            table: "profiles",
            event: payload.eventType,
            data: payload,
          }
          setEvents(prev => [event, ...prev].slice(0, 20))
        }
      )
      .subscribe((status) => {
        setProfileSub(status)
      })

    // Transaction subscription
    const transChannel = supabase
      .channel(`debug-trans-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "credit_transactions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const event = {
            time: new Date().toISOString(),
            table: "credit_transactions",
            event: payload.eventType,
            data: payload,
          }
          setEvents(prev => [event, ...prev].slice(0, 20))
        }
      )
      .subscribe((status) => {
        setTransSub(status)
      })

    return () => {
      supabase.removeChannel(profileChannel)
      supabase.removeChannel(transChannel)
    }
  }, [userId])

  const testUpdate = async () => {
    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", userId)
    
    if (error) {
      console.error("Test update error:", error)
    } else {
      console.log("Test update sent")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-time Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div>Profile Sub: <span className={profileSub === 'SUBSCRIBED' ? 'text-green-600' : 'text-yellow-600'}>{profileSub}</span></div>
          <div>Trans Sub: <span className={transSub === 'SUBSCRIBED' ? 'text-green-600' : 'text-yellow-600'}>{transSub}</span></div>
        </div>
        
        <Button onClick={testUpdate} variant="outline">
          Test Profile Update
        </Button>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          <h3 className="font-semibold">Real-time Events:</h3>
          {events.length === 0 ? (
            <p className="text-muted-foreground">No events yet...</p>
          ) : (
            events.map((event, i) => (
              <div key={i} className="p-2 border rounded text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold">{event.table}</span>
                  <span>{new Date(event.time).toLocaleTimeString()}</span>
                </div>
                <div>Event: {event.event}</div>
                {event.data.new?.credits !== undefined && (
                  <div>Credits: {event.data.new.credits}</div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}