import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserX, Video, CreditCard, BarChart3 } from "lucide-react"

interface SystemStatsProps {
  systemStats: {
    total_users?: number
    total_videos?: number
    credits_distributed?: number
    total_transcripts?: number
  }
  totalAdmins: number
  totalUsers: number
  bannedUsers: number
}

export function SystemStats({ 
  systemStats, 
  totalAdmins, 
  totalUsers, 
  bannedUsers 
}: SystemStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="stats-card group">
        <CardHeader className="stats-card-content flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Total Users</CardTitle>
          <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="stats-card-content">
          <div className="stats-number">{systemStats.total_users || 0}</div>
          <p className="text-xs text-slate-600 mt-1">
            {totalAdmins} admin{totalAdmins !== 1 ? 's' : ''}, {totalUsers} user{totalUsers !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card className="stats-card group">
        <CardHeader className="stats-card-content flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Banned Users</CardTitle>
          <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
            <UserX className="h-4 w-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent className="stats-card-content">
          <div className="stats-number">{bannedUsers}</div>
          <p className="text-xs text-slate-600 mt-1">
            {bannedUsers > 0 && systemStats.total_users 
              ? `${((bannedUsers / systemStats.total_users) * 100).toFixed(1)}% of total` 
              : 'None'}
          </p>
        </CardContent>
      </Card>

      <Card className="stats-card group">
        <CardHeader className="stats-card-content flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Total Videos</CardTitle>
          <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
            <Video className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent className="stats-card-content">
          <div className="stats-number">{systemStats.total_videos || 0}</div>
          <p className="text-xs text-slate-600 mt-1">All time</p>
        </CardContent>
      </Card>

      <Card className="stats-card group">
        <CardHeader className="stats-card-content flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Total Credits</CardTitle>
          <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
            <CreditCard className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent className="stats-card-content">
          <div className="stats-number">{systemStats.credits_distributed || 0}</div>
          <p className="text-xs text-slate-600 mt-1">In circulation</p>
        </CardContent>
      </Card>

      <Card className="stats-card group">
        <CardHeader className="stats-card-content flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">Transcripts</CardTitle>
          <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent className="stats-card-content">
          <div className="stats-number">{systemStats.total_transcripts || 0}</div>
          <p className="text-xs text-slate-600 mt-1">Generated</p>
        </CardContent>
      </Card>
    </div>
  )
}