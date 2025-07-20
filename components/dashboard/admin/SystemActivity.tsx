import { Activity } from "lucide-react"
import { StatusIcon } from "@/components/shared/StatusBadge"
import { DateDisplay } from "@/components/shared/DateDisplay"

interface VideoData {
  id: string
  title: string
  status: string
  created_at: string
  profiles?: {
    email?: string
  }
}

interface SystemActivityProps {
  recentVideos: VideoData[]
}

export function SystemActivity({ recentVideos }: SystemActivityProps) {
  if (recentVideos.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No recent activity
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recentVideos.slice(0, 20).map((video) => (
        <div key={video.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
          <Activity className="h-4 w-4 text-slate-500" />
          <div className="flex-1">
            <div className="font-medium text-sm">
              {video.profiles?.email || 'User'} uploaded &quot;{video.title}&quot;
            </div>
            <div className="text-xs text-slate-500">
              Status: {video.status} • <DateDisplay date={video.created_at} format="relative" />
            </div>
          </div>
          <StatusIcon status={video.status} />
        </div>
      ))}
    </div>
  )
}