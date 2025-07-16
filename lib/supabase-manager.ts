import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

/**
 * Centralized Supabase client with auth caching
 */
class SupabaseManager {
  private client = createClient()
  private currentUser: User | null = null
  private userPromise: Promise<User | null> | null = null

  /**
   * Get authenticated user with caching to avoid multiple auth calls
   */
  async getAuthenticatedUser(): Promise<User> {
    if (this.currentUser) {
      return this.currentUser
    }

    if (this.userPromise) {
      const user = await this.userPromise
      if (user) return user
    }

    this.userPromise = this.fetchUser()
    const user = await this.userPromise
    this.userPromise = null

    if (!user) {
      throw new Error("User not authenticated")
    }

    return user
  }

  private async fetchUser(): Promise<User | null> {
    const { data: { user }, error } = await this.client.auth.getUser()
    
    if (error) {
      console.error("Auth error:", error)
      return null
    }

    this.currentUser = user
    return user
  }

  /**
   * Clear cached user (call on logout or auth changes)
   */
  clearUserCache(): void {
    this.currentUser = null
    this.userPromise = null
  }

  /**
   * Get the Supabase client instance
   */
  getClient() {
    return this.client
  }

  /**
   * Execute a query with automatic user authentication
   */
  async authenticatedQuery<T>(
    queryFn: (client: ReturnType<typeof createClient>, userId: string) => Promise<T>
  ): Promise<T> {
    const user = await this.getAuthenticatedUser()
    return queryFn(this.client, user.id)
  }

  /**
   * Create a subscription with user-specific filtering
   */
  createUserSubscription(
    table: string,
    userId: string,
    callback: (payload: any) => void,
    event: "INSERT" | "UPDATE" | "DELETE" | "*" = "*"
  ) {
    const channel = this.client
      .channel(`${table}:user_id=eq.${userId}`)
      .on(
        "postgres_changes" as any,
        {
          event,
          schema: "public",
          table,
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe()

    return () => {
      this.client.removeChannel(channel)
    }
  }

  /**
   * Create a general subscription (not user-specific)
   */
  createSubscription(
    table: string,
    callback: (payload: any) => void,
    filter?: string,
    event: "INSERT" | "UPDATE" | "DELETE" | "*" = "*"
  ) {
    const channelName = filter ? `${table}:${filter}` : table
    
    const channel = this.client
      .channel(channelName)
      .on(
        "postgres_changes" as any,
        {
          event,
          schema: "public",
          table,
          ...(filter && { filter }),
        },
        callback
      )
      .subscribe()

    return () => {
      this.client.removeChannel(channel)
    }
  }
}

// Export singleton instance
export const supabaseManager = new SupabaseManager()

// Listen to auth state changes to clear cache
supabaseManager.getClient().auth.onAuthStateChange(() => {
  supabaseManager.clearUserCache()
})
