import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <Card className="stats-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-3" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  )
}

// Video Card Skeleton
export function VideoCardSkeleton() {
  return (
    <Card className="video-card h-full">
      <div className="relative aspect-video">
        <Skeleton className="absolute inset-0 rounded-t-lg" />
      </div>
      <CardContent className="p-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

// Activity Item Skeleton
export function ActivityItemSkeleton() {
  return (
    <div className="activity-item">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  )
}

// Dashboard Section Skeleton
export function DashboardSectionSkeleton({ 
  title = true, 
  description = true,
  content = "grid",
  items = 3 
}: {
  title?: boolean
  description?: boolean
  content?: "grid" | "list" | "custom"
  items?: number
}) {
  return (
    <Card className="dashboard-card">
      <CardHeader>
        {title && (
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-6 w-48" />
          </div>
        )}
        {description && <Skeleton className="h-4 w-64" />}
      </CardHeader>
      <CardContent>
        {content === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({ length: items }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-6" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : content === "list" ? (
          <div className="space-y-3">
            {Array.from({ length: items }).map((_, i) => (
              <ActivityItemSkeleton key={i} />
            ))}
          </div>
        ) : (
          <Skeleton className="h-32 w-full" />
        )}
      </CardContent>
    </Card>
  )
}

// Video Grid Skeleton
export function VideoGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Page Header Skeleton
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-6 w-96" />
    </div>
  )
}

// Editor Skeleton
export function EditorSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-4">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Player */}
          <Card>
            <CardContent className="p-0">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
          
          {/* Transcript Editor */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Modal Skeleton
export function ModalSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <div className="space-y-3 pt-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

// Generic Loading Shimmer
export function LoadingShimmer({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="h-full w-full bg-gradient-to-r from-slate-200 to-slate-300 rounded shimmer" />
    </div>
  )
}