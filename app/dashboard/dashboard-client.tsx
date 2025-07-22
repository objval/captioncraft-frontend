"use client"

import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useVideoSubscription } from "@/hooks/video"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

// Import dashboard components
import { DashboardStats } from "@/components/dashboard/main/DashboardStats"
import { VideoStatusOverview } from "@/components/dashboard/main/VideoStatusOverview"
import { RecentActivity } from "@/components/dashboard/main/RecentActivity"
import { QuickActions } from "@/components/dashboard/main/QuickActions"

interface DashboardClientProps {
  initialVideos: any[]
  initialCredits: number
}

export default function DashboardClient({ 
  initialVideos, 
  initialCredits 
}: DashboardClientProps) {
  const { user } = useAuth()
  const { videos, loading } = useVideoSubscription(user?.id, initialVideos)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Trigger a refresh by updating the videos
    // The real-time subscription will handle the actual update
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="space-y-6 md:space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">
              Dashboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Welcome back! Here&apos;s what&apos;s happening with your video projects.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-fit"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <DashboardStats videos={videos} loading={isRefreshing} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Video Status Overview */}
          <VideoStatusOverview videos={videos} loading={isRefreshing} />

          {/* Recent Activity */}
          <RecentActivity videos={videos} loading={isRefreshing} />
        </div>

        {/* Quick Actions */}
        <QuickActions loading={isRefreshing} />
      </div>
    </div>
  )
}