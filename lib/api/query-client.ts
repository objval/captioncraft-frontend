


/**
 * Enhanced caching configuration (React Query integration when available)
 * For now, providing cache utilities and query key patterns
 */

// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

/**
 * Query keys factory for consistent caching
 * Use these keys with React Query when implemented
 */
export const queryKeys = {
  // User-related queries
  user: {
    profile: (userId?: string) => ['user', 'profile', userId] as const,
    credits: (userId?: string) => ['user', 'credits', userId] as const,
    videos: (userId?: string) => ['user', 'videos', userId] as const,
    transactions: (userId?: string) => ['user', 'transactions', userId] as const,
    payments: (userId?: string) => ['user', 'payments', userId] as const,
  },
  
  // Video-related queries
  videos: {
    all: () => ['videos'] as const,
    list: (filters?: any) => ['videos', 'list', filters] as const,
    detail: (id: string) => ['videos', 'detail', id] as const,
    transcript: (id: string) => ['videos', 'transcript', id] as const,
  },
  
  // Admin queries
  admin: {
    users: (filters?: any) => ['admin', 'users', filters] as const,
    stats: () => ['admin', 'stats'] as const,
    analytics: (period?: string) => ['admin', 'analytics', period] as const,
  },
  
  // System queries
  system: {
    creditPacks: () => ['system', 'creditPacks'] as const,
    settings: () => ['system', 'settings'] as const,
  },
} as const

/**
 * Simple in-memory cache for API responses
 */
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set(key: string, data: any, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  delete(key: string): void {
    this.cache.delete(key)
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}

export const simpleCache = new SimpleCache()

/**
 * Cache utilities for manual cache management
 */
export const cacheUtils = {
  // User data cache management
  invalidateUserData: (userId?: string) => {
    if (userId) {
      simpleCache.invalidatePattern(`user:${userId}`)
    } else {
      simpleCache.invalidatePattern('user:')
    }
  },
  
  // Video cache management
  invalidateVideos: () => {
    simpleCache.invalidatePattern('videos')
  },
  
  invalidateVideoDetail: (videoId: string) => {
    simpleCache.delete(`video:${videoId}`)
  },
  
  // Credits cache
  setCreditCache: (userId: string, credits: number) => {
    simpleCache.set(`user:${userId}:credits`, credits, 2 * 60 * 1000) // 2 minutes
  },
  
  getCreditCache: (userId: string): number | null => {
    return simpleCache.get(`user:${userId}:credits`)
  },
  
  // Profile cache
  setProfileCache: (userId: string, profile: any) => {
    simpleCache.set(`user:${userId}:profile`, profile, 5 * 60 * 1000) // 5 minutes
  },
  
  getProfileCache: (userId: string): any | null => {
    return simpleCache.get(`user:${userId}:profile`)
  },
}

/**
 * Cache-aware fetch wrapper
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000
): Promise<T> {
  // Check cache first
  const cached = simpleCache.get(key)
  if (cached) {
    return cached
  }
  
  // Fetch and cache
  const data = await fetcher()
  simpleCache.set(key, data, ttlMs)
  return data
}

/**
 * Background refresh utilities
 */
export const backgroundRefresh = {
  // Refresh user data in background
  refreshUserData: async (userId: string, fetchers: {
    profile?: () => Promise<any>
    credits?: () => Promise<number>
    videos?: () => Promise<any[]>
  }) => {
    const promises: Promise<void>[] = []
    
    if (fetchers.profile) {
      promises.push(
        fetchers.profile()
          .then(data => cacheUtils.setProfileCache(userId, data))
          .catch(error => console.warn('Background profile refresh failed:', error))
      )
    }
    
    if (fetchers.credits) {
      promises.push(
        fetchers.credits()
          .then(credits => cacheUtils.setCreditCache(userId, credits))
          .catch(error => console.warn('Background credits refresh failed:', error))
      )
    }
    
    await Promise.allSettled(promises)
  },
}
