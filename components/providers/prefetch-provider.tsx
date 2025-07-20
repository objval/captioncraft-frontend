"use client"

import { createContext, useContext, use } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/api/api'

interface PrefetchContextValue {
  user: User | null
  profile: Profile | null
  credits: number
}

const PrefetchContext = createContext<PrefetchContextValue | null>(null)

interface PrefetchProviderProps {
  children: React.ReactNode
  userPromise: Promise<User | null>
  profilePromise: Promise<Profile | null>
  creditsPromise: Promise<number>
}

export function PrefetchProvider({
  children,
  userPromise,
  profilePromise,
  creditsPromise,
}: PrefetchProviderProps) {
  // Use React 18's use() hook to unwrap promises
  const user = use(userPromise)
  const profile = use(profilePromise)
  const credits = use(creditsPromise)

  return (
    <PrefetchContext.Provider value={{ user, profile, credits }}>
      {children}
    </PrefetchContext.Provider>
  )
}

export function usePrefetchedData() {
  const context = useContext(PrefetchContext)
  if (!context) {
    throw new Error('usePrefetchedData must be used within PrefetchProvider')
  }
  return context
}