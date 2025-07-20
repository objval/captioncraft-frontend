import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Activity, Trophy } from "lucide-react"
import { AchievementsList } from "./AchievementsList"
import type { Video } from "@/lib/api/api"

interface ActivityStatsProps {
  videos: Video[]
  credits: number
  loading: boolean
  profileCompletion: number
}

export function ActivityStats({
  videos,
  credits,
  loading,
  profileCompletion
}: ActivityStatsProps) {
  const unlockedAchievements = [
    videos.length > 0,
    videos.length >= 10,
    profileCompletion === 100,
    videos.length >= 50
  ].filter(Boolean).length

  return (
    <Card className="lg:col-span-2 dashboard-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity & Achievements
        </CardTitle>
        <CardDescription>
          Your account statistics and milestones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stats-card group">
            <div className="p-4 text-center stats-card-content">
              <div className="stats-number">
              {loading ? (
                <span className="inline-block h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ) : (
                videos.length
              )}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Videos</div>
            </div>
          </div>
          <div className="stats-card group">
            <div className="p-4 text-center stats-card-content">
              <div className="stats-number">
              {loading ? (
                <span className="inline-block h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ) : (
                credits
              )}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Credits</div>
            </div>
          </div>
          <div className="stats-card group">
            <div className="p-4 text-center stats-card-content">
              <div className="stats-number">
              {loading ? (
                <span className="inline-block h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ) : (
                videos.filter(v => v.status === 'complete').length
              )}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Completed</div>
            </div>
          </div>
          <div className="stats-card group">
            <div className="p-4 text-center stats-card-content">
              <div className="stats-number">
              {loading ? (
                <span className="inline-block h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ) : (
                unlockedAchievements
              )}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Achievements</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Achievements */}
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Achievements
          </h3>
          <AchievementsList
            videos={videos}
            profileCompletion={profileCompletion}
            loading={loading}
          />
        </div>
      </CardContent>
    </Card>
  )
}