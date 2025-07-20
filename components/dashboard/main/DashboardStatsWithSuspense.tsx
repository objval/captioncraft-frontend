"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Video, Clock, TrendingUp, Coins } from "lucide-react"
import { DataLoader } from "./SuspenseWrappers"
import { 
  ClientCreditsCount, 
  ClientTotalVideos, 
  ClientProcessingVideos, 
  ClientCompletedVideos,
  ClientSuccessRate
} from "./ClientDataComponents"
import { useMemo } from "react"
import { useVideoSubscription } from "@/hooks/use-video-subscription"

interface DashboardStatsWithSuspenseProps {
  userId: string
  initialVideos: any[]
  initialCredits: number
}

export function DashboardStatsWithSuspense({ userId, initialVideos, initialCredits }: DashboardStatsWithSuspenseProps) {
  const { videos } = useVideoSubscription(userId, initialVideos)
  
  const successRate = useMemo(() => {
    const totalVideos = videos.length
    const successfulVideos = videos.filter(v => 
      ["complete", "ready"].includes(v.status)
    ).length
    return totalVideos > 0 ? (successfulVideos / totalVideos) * 100 : 0
  }, [videos])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <Card className="stats-card group">
        <CardHeader className="stats-card-content flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Total Videos</CardTitle>
          <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
            <Video className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="stats-card-content">
          <ClientTotalVideos userId={userId} initialVideos={initialVideos} />
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <ClientCompletedVideos userId={userId} initialVideos={initialVideos} />
            {" "}completed this month
          </p>
        </CardContent>
      </Card>

      <Card className="stats-card group">
        <CardHeader className="stats-card-content flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Processing</CardTitle>
          <div className="p-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent className="stats-card-content">
          <ClientProcessingVideos userId={userId} initialVideos={initialVideos} />
          <p className="text-sm text-muted-foreground mt-1">
            Currently being processed
          </p>
        </CardContent>
      </Card>

      <Card className="stats-card group">
        <CardHeader className="stats-card-content flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Success Rate</CardTitle>
          <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent className="stats-card-content">
          <ClientSuccessRate userId={userId} initialVideos={initialVideos} />
          <div className="mt-3 space-y-1">
            <Progress value={successRate} className="h-2 bg-slate-100" />
            <p className="text-xs text-slate-500">Overall performance</p>
          </div>
        </CardContent>
      </Card>

      <Card className="stats-card group pulse-glow">
        <CardHeader className="stats-card-content flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Credits</CardTitle>
          <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
            <Coins className="h-5 w-5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent className="stats-card-content">
          <ClientCreditsCount userId={userId} initialCredits={initialCredits} />
          <p className="text-sm text-muted-foreground mt-1">
            Available credits
          </p>
        </CardContent>
      </Card>
    </div>
  )
}