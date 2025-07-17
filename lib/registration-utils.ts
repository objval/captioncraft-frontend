/**
 * User registration utilities and verification
 */

import { createClient } from "@/utils/supabase/client"

/**
 * Verify that a user has received their welcome credits
 */
export async function verifyWelcomeCredits(userId: string): Promise<{
  hasCredits: boolean
  creditAmount: number
  hasWelcomeTransaction: boolean
}> {
  const supabase = createClient()
  
  try {
    // Check user's current credits
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single()
    
    if (profileError) {
      console.error("Error checking user credits:", profileError)
      return { hasCredits: false, creditAmount: 0, hasWelcomeTransaction: false }
    }
    
    // Check for welcome bonus transaction
    const { data: welcomeTransaction, error: transactionError } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("reason", "welcome_bonus")
      .eq("amount_changed", 50)
      .single()
    
    if (transactionError && transactionError.code !== 'PGRST116') {
      console.error("Error checking welcome transaction:", transactionError)
    }
    
    return {
      hasCredits: profile.credits >= 50,
      creditAmount: profile.credits || 0,
      hasWelcomeTransaction: !!welcomeTransaction
    }
  } catch (error) {
    console.error("Error verifying welcome credits:", error)
    return { hasCredits: false, creditAmount: 0, hasWelcomeTransaction: false }
  }
}

/**
 * Manually add welcome credits if automatic system failed
 * Use this as a fallback only
 */
export async function manuallyAddWelcomeCredits(userId: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    // First check if user already has welcome credits
    const verification = await verifyWelcomeCredits(userId)
    
    if (verification.hasWelcomeTransaction) {
      console.log("User already has welcome credits")
      return true
    }
    
    // Add 50 credits manually
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        credits: verification.creditAmount + 50 
      })
      .eq("id", userId)
    
    if (updateError) {
      console.error("Error updating user credits:", updateError)
      return false
    }
    
    // Record the transaction
    const { error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: userId,
        amount_changed: 50,
        reason: "welcome_bonus_manual"
      })
    
    if (transactionError) {
      console.error("Error recording welcome transaction:", transactionError)
      return false
    }
    
    console.log("Successfully added manual welcome credits for user:", userId)
    return true
  } catch (error) {
    console.error("Error in manual welcome credits:", error)
    return false
  }
}

/**
 * Get user's total credit history
 */
export async function getUserCreditHistory(userId: string) {
  const supabase = createClient()
  
  try {
    const { data: transactions, error } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("Error fetching credit history:", error)
      return []
    }
    
    return transactions || []
  } catch (error) {
    console.error("Error in getUserCreditHistory:", error)
    return []
  }
}

/**
 * Database health check - verify the trigger is working
 * Simplified version that checks based on user data
 */
export async function checkRegistrationSystem(): Promise<{
  triggerExists: boolean
  functionExists: boolean
  status: string
}> {
  const supabase = createClient()
  
  try {
    // Check if recent users have welcome bonuses (indicates system is working)
    const { data: recentUsers, error } = await supabase
      .from('credit_transactions')
      .select('user_id, reason, amount_changed, created_at')
      .eq('reason', 'welcome_bonus')
      .eq('amount_changed', 50)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(5)
    
    if (error) {
      console.error("Error checking recent welcome bonuses:", error)
      return {
        triggerExists: false,
        functionExists: false,
        status: "Error checking system - check manually in database"
      }
    }
    
    const hasRecentWelcomeBonuses = recentUsers && recentUsers.length > 0
    
    return {
      triggerExists: hasRecentWelcomeBonuses,
      functionExists: hasRecentWelcomeBonuses,
      status: hasRecentWelcomeBonuses 
        ? "System appears to be working - recent users received welcome bonuses" 
        : "No recent welcome bonuses found - may need setup or testing"
    }
  } catch (error) {
    console.error("Error checking registration system:", error)
    return {
      triggerExists: false,
      functionExists: false,
      status: "Error checking system - check manually"
    }
  }
}
