import { createClient } from '@/lib/database/supabase/client'

export interface ProfileData {
  firstName: string
  lastName: string
  phoneNumber: string
  street: string
  city: string
  zipCode: string
}

/**
 * Create or update user profile with complete information
 * This function handles both new profile creation and updates
 */
export async function createOrUpdateProfile(userId: string, email: string, profileData: ProfileData) {
  const supabase = createClient()

  // First, wait for user to be properly authenticated
  let retries = 3
  let authUser = null
  
  while (retries > 0 && !authUser) {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (user && user.id === userId) {
      authUser = user
      break
    }
    console.log('Waiting for authentication...', retries)
    await new Promise(resolve => setTimeout(resolve, 500))
    retries--
  }
  
  if (!authUser) {
    console.log('User not authenticated, skipping profile creation')
    return false
  }

  // Check if profile exists (with retries for trigger timing)
  let existingProfile = null
  retries = 3
  
  while (retries > 0) {
    const { data, error: checkError } = await supabase
      .from('profiles')
      .select('id, credits, first_name, last_name')
      .eq('id', userId)
      .single()

    if (data) {
      existingProfile = data
      break
    } else if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking profile:', checkError)
      if (retries === 1) {
        throw new Error('Failed to check existing profile')
      }
    }
    
    console.log('Profile not found, waiting for trigger...', retries)
    await new Promise(resolve => setTimeout(resolve, 1000))
    retries--
  }

  const profilePayload = {
    first_name: profileData.firstName.trim(),
    last_name: profileData.lastName.trim(),
    phone_number: profileData.phoneNumber.trim(),
    street: profileData.street.trim(),
    city: profileData.city.trim(),
    zip_code: profileData.zipCode.trim(),
  }

  if (existingProfile) {
    // Profile exists (created by trigger), just update the additional fields
    const { error: updateError } = await supabase
      .from('profiles')
      .update(profilePayload)
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      throw new Error('Failed to update profile')
    }

    console.log('Profile updated successfully with user data')
  } else {
    // Profile doesn't exist, create it (fallback if trigger failed)
    console.log('Trigger didn\'t create profile, creating manually...')
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        ...profilePayload,
        credits: 50 // Ensure welcome credits
      })

    if (insertError) {
      console.error('Error creating profile:', insertError)
      throw new Error('Failed to create profile')
    }

    // Also create the welcome bonus transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount_changed: 50,
        reason: 'welcome_bonus'
      })

    if (transactionError) {
      console.error('Error creating welcome bonus transaction:', transactionError)
      // Don't throw error here as profile creation succeeded
    }

    console.log('Profile created successfully with welcome credits')
  }

  return true
}

/**
 * Check if profile exists and is complete
 */
export async function checkProfileCompleteness(userId: string) {
  const supabase = createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('first_name, last_name, phone_number, street, city, zip_code, credits')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error checking profile completeness:', error)
    return { exists: false, complete: false, credits: 0 }
  }

  const isComplete = !!(
    profile.first_name &&
    profile.last_name &&
    profile.phone_number &&
    profile.street &&
    profile.city &&
    profile.zip_code
  )

  return {
    exists: true,
    complete: isComplete,
    credits: profile.credits || 0,
    profile
  }
}

/**
 * Ensure user has welcome credits
 */
export async function ensureWelcomeCredits(userId: string) {
  const supabase = createClient()

  // Check if user already has welcome bonus
  const { data: existingTransaction, error: checkError } = await supabase
    .from('credit_transactions')
    .select('id')
    .eq('user_id', userId)
    .eq('reason', 'welcome_bonus')
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking welcome credits:', checkError)
    return false
  }

  if (existingTransaction) {
    console.log('User already has welcome credits')
    return true
  }

  // Add welcome credits
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ credits: 50 })
    .eq('id', userId)

  if (updateError) {
    console.error('Error adding welcome credits to profile:', updateError)
    return false
  }

  // Record the transaction
  const { error: transactionError } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount_changed: 50,
      reason: 'welcome_bonus'
    })

  if (transactionError) {
    console.error('Error recording welcome bonus transaction:', transactionError)
    return false
  }

  console.log('Welcome credits added successfully')
  return true
}
