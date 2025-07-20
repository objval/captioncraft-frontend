export function GallerySkeleton() {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="space-y-6 md:space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-48 shimmer"></div>
            <div className="h-5 bg-slate-200 rounded-lg w-80 shimmer"></div>
          </div>
          
          {/* Controls Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-10 bg-slate-200 rounded-lg flex-1 shimmer"></div>
            <div className="h-10 bg-slate-200 rounded-lg w-48 shimmer"></div>
          </div>
          
          {/* Filter Pills Skeleton */}
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-6 bg-slate-200 rounded-full w-20 shimmer"></div>
            ))}
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="dashboard-card">
              <div className="p-0">
                <div className="aspect-video bg-slate-200 shimmer"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4 shimmer"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 shimmer"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-slate-200 rounded flex-1 shimmer"></div>
                    <div className="h-8 bg-slate-200 rounded w-10 shimmer"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}