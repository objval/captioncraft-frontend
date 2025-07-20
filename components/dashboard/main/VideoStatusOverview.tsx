import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { BarChart3, CheckCircle, PlayCircle, Clock, AlertCircle, Video } from "lucide-react"
import Link from "next/link"
import type { Video as VideoType } from "@/lib/api"

interface VideoStatusOverviewProps {
  videos: VideoType[]
}

export function VideoStatusOverview({ videos }: VideoStatusOverviewProps) {
  const totalVideos = videos.length
  const completedVideos = videos.filter(v => v.status === "complete").length
  const readyVideos = videos.filter(v => v.status === "ready").length
  const processingVideos = videos.filter(v => 
    v.status === "processing" || v.status === "uploading" || v.status === "burning_in"
  ).length
  const failedVideos = videos.filter(v => v.status === "failed").length

  const statusData = [
    {
      label: "Completed",
      count: completedVideos,
      icon: CheckCircle,
      color: "text-blue-500",
      progressClass: "from-blue-400 to-blue-600"
    },
    {
      label: "Ready",
      count: readyVideos,
      icon: PlayCircle,
      color: "text-sky-500",
      progressClass: "from-sky-400 to-sky-600"
    },
    {
      label: "Processing",
      count: processingVideos,
      icon: Clock,
      color: "text-amber-500",
      progressClass: "from-amber-400 to-amber-600"
    },
    {
      label: "Failed",
      count: failedVideos,
      icon: AlertCircle,
      color: "text-red-500",
      progressClass: "from-red-400 to-red-600"
    }
  ]

  return (
    <Card className="dashboard-card dashboard-card-dark lg:col-span-2">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
            <BarChart3 className="h-6 w-6" />
          </div>
          Video Status Overview
        </CardTitle>
        <CardDescription className="text-slate-600">
          Current status of all your videos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {statusData.map(({ label, count, icon: Icon, color, progressClass }) => (
            <div key={label} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  {label}
                </span>
                <span className="text-sm font-bold text-slate-900">{count}</span>
              </div>
              <Progress 
                value={totalVideos > 0 ? (count / totalVideos) * 100 : 0} 
                className={`status-progress ${progressClass}`} 
              />
            </div>
          ))}
        </div>
        
        <div className="pt-6 border-t border-slate-200">
          <Button 
            asChild 
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Link href="/dashboard/gallery">
              <Video className="h-5 w-5 mr-2" />
              View All Videos
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}