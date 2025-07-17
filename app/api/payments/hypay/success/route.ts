import { NextRequest, NextResponse } from 'next/server'
import { handlePaymentSuccess } from '@/app/actions/payments'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract parameters from Hypay callback
    const paymentId = searchParams.get('Order') // Order parameter contains our payment ID
    const hypayTransactionId = searchParams.get('TransId') // Hypay transaction ID
    const amount = searchParams.get('Amount') // Amount paid
    const invoiceNumber = searchParams.get('InvoiceNumber') // EzCount invoice number
    const result = searchParams.get('Result') // Payment result status
    
    // Validate required parameters
    if (!paymentId || !hypayTransactionId || !amount || result !== '1') {
      console.error('Invalid payment callback parameters:', {
        paymentId,
        hypayTransactionId,
        amount,
        result
      })
      
      return NextResponse.redirect(
        new URL('/dashboard/credits?payment=failed', request.url)
      )
    }

    // Collect all callback data for logging
    const providerResponse = {
      TransId: hypayTransactionId,
      Amount: amount,
      Result: result,
      InvoiceNumber: invoiceNumber,
      Order: paymentId,
      // Include other potentially useful parameters
      Masof: searchParams.get('Masof'),
      UserId: searchParams.get('UserId'),
      DateTime: searchParams.get('DateTime'),
      // Add any other parameters Hypay might send
      ...Object.fromEntries(searchParams.entries())
    }

    console.log('Processing payment success callback:', providerResponse)

    // Handle the successful payment
    await handlePaymentSuccess(
      paymentId,
      hypayTransactionId,
      parseFloat(amount),
      invoiceNumber || undefined,
      providerResponse
    )

    // Redirect to success page
    return NextResponse.json({ status: 'ok', message: 'Payment success callback processed' })

  } catch (error) {
    console.error('Error processing payment success callback:', error)
    return NextResponse.json({ status: 'error', message: 'Failed to process payment success callback' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Handle POST callbacks if Hypay uses POST instead of GET
  return await GET(request)
}
