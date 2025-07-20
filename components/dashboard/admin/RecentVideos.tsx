import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DateDisplay } from "@/components/shared/DateDisplay"

interface VideoData {
  id: string
  title: string
  status: string
  created_at: string
  profiles?: {
    full_name?: string | null
    email?: string
  }
}

interface RecentVideosProps {
  videos: VideoData[]
}

export function RecentVideos({ videos }: RecentVideosProps) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No videos found
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Uploaded</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {videos.map((video) => (
          <TableRow key={video.id}>
            <TableCell>
              <div>
                <div className="font-medium">{video.title}</div>
                <div className="text-xs text-slate-500">{video.id}</div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">
                  {video.profiles?.full_name || video.profiles?.email || 'Unknown'}
                </div>
                <div className="text-xs text-slate-500">{video.profiles?.email}</div>
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge status={video.status} />
            </TableCell>
            <TableCell>
              <DateDisplay date={video.created_at} format="relative" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}