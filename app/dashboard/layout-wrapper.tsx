import { getUser, getUserProfile, getUserCredits } from '@/lib/utils/cache'
import DashboardLayout from './layout'

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  // Start fetching data in parallel
  const userPromise = getUser()
  const user = await userPromise
  
  let profilePromise = Promise.resolve(null)
  let creditsPromise = Promise.resolve(0)
  
  if (user) {
    // Only fetch profile and credits if user exists
    profilePromise = getUserProfile(user.id)
    creditsPromise = getUserCredits(user.id)
  }
  
  // Pass promises to client component
  // They will resolve before the component renders
  const [profile, credits] = await Promise.all([profilePromise, creditsPromise])
  
  return <DashboardLayout>{children}</DashboardLayout>
}