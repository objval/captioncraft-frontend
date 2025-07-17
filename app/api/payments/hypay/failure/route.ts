import { NextRequest, NextResponse } from 'next/server'
import { handlePaymentFailure } from '@/app/actions/payments'

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

    const providerResponse = Object.fromEntries(searchParams.entries())

    console.log('Processing payment failure callback:', providerResponse)

    // Determine failure reason based on CCode or ErrMsg
    let failureReason = 'Payment failed. Please try again or contact support.'

    if (errMsg) {
      failureReason = decodeURIComponent(errMsg)
    } else if (ccode) {
      switch (ccode) {
        case '0':
          failureReason = 'Payment cancelled by user.'
          break
        case '33':
          failureReason = 'Refund amount is greater than the original transactions amount.'
          break
        case '400':
          failureReason = 'Sum of items differ from transaction amount (invoice module).';
          break;
        case '401':
          failureReason = 'Client name or last name is required.';
          break;
        case '402':
          failureReason = 'Deal information is required.';
          break;
        case '600':
          failureReason = 'Checking card number (J2).';
          break;
        case '700':
          failureReason = 'Approved without charge (J5 credit line reservation).';
          break;
        case '800':
          failureReason = 'Postponed charge.';
          break;
        case '901':
          failureReason = 'Terminal is not permitted to work in this method.';
          break;
        case '902':
          failureReason = 'Authentication error. Verify terminal settings.';
          break;
        case '903':
          failureReason = 'Exceeded maximum number of payments configured in terminal.';
          break;
        case '990':
          failureReason = 'Card details not fully readable. Please pass the card again.';
          break;
        case '996':
          failureReason = 'Terminal is not permitted to use token.';
          break;
        case '997':
          failureReason = 'Token is not valid.';
          break;
        case '998':
          failureReason = 'Deal cancelled by Hypay.';
          break;
        case '999':
          failureReason = 'Communication error with Hypay.';
          break;
        default:
          // For Shva error codes (0-200) and other unmapped Hypay errors
          if (parseInt(ccode) >= 0 && parseInt(ccode) <= 200) {
            failureReason = `Payment declined by card issuer (Code: ${ccode}). Please try a different card or contact your bank.`;
          } else {
            failureReason = `Payment failed with unknown error code: ${ccode}. Please contact support.`;
          }
          break;
      }
    }

    await handlePaymentFailure(orderId, failureReason, providerResponse)

    const failureUrl = new URL('/dashboard/payment/failure', request.url)
    failureUrl.searchParams.set('CCode', ccode)
    if (errMsg) failureUrl.searchParams.set('ErrMsg', errMsg)
    if (transactionId) failureUrl.searchParams.set('Id', transactionId)
    return NextResponse.redirect(failureUrl)

  } catch (error) {
    console.error('Error processing payment failure callback:', error)
    return NextResponse.json({ status: 'error', message: 'Failed to process payment failure callback' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Handle POST callbacks if Hypay uses POST instead of GET
  return await GET(request)
}
