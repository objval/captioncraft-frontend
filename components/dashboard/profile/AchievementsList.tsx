import { Trophy, Target, CheckCircle2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils/general"
import type { Video } from "@/lib/api/api"

interface AchievementsListProps {
  videos: Video[]
  profileCompletion: number
  loading: boolean
}

export function AchievementsList({
  videos,
  profileCompletion,
  loading
}: AchievementsListProps) {
  const achievements = [
    {
      id: 'first_video',
      name: 'First Video',
      description: 'Upload your first video',
      icon: Trophy,
      unlocked: videos.length > 0,
      color: 'text-yellow-500'
    },
    {
      id: 'ten_videos',
      name: 'Content Creator',
      description: 'Process 10 videos',
      icon: Target,
      unlocked: videos.length >= 10,
      color: 'text-blue-500'
    },
    {
      id: 'profile_complete',
      name: 'Profile Pro',
      description: 'Complete your profile',
      icon: CheckCircle2,
      unlocked: profileCompletion === 100,
      color: 'text-green-500'
    },
    {
      id: 'power_user',
      name: 'Power User',
      description: 'Process 50 videos',
      icon: Sparkles,
      unlocked: videos.length >= 50,
      color: 'text-purple-500'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="dashboard-card flex items-center gap-3 p-3 animate-pulse">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="flex-1">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
              <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {achievements.map((achievement) => {
        const Icon = achievement.icon
        return (
          <div
            key={achievement.id}
            className={cn(
              "dashboard-card flex items-center gap-3 p-3",
              !achievement.unlocked && "opacity-60"
            )}
          >
            <div className={cn(
              "p-2 rounded-lg",
              achievement.unlocked
                ? "bg-primary/10"
                : "bg-muted/50"
            )}>
              <Icon className={cn(
                "h-5 w-5",
                achievement.unlocked
                  ? achievement.color
                  : "text-slate-400"
              )} />
            </div>
            <div className="flex-1">
              <p className={cn(
                "font-medium text-sm",
                !achievement.unlocked && "text-slate-500"
              )}>
                {achievement.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {achievement.description}
              </p>
            </div>
            {achievement.unlocked && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </div>
        )
      })}
    </div>
  )
}