import { createClient } from "@/lib/supabase"

/**
 * Get user's current credit balance directly from Supabase
 */
export async function getUserCredits(): Promise<number> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single()

  if (error) {
    console.error("Error fetching user credits:", error)
    throw new Error(`Failed to fetch credits: ${error.message}`)
  }

  return data?.credits || 0
}

/**
 * Update user's credit balance (for admin operations)
 */
export async function updateUserCredits(userId: string, credits: number): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("profiles")
    .update({ credits })
    .eq("id", userId)

  if (error) {
    console.error("Error updating user credits:", error)
    throw new Error(`Failed to update credits: ${error.message}`)
  }
}

/**
 * Add credits to user's balance (uses database function for atomic operation)
 */
export async function addUserCredits(userId: string, amount: number): Promise<number> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .rpc("add_credits", {
      p_user_id: userId,
      p_amount: amount
    })

  if (error) {
    console.error("Error adding user credits:", error)
    throw new Error(`Failed to add credits: ${error.message}`)
  }

  return data
}

/**
 * Deduct credits from user's balance (for video processing)
 */
export async function deductUserCredits(amount: number): Promise<number> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  // First check if user has enough credits
  const currentCredits = await getUserCredits()
  if (currentCredits < amount) {
    throw new Error("Insufficient credits")
  }

  // Deduct credits using atomic operation
  const { data, error } = await supabase
    .rpc("add_credits", {
      p_user_id: user.id,
      p_amount: -amount
    })

  if (error) {
    console.error("Error deducting user credits:", error)
    throw new Error(`Failed to deduct credits: ${error.message}`)
  }

  return data
}

/**
 * Subscribe to credit balance changes for real-time updates
 */
export function subscribeToUserCredits(
  userId: string,
  onUpdate: (credits: number) => void
) {
  const supabase = createClient()
  
  const channel = supabase
    .channel(`credits:profile_id=eq.${userId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "profiles",
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload.new.credits || 0)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
