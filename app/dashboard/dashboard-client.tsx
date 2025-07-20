"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useVideoSubscription } from "@/hooks/use-video-subscription"
import { useCreditBalance } from "@/hooks/use-credit-balance"

// Import dashboard components
import { DashboardStats } from "@/components/dashboard/main/DashboardStats"
import { VideoStatusOverview } from "@/components/dashboard/main/VideoStatusOverview"
import { RecentActivity } from "@/components/dashboard/main/RecentActivity"
import { QuickActions } from "@/components/dashboard/main/QuickActions"
import { DashboardSkeleton } from "@/components/dashboard/main/DashboardSkeleton"

interface DashboardClientProps {
  initialVideos?: any[]
  initialCredits?: number
}

export default function DashboardClient({ 
  initialVideos = [], 
  initialCredits = 0 
}: DashboardClientProps) {
  const { user } = useAuth()
  const { videos, loading } = useVideoSubscription(user?.id, initialVideos)
  const { credits } = useCreditBalance(user?.id, initialCredits)

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="space-y-6 md:space-y-8">
        {/* Welcome Header */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Welcome back! Here's what's happening with your video projects.
          </p>
        </div>

        {/* Stats Cards */}
        <DashboardStats videos={videos} credits={credits} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Video Status Overview */}
          <VideoStatusOverview videos={videos} />

          {/* Recent Activity */}
          <RecentActivity videos={videos} />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  )
}