import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CreditsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Credit Overview Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* Current Balance Skeleton */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>

            {/* Total Spent Skeleton */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>

            {/* Credits Processed Skeleton */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </div>
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buy Credits Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="space-y-3">
                  <div>
                    <Skeleton className="h-8 w-20 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="pt-3 border-t border-slate-200">
                    <Skeleton className="h-7 w-16 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Credit Usage Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-4 w-48 mt-1" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-12 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Purchase History Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-4 w-40 mt-1" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}