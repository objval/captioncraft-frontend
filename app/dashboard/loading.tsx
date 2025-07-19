import { PageHeaderSkeleton, StatsCardSkeleton, DashboardSectionSkeleton } from "@/components/shared/LoadingSkeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
        {/* Header Skeleton */}
        <PageHeaderSkeleton />
        
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        
        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <DashboardSectionSkeleton title={true} description={true} content="grid" items={4} />
          </div>
          <div>
            <DashboardSectionSkeleton title={true} description={true} content="list" items={5} />
          </div>
        </div>
        
        {/* Quick Actions Skeleton */}
        <DashboardSectionSkeleton title={true} description={true} content="grid" items={3} />
      </div>
    </div>
  )
}