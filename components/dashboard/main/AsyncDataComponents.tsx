import { getUserCredits, getUserVideos } from "@/lib/utils/cache"
import { SuspenseNumber, SuspenseText } from "./SuspenseWrappers"
import type { Video } from "@/lib/api/api"

export async function AsyncCreditsCount({ userId }: { userId: string }) {
  const credits = await getUserCredits(userId)
  return <SuspenseNumber value={credits} className="stats-number" />
}

export async function AsyncTotalVideos({ userId }: { userId: string }) {
  const videos = await getUserVideos(userId)
  return <SuspenseNumber value={videos.length} className="stats-number" />
}

export async function AsyncProcessingVideos({ userId }: { userId: string }) {
  const videos = await getUserVideos(userId)
  const processingCount = videos.filter(v => 
    ["processing", "uploading", "burning_in"].includes(v.status)
  ).length
  return <SuspenseNumber value={processingCount} className="stats-number" />
}

export async function AsyncCompletedVideos({ userId }: { userId: string }) {
  const videos = await getUserVideos(userId)
  const completedCount = videos.filter(v => v.status === "complete").length
  return <SuspenseNumber value={completedCount} />
}

export async function AsyncSuccessRate({ userId }: { userId: string }) {
  const videos = await getUserVideos(userId)
  const totalVideos = videos.length
  const successfulVideos = videos.filter(v => 
    ["complete", "ready"].includes(v.status)
  ).length
  const rate = totalVideos > 0 ? (successfulVideos / totalVideos) * 100 : 0
  return <SuspenseNumber value={`${rate.toFixed(1)}%`} className="stats-number" />
}