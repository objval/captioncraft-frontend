import { getUser, getUserVideos, getUserCredits } from '@/lib/utils/cache'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  // Prefetch data in parallel
  const [videos, credits] = await Promise.all([
    getUserVideos(user.id),
    getUserCredits(user.id)
  ])

  return <DashboardClient initialVideos={videos} initialCredits={credits} />
}