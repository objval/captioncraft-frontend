import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Video, Clock, TrendingUp, Coins } from "lucide-react"
import type { Video as VideoType } from "@/lib/api"

interface DashboardStatsProps {
  videos: VideoType[]
  credits: number
  loading?: boolean
}

export function DashboardStats({ videos, credits, loading }: DashboardStatsProps) {
  // Calculate statistics
  const totalVideos = videos.length
  const completedVideos = videos.filter(v => v.status === "complete").length
  const processingVideos = videos.filter(v => 
    v.status === "processing" || v.status === "uploading" || v.status === "burning_in"
  ).length
  const readyVideos = videos.filter(v => v.status === "ready").length
  
  const successRate = totalVideos > 0 
    ? ((completedVideos + readyVideos) / totalVideos) * 100 
    : 0

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="dashboard-card">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-200 rounded w-24 shimmer"></div>
                <div className="h-10 w-10 bg-slate-200 rounded-lg shimmer"></div>
              </div>
              <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-16 shimmer"></div>
              <div className="h-4 bg-slate-200 rounded w-32 shimmer"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <Card className="stats-card group">
        <CardHeader className="stats-card-content flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Total Videos</CardTitle>
          <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
            <Video className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="stats-card-content">
          <div className="stats-number">{totalVideos}</div>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {completedVideos} completed this month
          </p>
        </CardContent>
      </Card>

      <Card className="stats-card group">
        <CardHeader className="stats-card-content flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Processing</CardTitle>
          <div className="p-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent className="stats-card-content">
          <div className="stats-number">{processingVideos}</div>
          <p className="text-sm text-slate-500 mt-1">
            Currently being processed
          </p>
        </CardContent>
      </Card>

      <Card className="stats-card group">
        <CardHeader className="stats-card-content flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Success Rate</CardTitle>
          <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent className="stats-card-content">
          <div className="stats-number">{successRate.toFixed(1)}%</div>
          <div className="mt-3 space-y-1">
            <Progress value={successRate} className="h-2 bg-slate-100" />
            <p className="text-xs text-slate-500">Overall performance</p>
          </div>
        </CardContent>
      </Card>

      <Card className="stats-card group pulse-glow">
        <CardHeader className="stats-card-content flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Credits</CardTitle>
          <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
            <Coins className="h-5 w-5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent className="stats-card-content">
          <div className="stats-number">{credits}</div>
          <p className="text-sm text-slate-500 mt-1">
            Available credits
          </p>
        </CardContent>
      </Card>
    </div>
  )
}