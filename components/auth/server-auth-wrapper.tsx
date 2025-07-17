import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { ReactNode } from 'react'

interface ServerAuthWrapperProps {
  children: ReactNode
  redirectTo?: string
}

export default async function ServerAuthWrapper({ 
  children, 
  redirectTo = '/auth/login' 
}: ServerAuthWrapperProps) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect(redirectTo)
  }

  // Pass the user data to children if they need it
  return <>{children}</>
}

// Helper function to get user data in server components
export async function getServerUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    return null
  }
  
  return data.user
}
