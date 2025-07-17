'use server'

import { createClient } from '@/utils/supabase/server'
import { createServiceRoleClient } from '@/utils/supabase/service-role'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { generatePrintHeshUrl } from '@/lib/invoices'
import { requestHypaySignature, sanitizeParams } from '@/lib/hypay-crypto'
import { paymentLogger } from '@/lib/payment-logger'
import { getHypayConfig, logTestEnvironmentStatus, createTestModePayment } from '@/lib/hypay-test-utils'
import { IdempotencyService, withIdempotency } from '@/lib/idempotency'

// Get Hypay configuration (automatically switches between test/production)
const HYPAY_CONFIG = getHypayConfig()

// Log environment status on module load
logTestEnvironmentStatus()

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
 * Generate secure Hypay payment URL using APISign Step 1
 */
async function generateSecureHypayUrl(
  creditPack: CreditPack,
  clientData: HypayClientData,
  paymentId: string
): Promise<string> {
  // Prepare payment parameters
  const paymentParams = {
    // Core Hypay parameters
    Masof: HYPAY_CONFIG.masof,
    UserId: HYPAY_CONFIG.userId,
    
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
    Sign: 'True', // Enable signature verification
    MoreData: 'True', // Get enhanced transaction information
    pageTimeOut: 'True', // 20-minute payment page timeout
    sendemail: 'True', // Send payment confirmation email to customer
    
    // Success and failure callback URLs
    SuccessUrl: 'https://kalil.pro/api/payments/hypay/success',
    FailureUrl: 'https://kalil.pro/api/payments/hypay/failure',
    
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
    blockItemValidation: 'True', // Strict validation of item totals
    heshDesc: `[0~${creditPack.name}~1~${creditPack.price_nis}]`, // Item description
  }

  // Sanitize parameters
  const sanitizedParams = sanitizeParams(paymentParams)

  try {
    // Step 1: Request signature from Hypay using APISign
    const { signedParams, signature } = await requestHypaySignature(sanitizedParams, {
      ...HYPAY_CONFIG,
      testMode: HYPAY_CONFIG.testMode
    })

    // Step 2: Generate the final payment URL with signature
    const finalParams = new URLSearchParams({
      action: 'pay',
      ...signedParams,
      signature: signature
    })

    return `${HYPAY_CONFIG.baseUrl}?${finalParams.toString()}`
  } catch (error) {
    console.error('Failed to generate secure payment URL:', error)
    throw new Error(`Payment URL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
} 

/**
 * Create a payment record in the database
 */
async function createPaymentRecord(
  userId: string,
  creditPackId: string,
  amount: number,
  paymentUrl: string, // New parameter for the payment URL
  idempotencyKey?: string
): Promise<string> {
  const supabase = await createClient()
  
  // Prepare payment data
  const paymentData: any = {
    user_id: userId,
    credit_pack_id: creditPackId,
    amount: amount,
    status: 'pending',
    payment_url: paymentUrl,
    idempotency_key: idempotencyKey
  }

  // Add test mode flag if in test environment (graceful fallback if column doesn't exist)
  if (HYPAY_CONFIG.testMode) {
    paymentData.test_mode = true
    console.log('Creating test mode payment record')
  }
  
  const { data, error } = await supabase
    .from('payments')
    .insert(paymentData)
    .select('id')
    .single()

  if (error) {
    // If test_mode column doesn't exist, try without it
    if (error.message?.includes('test_mode') && HYPAY_CONFIG.testMode) {
      console.log('test_mode column not found, retrying without it...')
      delete paymentData.test_mode
      
      const { data: retryData, error: retryError } = await supabase
        .from('payments')
        .insert(paymentData)
        .select('id')
        .single()
        
      if (retryError) {
        console.error('Error creating payment record (retry):', retryError)
        throw new Error(`Failed to create payment record: ${retryError.message}`)
      }
      
      console.log(`✅ Created payment record (without test_mode): ${retryData.id}`)
      return retryData.id
    }
    
    console.error('Error creating payment record:', error)
    console.error('Payment data:', paymentData)
    throw new Error(`Failed to create payment record: ${error.message}`)
  }

  // Log test payment creation if in test mode
  if (HYPAY_CONFIG.testMode) {
    console.log(`✅ Created test payment record: ${data.id}`)
  }

  return data.id
}

/**
 * Server action to initiate Hypay payment with idempotency
 */
export async function initiateHypayPayment(
  creditPackId: string,
  idempotencyKey?: string
): Promise<{ paymentUrl: string }> {
  const finalIdempotencyKey = idempotencyKey || IdempotencyService.generateIdempotencyKey()
  
  const requestParams = {
    creditPackId,
    action: 'initiate_payment',
    timestamp: Date.now()
  }

  return await withIdempotency(
    finalIdempotencyKey,
    requestParams,
    async () => {
      const supabase = await createClient()
      
      // 1. Authenticate user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        paymentLogger.log('error', 'payment_initiation_failed', {
          errorMessage: 'Authentication required',
          metadata: { creditPackId, idempotencyKey: finalIdempotencyKey }
        })
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

      // 4. Create payment record first to get the actual paymentId
      const paymentId = await createPaymentRecord(
        user.id,
        creditPackId,
        creditPack.price_nis,
        '', // We'll update this with the secure URL
        finalIdempotencyKey
      );

      // Log payment initiation
      paymentLogger.logPaymentInitiated(paymentId, user.id, creditPack.price_nis, creditPackId)

      // 5. Generate the secure Hypay payment URL with APISign Step 1
      const securePaymentUrl = await generateSecureHypayUrl(creditPack, clientData, paymentId);

      // 6. Update the payment record with the secure signed URL
      await supabase
        .from('payments')
        .update({ payment_url: securePaymentUrl })
        .eq('id', paymentId);

      paymentLogger.log('info', 'secure_payment_url_generated', {
        paymentId,
        userId: user.id,
        amount: creditPack.price_nis,
        metadata: { 
          creditPackId, 
          urlLength: securePaymentUrl.length,
          idempotencyKey: finalIdempotencyKey
        }
      })

      console.log('Generated secure Hypay URL:', securePaymentUrl)

      return { paymentUrl: securePaymentUrl }
    }
  )
}

/**
 * Handle successful payment callback from Hypay with transaction validation
 */
export async function handlePaymentSuccess(
  paymentId: string,
  hypayTransactionId: string,
  amount: number,
  invoiceNumber?: string,
  providerResponse?: any
) {
  // Validate transaction ID format
  if (!IdempotencyService.validateTransactionId(hypayTransactionId)) {
    paymentLogger.log('error', 'invalid_transaction_id', {
      paymentId,
      transactionId: hypayTransactionId,
      errorMessage: 'Invalid transaction ID format'
    })
    throw new Error('Invalid transaction ID format')
  }
  // Use service role client to bypass RLS for external callback
  const supabase = createServiceRoleClient()
  console.log(`[handlePaymentSuccess] Processing paymentId: ${paymentId}`)

  // Check for duplicate transaction ID
  const { data: existingTransaction, error: duplicateError } = await supabase
    .from('payments')
    .select('id, status')
    .eq('hypay_transaction_id', hypayTransactionId)
    .neq('id', paymentId) // Exclude current payment
    .single()

  if (duplicateError && duplicateError.code !== 'PGRST116') {
    throw duplicateError
  }

  if (existingTransaction) {
    paymentLogger.log('error', 'duplicate_transaction_id', {
      paymentId,
      transactionId: hypayTransactionId,
      errorMessage: 'Transaction ID already exists for different payment',
      metadata: {
        existingPaymentId: existingTransaction.id,
        existingStatus: existingTransaction.status
      }
    })
    throw new Error('Duplicate transaction ID detected')
  }

  // Log payment success callback received
  paymentLogger.logPaymentSuccess(paymentId, hypayTransactionId, amount, invoiceNumber)

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
    
    // Check if transaction ID already exists for a different payment
    const { data: existingTransaction, error: transactionCheckError } = await supabase
      .from('payments')
      .select('id, status')
      .eq('hypay_transaction_id', hypayTransactionId)
      .neq('id', paymentId)
      .single()
    
    if (existingTransaction) {
      console.warn(`[handlePaymentSuccess] Transaction ${hypayTransactionId} already exists for payment ${existingTransaction.id}`)
      throw new Error(`Transaction ID ${hypayTransactionId} already exists for a different payment`)
    }
    
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        hypay_transaction_id: hypayTransactionId,
        provider_response: providerResponse,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select('user_id, credit_pack_id')
      .single()

    if (updateError) {
      console.error(`[handlePaymentSuccess] Error updating payment ${paymentId} status:`, updateError)
      
      // Check if the payment still exists after failed update
      const { data: checkPayment, error: checkError } = await supabase
        .from('payments')
        .select('id, status, hypay_transaction_id')
        .eq('id', paymentId)
        .single()
      
      console.log(`[handlePaymentSuccess] Payment existence check:`, { 
        exists: !!checkPayment, 
        payment: checkPayment, 
        checkError 
      })
      
      throw new Error(`Failed to update payment status for ${paymentId}: ${updateError.message}`)
    }

    // 3. Get credit pack details and add credits to user account
    const { data: creditPack, error: creditPackError } = await supabase
      .from('credit_packs')
      .select('credits_amount')
      .eq('id', updatedPayment.credit_pack_id)
      .single()

    if (creditPackError) {
      console.error(`[handlePaymentSuccess] Error fetching credit pack for payment ${paymentId}:`, creditPackError)
      paymentLogger.log('error', 'credit_pack_fetch_failed', {
        paymentId,
        errorMessage: creditPackError.message,
        metadata: {
          creditPackId: updatedPayment.credit_pack_id
        }
      })
    } else if (creditPack) {
      console.log(`[handlePaymentSuccess] Adding ${creditPack.credits_amount} credits to user ${updatedPayment.user_id}.`)
      const { error: creditsError } = await supabase.rpc('add_credits', {
        p_user_id: updatedPayment.user_id,
        p_amount: creditPack.credits_amount
      })

      if (creditsError) {
        console.error(`[handlePaymentSuccess] Error adding credits for user ${updatedPayment.user_id}:`, creditsError)
        paymentLogger.log('error', 'credits_addition_failed', {
          paymentId,
          userId: updatedPayment.user_id,
          errorMessage: creditsError.message,
          metadata: { creditsAmount: creditPack.credits_amount }
        })
        // Decide if this error should prevent success. For now, we log and continue.
      } else {
        console.log(`[handlePaymentSuccess] Credits added successfully for user ${updatedPayment.user_id}.`)
        paymentLogger.logCreditsAdded(updatedPayment.user_id, creditPack.credits_amount, paymentId)
      }
    } else {
      console.warn(`[handlePaymentSuccess] Credit pack details not found for payment ${paymentId}. Credits not added.`)
    }

    // 4. Insert or update invoice record
    const invoiceUrl = generatePrintHeshUrl(hypayTransactionId)
    if (invoiceNumber) {
      console.log(`[handlePaymentSuccess] Upserting invoice for payment ${paymentId} with invoice number: ${invoiceNumber}.`)
      const { error: invoiceError } = await supabase
        .from('invoices')
        .upsert({
          payment_id: paymentId,
          invoice_number: invoiceNumber,
          invoice_url: invoiceUrl,
          status: 'generated',
          provider_response: providerResponse,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'payment_id'
        })

      if (invoiceError) {
        console.error(`[handlePaymentSuccess] Error upserting invoice for payment ${paymentId}:`, invoiceError)
        paymentLogger.log('error', 'invoice_generation_failed', {
          paymentId,
          transactionId: hypayTransactionId,
          errorMessage: invoiceError.message,
          metadata: {
            invoiceNumber,
            invoiceUrl: invoiceUrl.substring(0, 100) + '...'
          }
        })
        // Don't throw error - invoice generation failure shouldn't stop the payment process
        console.warn(`[handlePaymentSuccess] Continuing without invoice for payment ${paymentId}`)
      } else {
        console.log(`[handlePaymentSuccess] Invoice record saved for payment ${paymentId}.`)
        paymentLogger.logInvoiceGenerated(paymentId, invoiceNumber, invoiceUrl)
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

  // Log payment failure
  const errorCode = providerResponse?.CCode || 'unknown'
  paymentLogger.logPaymentFailure(paymentId, errorCode, failureReason, providerResponse?.Id)

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
