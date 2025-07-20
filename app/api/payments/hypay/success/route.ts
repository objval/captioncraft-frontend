import { NextRequest, NextResponse } from 'next/server'
import { handlePaymentSuccess } from '@/app/actions/payments'
import { verifyPaymentCallback } from '@/lib/payments/hypay/crypto'
import { paymentLogger } from '@/lib/payments/payment-logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Expected parameters from Hypay
    const orderId = searchParams.get('Order')
    const transactionId = searchParams.get('Id')
    const amount = searchParams.get('Amount')
    const ccodeRaw = searchParams.get('CCode')
    const ccode = ccodeRaw ? ccodeRaw.trim() : null
    const hesh = searchParams.get('Hesh')
    const signature = searchParams.get('Sign')

    // Validate basic parameters
    if (!orderId || !transactionId || !amount || ccode !== '0') {
      console.error('Invalid success callback parameters:', {
        orderId,
        transactionId,
        amount,
        ccode
      })
      const failureUrl = new URL('/dashboard/payment/failure', request.url)
      failureUrl.searchParams.set('CCode', ccode || '')
      failureUrl.searchParams.set('ErrMsg', 'Invalid callback parameters')
      return NextResponse.redirect(failureUrl)
    }

    // Collect all callback parameters for verification
    const callbackParams = Object.fromEntries(searchParams.entries())
    
    // Log callback received
    paymentLogger.logCallbackReceived('success', callbackParams, request)
    
    // Verify callback signature using APISign Step 4
    const hypayConfig = {
      masof: process.env.HYPAY_MASOF!,
      apiKey: process.env.HYPAY_API_KEY!,
      passP: process.env.HYPAY_PASS_P!,
      baseUrl: process.env.HYPAY_BASE_URL!
    }

    console.log('Verifying payment callback signature...')
    const verificationResult = await verifyPaymentCallback(callbackParams, hypayConfig)

    if (!verificationResult.isValid) {
      console.error('Payment callback signature verification failed:', verificationResult.error)
      paymentLogger.logSignatureVerification(false, orderId, transactionId, verificationResult.error, request)
      const failureUrl = new URL('/dashboard/payment/failure', request.url)
      failureUrl.searchParams.set('CCode', '902') // Authentication error
      failureUrl.searchParams.set('ErrMsg', 'Signature verification failed')
      return NextResponse.redirect(failureUrl)
    }

    console.log('Payment callback signature verified successfully')
    paymentLogger.logSignatureVerification(true, orderId, transactionId, undefined, request)
    console.log('Processing payment success callback:', callbackParams)

    await handlePaymentSuccess(
      orderId,
      transactionId,
      parseFloat(amount),
      hesh || undefined,
      callbackParams
    )

    const redirectUrl = new URL('/dashboard/payment/success', request.url)
    redirectUrl.search = searchParams.toString()
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Error processing payment success callback:', error)
    paymentLogger.logAPIError('payment_success_callback', error instanceof Error ? error : new Error('Unknown error'), undefined, request)
    return NextResponse.json({ status: 'error', message: 'Failed to process payment success callback' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Handle POST callbacks if Hypay uses POST instead of GET
  return await GET(request)
}
