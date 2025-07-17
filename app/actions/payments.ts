'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Hypay credentials from your docs
const HYPAY_CONFIG = {
  masof: '4501961334',
  userId: '2005822', // Your fixed UserId from docs
  passP: 'vxvxfvfx456',
  baseUrl: 'https://pay.hyp.co.il/p/'
}

interface HypayClientData {
  clientName: string
  clientLName: string
  email: string
  phone: string
  street: string
  city: string
  zip: string
}

interface CreditPack {
  id: string
  name: string
  credits_amount: number
  price_nis: number
}

/**
 * Extract client data from user's auth metadata
 */
async function getClientDataFromAuth(): Promise<HypayClientData> {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('User not authenticated')
  }

  // Get client data from auth metadata (stored during signup)
  const metadata = user.user_metadata || {}
  
  // Extract data from metadata or fallback to profile table
  let clientData: Partial<HypayClientData> = {
    clientName: metadata.first_name || '',
    clientLName: metadata.last_name || '',
    email: user.email || '',
    phone: metadata.phone_number || '',
    street: metadata.street || '',
    city: metadata.city || '',
    zip: metadata.zip_code || ''
  }

  // If metadata is incomplete, fetch from profiles table
  if (!clientData.clientName || !clientData.street) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, phone_number, street, city, zip_code')
      .eq('id', user.id)
      .single()

    if (!profileError && profile) {
      clientData = {
        clientName: profile.first_name || clientData.clientName || '',
        clientLName: profile.last_name || clientData.clientLName || '',
        email: user.email || '',
        phone: profile.phone_number || clientData.phone || '',
        street: profile.street || clientData.street || '',
        city: profile.city || clientData.city || '',
        zip: profile.zip_code || clientData.zip || ''
      }
    }
  }

  // Validate required fields
  if (!clientData.clientName || !clientData.email) {
    throw new Error('Profile information incomplete. Please complete your profile.')
  }

  return clientData as HypayClientData
}

/**
 * Generate Hypay payment URL with all required parameters
 */
function generateHypayUrl(
  creditPack: CreditPack,
  clientData: HypayClientData,
  paymentId: string
): string {
  const params = new URLSearchParams({
    // Core Hypay parameters
    action: 'pay',
    Masof: HYPAY_CONFIG.masof,
    UserId: HYPAY_CONFIG.userId,
    PassP: HYPAY_CONFIG.passP,
    
    // Transaction details
    Order: paymentId, // Use our payment ID as order reference
    Info: creditPack.name,
    Amount: creditPack.price_nis.toString(),
    Coin: '1', // ILS
    
    // Payment options
    Tash: '1', // Max 1 payment (immediate)
    FixTash: 'False',
    
    // Technical parameters
    UTF8: 'True',
    UTF8out: 'True',
    pageTimeOut: 'True', // Recommended by Hypay for 20-minute timeout
    sendemail: 'True', // Send payment confirmation email to customer
    
    // Client information
    ClientName: clientData.clientName,
    ClientLName: clientData.clientLName,
    email: clientData.email,
    phone: clientData.phone,
    street: clientData.street,
    city: clientData.city,
    zip: clientData.zip,
    
    // EzCount invoice parameters for automatic invoice generation
    SendHesh: 'True', // Send invoice by email
    Pritim: 'True', // Invoice contains items
    heshDesc: `[0~${creditPack.name}~1~${creditPack.price_nis}]`, // Item description
  })

  return `${HYPAY_CONFIG.baseUrl}?${params.toString()}`
} 

/**
 * Create a payment record in the database
 */
async function createPaymentRecord(
  userId: string,
  creditPackId: string,
  amount: number,
  paymentUrl: string // New parameter for the payment URL
): Promise<string> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      credit_pack_id: creditPackId,
      amount: amount,
      status: 'pending',
      payment_url: paymentUrl // Store the payment URL
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating payment record:', error)
    throw new Error('Failed to create payment record')
  }

  return data.id
}

/**
 * Server action to initiate Hypay payment
 */
