"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { useVideoSubscription } from "@/hooks/use-video-subscription"
import { useCreditBalance } from "@/hooks/use-credit-balance"
import { StatusBadge, StatusIcon } from "@/components/shared/StatusBadge"
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

  // Status helpers are now imported from shared utilities

  if (loading) {
    return (
      <div className="min-h-screen p-4 lg:p-8">
        <div className="space-y-6 md:space-y-8 animate-pulse">
          {/* Welcome Header Skeleton */}
          <div className="space-y-3">
            <div className="h-10 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-64 shimmer"></div>
            <div className="h-6 bg-slate-200 rounded-lg w-96 shimmer"></div>
          </div>

          {/* Stats Cards Skeleton */}
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

          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Video Status Overview Skeleton */}
            <div className="dashboard-card lg:col-span-2">
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-200 rounded-lg shimmer"></div>
                    <div className="h-6 bg-slate-200 rounded w-48 shimmer"></div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-64 shimmer"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-slate-200 rounded w-20 shimmer"></div>
                        <div className="h-4 bg-slate-200 rounded w-6 shimmer"></div>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full w-full shimmer"></div>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-slate-200">
                  <div className="h-12 bg-slate-200 rounded-lg w-full shimmer"></div>
                </div>
              </div>
            </div>

            {/* Recent Activity Skeleton */}
            <div className="dashboard-card">
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-200 rounded-lg shimmer"></div>
                    <div className="h-6 bg-slate-200 rounded w-32 shimmer"></div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-40 shimmer"></div>
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="activity-item">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-slate-200 rounded-lg shimmer"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-full shimmer"></div>
                          <div className="h-3 bg-slate-200 rounded w-24 shimmer"></div>
                        </div>
                        <div className="h-6 bg-slate-200 rounded-full w-16 shimmer"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="dashboard-card">
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-200 rounded-lg shimmer"></div>
                  <div className="h-6 bg-slate-200 rounded w-32 shimmer"></div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-48 shimmer"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 bg-slate-200 rounded-lg shimmer"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="space-y-6 md:space-y-8">
        {/* Welcome Header */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Welcome back! Here's what's happening with your video projects.
          </p>
        </div>

        {/* Stats Cards */}
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Video Status Overview */}
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      Completed
                    </span>
                    <span className="text-sm font-bold text-slate-900">{completedVideos}</span>
                  </div>
                  <Progress 
                    value={totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0} 
                    className="status-progress from-blue-400 to-blue-600" 
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <PlayCircle className="h-4 w-4 text-sky-500" />
                      Ready
                    </span>
                    <span className="text-sm font-bold text-slate-900">{readyVideos}</span>
                  </div>
                  <Progress 
                    value={totalVideos > 0 ? (readyVideos / totalVideos) * 100 : 0} 
                    className="status-progress from-sky-400 to-sky-600" 
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-500" />
                      Processing
                    </span>
                    <span className="text-sm font-bold text-slate-900">{processingVideos}</span>
                  </div>
                  <Progress 
                    value={totalVideos > 0 ? (processingVideos / totalVideos) * 100 : 0} 
                    className="status-progress from-amber-400 to-amber-600" 
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Failed
                    </span>
                    <span className="text-sm font-bold text-slate-900">{failedVideos}</span>
                  </div>
                  <Progress 
                    value={totalVideos > 0 ? (failedVideos / totalVideos) * 100 : 0} 
                    className="status-progress from-red-400 to-red-600" 
                  />
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-200">
                <Button asChild className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Link href="/dashboard/gallery">
                    <Video className="h-5 w-5 mr-2" />
                    View All Videos
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="dashboard-card dashboard-card-dark">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                  <Activity className="h-6 w-6" />
                </div>
                Recent Activity
              </CardTitle>
              <CardDescription className="text-slate-600">
                Your latest video uploads
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentVideos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 rounded-full bg-slate-100 mx-auto w-fit mb-4">
                    <Video className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">No videos yet</p>
                  <p className="text-xs text-slate-400 mt-1">Upload your first video to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentVideos.map((video, index) => (
                    <div key={video.id} className={`activity-item ${index % 2 === 0 ? 'shimmer' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 p-2 rounded-lg bg-slate-100">
                          <StatusIcon status={video.status} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{video.title}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <StatusBadge 
                          status={video.status} 
                          className="text-xs font-medium px-3 py-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="dashboard-card dashboard-card-dark">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                <Zap className="h-6 w-6" />
              </div>
              Quick Actions
            </CardTitle>
            <CardDescription className="text-slate-600">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="group dashboard-card hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:border-blue-300">
                <Link href="/dashboard/gallery" className="block p-6 h-full">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors shadow-sm">
                      <Video className="h-7 w-7 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">View All Videos</h3>
                      <p className="text-xs text-slate-500">Browse your video library</p>
                    </div>
                  </div>
                </Link>
              </div>
              
              <div className="group dashboard-card hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 hover:border-purple-300">
                <Link href="/dashboard/credits" className="block p-6 h-full">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors shadow-sm">
                      <Coins className="h-7 w-7 text-purple-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">Buy Credits</h3>
                      <p className="text-xs text-slate-500">Purchase processing credits</p>
                    </div>
                  </div>
                </Link>
              </div>
              
              <div 
                className="group dashboard-card hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 hover:border-emerald-300"
                onClick={() => window.dispatchEvent(new CustomEvent('open-upload-modal'))}
              >
                <div className="block p-6 h-full">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors shadow-sm">
                      <FileText className="h-7 w-7 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">Upload Video</h3>
                      <p className="text-xs text-slate-500">Add a new video project</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
