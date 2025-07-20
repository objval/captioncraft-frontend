"use client"

import { useVideoSubscription } from "@/hooks/use-video-subscription"
import { useCreditBalance } from "@/hooks/use-credit-balance"
import { SuspenseNumber } from "./SuspenseWrappers"
import { useMemo } from "react"

export function ClientCreditsCount({ userId, initialCredits }: { userId: string, initialCredits: number }) {
  const { credits } = useCreditBalance(userId, initialCredits)
  return <SuspenseNumber value={credits} className="stats-number" />
}

export function ClientTotalVideos({ userId, initialVideos }: { userId: string, initialVideos: any[] }) {
  const { videos } = useVideoSubscription(userId, initialVideos)
  return <SuspenseNumber value={videos.length} className="stats-number" />
}

export function ClientProcessingVideos({ userId, initialVideos }: { userId: string, initialVideos: any[] }) {
  const { videos } = useVideoSubscription(userId, initialVideos)
  const processingCount = useMemo(() => 
    videos.filter(v => ["processing", "uploading", "burning_in"].includes(v.status)).length,
    [videos]
  )
  return <SuspenseNumber value={processingCount} className="stats-number" />
}

export function ClientCompletedVideos({ userId, initialVideos }: { userId: string, initialVideos: any[] }) {
  const { videos } = useVideoSubscription(userId, initialVideos)
  const completedCount = useMemo(() => 
    videos.filter(v => v.status === "complete").length,
    [videos]
  )
  return <SuspenseNumber value={completedCount} />
}

export function ClientSuccessRate({ userId, initialVideos }: { userId: string, initialVideos: any[] }) {
  const { videos } = useVideoSubscription(userId, initialVideos)
  const rate = useMemo(() => {
    const totalVideos = videos.length
    const successfulVideos = videos.filter(v => 
      ["complete", "ready"].includes(v.status)
    ).length
    return totalVideos > 0 ? (successfulVideos / totalVideos) * 100 : 0
  }, [videos])
  
  return <SuspenseNumber value={`${rate.toFixed(1)}%`} className="stats-number" />
}