export async function initiateHypayPayment(creditPackId: string): Promise<{ paymentUrl: string }> {
  try {
    const supabase = await createClient()
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Authentication required')
    }

    // 2. Fetch credit pack details
    const { data: creditPack, error: packError } = await supabase
      .from('credit_packs')
      .select('*')
      .eq('id', creditPackId)
      .single()

    if (packError || !creditPack) {
      throw new Error('Credit pack not found')
    }

    // 3. Get client data from auth metadata
    const clientData = await getClientDataFromAuth()

    // 4. Create payment record with a temporary paymentId for URL generation
    // The actual paymentId will be generated by Supabase, so we'll update the URL later.
    const tempPaymentId = crypto.randomUUID(); // Generate a temporary UUID
    const tempPaymentUrl = generateHypayUrl(creditPack, clientData, tempPaymentId);

    const paymentId = await createPaymentRecord(
      user.id,
      creditPackId,
      creditPack.price_nis,
      tempPaymentUrl // Store the temporary URL initially
    );

    // 5. Generate the final Hypay payment URL with the actual paymentId
    const finalPaymentUrl = generateHypayUrl(creditPack, clientData, paymentId);

    // 6. Update the payment record with the final URL
    await supabase
      .from('payments')
      .update({ payment_url: finalPaymentUrl })
      .eq('id', paymentId);

    console.log('Generated Hypay URL:', finalPaymentUrl)

    return { paymentUrl: finalPaymentUrl }

  } catch (error) {
    console.error('Payment initiation error:', error)
    throw new Error(error instanceof Error ? error.message : 'Payment initiation failed')
  }
}

/**
 * Handle successful payment callback from Hypay
 */
export async function handlePaymentSuccess(
  paymentId: string,
  hypayTransactionId: string,
  amount: number,
  invoiceNumber?: string,
  providerResponse?: any
) {
  const supabase = await createClient()
  console.log(`[handlePaymentSuccess] Processing paymentId: ${paymentId}`)

  try {
    // 1. Check current payment status for idempotency
    const { data: existingPayment, error: fetchError } = await supabase
      .from('payments')
      .select('status, user_id, credit_pack_id, credit_packs(credits_amount)')
      .eq('id', paymentId)
      .single()

    if (fetchError) {
      console.error(`[handlePaymentSuccess] Error fetching payment ${paymentId}:`, fetchError)
      throw new Error(`Failed to retrieve payment record for ${paymentId}`)
    }

    if (!existingPayment) {
      console.warn(`[handlePaymentSuccess] Payment record ${paymentId} not found.`)
      throw new Error(`Payment record ${paymentId} not found.`)
    }

    if (existingPayment.status === 'succeeded') {
      console.log(`[handlePaymentSuccess] Payment ${paymentId} already succeeded. Skipping.`)
      return { success: true, message: 'Payment already processed.' }
    }

    // 2. Update payment status to succeeded
    console.log(`[handlePaymentSuccess] Updating status for payment ${paymentId} to 'succeeded'.`)
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        hypay_transaction_id: hypayTransactionId,
        provider_response: providerResponse,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select('user_id, credit_pack_id, credit_packs(credits_amount)')
      .single()

    if (updateError) {
      console.error(`[handlePaymentSuccess] Error updating payment ${paymentId} status:`, updateError)
      throw new Error(`Failed to update payment status for ${paymentId}`)
    }

    // 3. Add credits to user account
    const creditPack = Array.isArray(updatedPayment.credit_packs)
      ? updatedPayment.credit_packs[0]
      : updatedPayment.credit_packs

    if (creditPack) {
      console.log(`[handlePaymentSuccess] Adding ${creditPack.credits_amount} credits to user ${updatedPayment.user_id}.`)
      const { error: creditsError } = await supabase.rpc('add_credits', {
        p_user_id: updatedPayment.user_id,
        p_amount: creditPack.credits_amount
      })

      if (creditsError) {
        console.error(`[handlePaymentSuccess] Error adding credits for user ${updatedPayment.user_id}:`, creditsError)
        // Decide if this error should prevent success. For now, we log and continue.
      } else {
        console.log(`[handlePaymentSuccess] Credits added successfully for user ${updatedPayment.user_id}.`)
      }
    } else {
      console.warn(`[handlePaymentSuccess] Credit pack details not found for payment ${paymentId}. Credits not added.`)
    }

    // 4. Create invoice record if invoice number provided
    if (invoiceNumber) {
      console.log(`[handlePaymentSuccess] Creating invoice record for payment ${paymentId} with invoice number: ${invoiceNumber}.`)
      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          payment_id: paymentId,
          invoice_number: invoiceNumber,
          status: 'generated',
          provider_response: providerResponse
        })

      if (invoiceError) {
        console.error(`[handlePaymentSuccess] Error creating invoice record for payment ${paymentId}:`, invoiceError)
        // Decide if this error should prevent success. For now, we log and continue.
      } else {
        console.log(`[handlePaymentSuccess] Invoice record created for payment ${paymentId}.`)
      }
    } else {
      console.log(`[handlePaymentSuccess] No invoice number provided for payment ${paymentId}. Skipping invoice record creation.`)
    }

    // 5. Revalidate relevant pages
    console.log(`[handlePaymentSuccess] Revalidating paths for /dashboard/credits and /dashboard/profile.`)
    revalidatePath('/dashboard/credits')
    revalidatePath('/dashboard/profile')

    console.log(`[handlePaymentSuccess] Payment ${paymentId} successfully processed.`)
    return { success: true, message: 'Payment processed successfully.' }

  } catch (error) {
    console.error(`[handlePaymentSuccess] Critical error processing payment ${paymentId}:`, error)
    throw error // Re-throw to ensure the calling API route knows about the failure
  }
}

