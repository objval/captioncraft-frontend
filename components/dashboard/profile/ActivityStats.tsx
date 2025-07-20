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
    <Card className="lg:col-span-2 border-0 shadow-lg">
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
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">
              {loading ? (
                <span className="inline-block h-8 w-12 bg-blue-200 rounded animate-pulse" />
              ) : (
                videos.length
              )}
            </div>
            <div className="text-sm text-blue-600">Videos</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">
              {loading ? (
                <span className="inline-block h-8 w-12 bg-purple-200 rounded animate-pulse" />
              ) : (
                credits
              )}
            </div>
            <div className="text-sm text-purple-600">Credits</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-700">
              {loading ? (
                <span className="inline-block h-8 w-12 bg-green-200 rounded animate-pulse" />
              ) : (
                videos.filter(v => v.status === 'complete').length
              )}
            </div>
            <div className="text-sm text-green-600">Completed</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-2xl font-bold text-orange-700">
              {loading ? (
                <span className="inline-block h-8 w-12 bg-orange-200 rounded animate-pulse" />
              ) : (
                unlockedAchievements
              )}
            </div>
            <div className="text-sm text-orange-600">Achievements</div>
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