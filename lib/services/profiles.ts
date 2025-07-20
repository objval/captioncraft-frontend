import { supabaseManager } from "@/lib/database/supabase-manager"
import type { UserProfile } from "@/lib/api/api"

/**
 * Get current user's profile directly from Supabase
 */
export async function getUserProfile(): Promise<UserProfile> {
  return supabaseManager.authenticatedQuery(async (client, userId) => {
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error fetching user profile:", error)
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }

    return data
  })
}

/**
 * Update current user's profile
 */
export async function updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
  return supabaseManager.authenticatedQuery(async (client, userId) => {
    const { data, error } = await client
      .from("profiles")
      .update(profileData)
      .eq("id", userId)
      .select("*")
      .single()

    if (error) {
      console.error("Error updating user profile:", error)
      throw new Error(`Failed to update profile: ${error.message}`)
    }

    return data
  })
}

/**
 * Subscribe to profile changes for real-time updates
 */
export function subscribeToUserProfile(
  userId: string,
  onUpdate: (profile: UserProfile) => void
) {
  return supabaseManager.createSubscription(
    "profiles",
    (payload) => {
      onUpdate(payload.new as UserProfile)
    },
    `id=eq.${userId}`,
    "UPDATE"
  )
}

/**
 * Check if user profile is complete (has required fields for payments)
 */
export async function isProfileComplete(): Promise<boolean> {
  try {
    const profile = await getUserProfile()
    
    return !!(
      profile.first_name &&
      profile.last_name &&
      profile.phone_number &&
      profile.street &&
      profile.city &&
      profile.zip_code
    )
  } catch (error) {
    console.error("Error checking profile completeness:", error)
    return false
  }
}