/**
 * Handle failed payment callback from Hypay
 */
export async function handlePaymentFailure(
  paymentId: string,
  failureReason: string, // Renamed from errorCode for clarity
  providerResponse?: any
) {
  const supabase = await createClient()
  console.log(`[handlePaymentFailure] Processing paymentId: ${paymentId} with reason: ${failureReason}`)

  try {
    // 1. Check current payment status to avoid unnecessary updates
    const { data: existingPayment, error: fetchError } = await supabase
      .from('payments')
      .select('status')
      .eq('id', paymentId)
      .single()

    if (fetchError) {
      console.error(`[handlePaymentFailure] Error fetching payment ${paymentId}:`, fetchError)
      throw new Error(`Failed to retrieve payment record for ${paymentId}`)
    }

    if (!existingPayment) {
      console.warn(`[handlePaymentFailure] Payment record ${paymentId} not found.`)
      throw new Error(`Payment record ${paymentId} not found.`)
    }

    if (existingPayment.status === 'failed') {
      console.log(`[handlePaymentFailure] Payment ${paymentId} already marked as failed. Skipping.`)
      return { success: true, message: 'Payment already marked as failed.' }
    }
    if (existingPayment.status === 'succeeded') {
      console.warn(`[handlePaymentFailure] Attempted to mark succeeded payment ${paymentId} as failed. Skipping.`)
      return { success: false, message: 'Cannot mark succeeded payment as failed.' }
    }

    // 2. Update payment status to failed
    console.log(`[handlePaymentFailure] Updating status for payment ${paymentId} to 'failed'.`)
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        provider_response: {
          failure_reason: failureReason,
          ...providerResponse
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)

    if (updateError) {
      console.error(`[handlePaymentFailure] Error updating payment ${paymentId} status to failed:`, updateError)
      throw new Error(`Failed to update payment status for ${paymentId}`)
    }

    // 3. Revalidate relevant pages
    console.log(`[handlePaymentFailure] Revalidating path for /dashboard/credits.`)
    revalidatePath('/dashboard/credits')

    console.log(`[handlePaymentFailure] Payment ${paymentId} successfully marked as failed.`)
    return { success: true, message: 'Payment marked as failed.' }

  } catch (error) {
    console.error(`[handlePaymentFailure] Critical error processing payment ${paymentId} failure:`, error)
    throw error // Re-throw to ensure the calling API route knows about the failure
  }
}
