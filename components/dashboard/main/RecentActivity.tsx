import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge, StatusIcon } from "@/components/shared/StatusBadge"
import { Activity, Video, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Video as VideoType } from "@/lib/api"

interface RecentActivityProps {
  videos: VideoType[]
}

export function RecentActivity({ videos }: RecentActivityProps) {
  // Get recent videos
  const recentVideos = videos
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
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
  )
}