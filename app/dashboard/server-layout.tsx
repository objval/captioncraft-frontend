import { redirect } from 'next/navigation'
import { createClient } from '@/lib/database/supabase/server'

export default async function DashboardServerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return <>{children}</>
}
