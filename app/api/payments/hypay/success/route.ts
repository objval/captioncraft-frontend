import { NextRequest, NextResponse } from 'next/server'
import { handlePaymentSuccess } from '@/app/actions/payments'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Expected parameters from Hypay
    const orderId = searchParams.get('Order')
    const transactionId = searchParams.get('Id')
    const amount = searchParams.get('Amount')
    const ccode = searchParams.get('CCode')
    const hesh = searchParams.get('Hesh')

    // Validate parameters
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

    // Collect provider response
    const providerResponse = Object.fromEntries(searchParams.entries())

    console.log('Processing payment success callback:', providerResponse)

    await handlePaymentSuccess(
      orderId,
      transactionId,
      parseFloat(amount),
      hesh || undefined,
      providerResponse
    )

    const redirectUrl = new URL('/dashboard/payment/success', request.url)
    redirectUrl.search = searchParams.toString()
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Error processing payment success callback:', error)
    return NextResponse.json({ status: 'error', message: 'Failed to process payment success callback' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Handle POST callbacks if Hypay uses POST instead of GET
  return await GET(request)
}
