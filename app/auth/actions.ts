'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signupWithProfile(profileData: {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  street: string
  city: string
  zipCode: string
}) {
  const supabase = await createClient()

  // Create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: profileData.email,
    password: profileData.password,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (authData.user) {
    // Wait a moment for the trigger to potentially create the profile
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Use upsert to handle both insert and update cases
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: authData.user.email,
        first_name: profileData.firstName.trim(),
        last_name: profileData.lastName.trim(),
        phone_number: profileData.phoneNumber.trim(),
        street: profileData.street.trim(),
        city: profileData.city.trim(),
        zip_code: profileData.zipCode.trim(),
        credits: 50 // Ensure they get welcome credits
      })
    
    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail the signup, just log the error
    }
  }

  return { success: true }
}
