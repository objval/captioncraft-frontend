"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { useVideoSubscription } from "@/hooks/use-video-subscription"
import { useCreditBalance } from "@/hooks/use-credit-balance"
import { 
  Video, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  FileText,
  PlayCircle,
  Coins,
  Activity,
  Calendar,
  Timer
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default function DashboardPage() {
  const { user } = useAuth()
  const { videos, loading } = useVideoSubscription(user?.id)
  const { credits } = useCreditBalance(user?.id)

  // Calculate statistics
  const totalVideos = videos.length
  const completedVideos = videos.filter(v => v.status === "complete").length
  const processingVideos = videos.filter(v => v.status === "processing" || v.status === "uploading" || v.status === "burning_in").length
  const failedVideos = videos.filter(v => v.status === "failed").length
  const readyVideos = videos.filter(v => v.status === "ready").length
  
  const completionRate = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0
  const successRate = totalVideos > 0 ? ((completedVideos + readyVideos) / totalVideos) * 100 : 0

  // Recent activity
  const recentVideos = videos
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete": return "bg-blue-100 text-blue-800"
      case "ready": return "bg-sky-100 text-sky-800"
      case "processing": return "bg-indigo-100 text-indigo-800"
      case "uploading": return "bg-slate-100 text-slate-800"
      case "burning_in": return "bg-blue-200 text-blue-900"
      case "failed": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete": return <CheckCircle className="h-4 w-4" />
      case "ready": return <PlayCircle className="h-4 w-4" />
      case "processing": return <Clock className="h-4 w-4" />
      case "uploading": return <Activity className="h-4 w-4" />
      case "burning_in": return <Zap className="h-4 w-4" />
      case "failed": return <AlertCircle className="h-4 w-4" />
      default: return <Video className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
              <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your video projects.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVideos}</div>
            <p className="text-xs text-muted-foreground">
              {completedVideos} completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingVideos}</div>
            <p className="text-xs text-muted-foreground">
              Currently being processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits}</div>
            <p className="text-xs text-muted-foreground">
              Available credits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Video Status Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Video Status Overview
            </CardTitle>
            <CardDescription>
              Current status of all your videos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completed</span>
                  <span className="text-sm text-muted-foreground">{completedVideos}</span>
                </div>
                <Progress value={totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Ready</span>
                  <span className="text-sm text-muted-foreground">{readyVideos}</span>
                </div>
                <Progress value={totalVideos > 0 ? (readyVideos / totalVideos) * 100 : 0} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Processing</span>
                  <span className="text-sm text-muted-foreground">{processingVideos}</span>
                </div>
                <Progress value={totalVideos > 0 ? (processingVideos / totalVideos) * 100 : 0} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Failed</span>
                  <span className="text-sm text-muted-foreground">{failedVideos}</span>
                </div>
                <Progress value={totalVideos > 0 ? (failedVideos / totalVideos) * 100 : 0} className="h-2" />
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button asChild className="w-full">
                <Link href="/dashboard/gallery">
                  View All Videos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest video uploads
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentVideos.length === 0 ? (
              <div className="text-center py-8">
                <Video className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No videos yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentVideos.map((video) => (
                  <div key={video.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getStatusIcon(video.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{video.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(video.status)}`}>
                      {video.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/gallery">
                <Video className="h-6 w-6 mb-2" />
                View All Videos
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/credits">
                <Coins className="h-6 w-6 mb-2" />
                Buy Credits
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => window.dispatchEvent(new CustomEvent('open-upload-modal'))}
            >
              <FileText className="h-6 w-6 mb-2" />
              Upload Video
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
