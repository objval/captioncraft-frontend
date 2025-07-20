export function DashboardSkeleton() {
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