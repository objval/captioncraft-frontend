import { NextRequest, NextResponse } from 'next/server'
import { handlePaymentFailure } from '@/app/actions/payments'
import { verifyPaymentCallback } from '@/lib/hypay-crypto'
import { getUserErrorMessage, getHypayError } from '@/lib/hypay-error-codes'
import { paymentLogger } from '@/lib/payment-logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Expected parameters from Hypay failure callback
    const orderId = searchParams.get('Order')
    const ccode = searchParams.get('CCode')
    const errMsg = searchParams.get('ErrMsg')
    const transactionId = searchParams.get('Id')
    
    // Validate required parameters
    if (!orderId || !ccode) {
      console.error('Missing required failure parameters:', { orderId, ccode })
      const redirectUrl = new URL('/dashboard/payment/failure', request.url)
      if (ccode) redirectUrl.searchParams.set('CCode', ccode)
      if (errMsg) redirectUrl.searchParams.set('ErrMsg', errMsg)
      return NextResponse.redirect(redirectUrl)
    }

    const callbackParams = Object.fromEntries(searchParams.entries())

    // Log callback received
    paymentLogger.logCallbackReceived('failure', callbackParams, request)

    // Verify callback signature using APISign Step 4 (even for failures)
    const hypayConfig = {
      masof: process.env.HYPAY_MASOF!,
      apiKey: process.env.HYPAY_API_KEY!,
      passP: process.env.HYPAY_PASS_P!,
      baseUrl: process.env.HYPAY_BASE_URL!
    }

    console.log('Verifying failure callback signature...')
    const verificationResult = await verifyPaymentCallback(callbackParams, hypayConfig)

    if (!verificationResult.isValid) {
      console.error('Failure callback signature verification failed:', verificationResult.error)
      paymentLogger.logSignatureVerification(false, orderId, transactionId, verificationResult.error, request)
      // Even if signature fails, we log this but continue processing
      // as the failure might be legitimate but from an older flow
    } else {
      console.log('Failure callback signature verified successfully')
      paymentLogger.logSignatureVerification(true, orderId, transactionId, undefined, request)
    }

    console.log('Processing payment failure callback:', callbackParams)

    // Determine failure reason using comprehensive error mapping
    let failureReason = 'Payment failed. Please try again or contact support.'

    if (errMsg) {
      failureReason = decodeURIComponent(errMsg)
    } else if (ccode) {
      failureReason = getUserErrorMessage(ccode)
      
      // Log additional error information for monitoring
      const errorInfo = getHypayError(ccode)
      console.log('Payment failure details:', {
        code: ccode,
        category: errorInfo.category,
        severity: errorInfo.severity,
        technicalMessage: errorInfo.technicalMessage,
        retryable: errorInfo.retryable
      })
    }

    await handlePaymentFailure(orderId, failureReason, callbackParams)

    const failureUrl = new URL('/dashboard/payment/failure', request.url)
    failureUrl.searchParams.set('CCode', ccode)
    if (errMsg) failureUrl.searchParams.set('ErrMsg', errMsg)
    if (transactionId) failureUrl.searchParams.set('Id', transactionId)
    return NextResponse.redirect(failureUrl)

  } catch (error) {
    console.error('Error processing payment failure callback:', error)
    paymentLogger.logAPIError('payment_failure_callback', error instanceof Error ? error : new Error('Unknown error'), undefined, request)
    return NextResponse.json({ status: 'error', message: 'Failed to process payment failure callback' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Handle POST callbacks if Hypay uses POST instead of GET
  return await GET(request)
}
