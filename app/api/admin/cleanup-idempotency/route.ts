import { NextResponse } from 'next/server'
import { IdempotencyService } from '@/lib/idempotency'
import { paymentLogger } from '@/lib/payment-logger'

export async function POST(request: Request) {
  try {
    // This endpoint should be protected and only called by cron jobs or admin
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.ADMIN_API_TOKEN
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idempotencyService = new IdempotencyService()
    const cleanedCount = await idempotencyService.cleanupExpiredRecords()

    paymentLogger.log('info', 'scheduled_idempotency_cleanup', {
      cleanedCount,
      metadata: {
        triggeredAt: new Date().toISOString(),
        triggeredBy: 'api_endpoint'
      }
    })

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${cleanedCount} expired idempotency records`,
      cleanedCount
    })

  } catch (error) {
    paymentLogger.log('error', 'scheduled_idempotency_cleanup_failed', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Cleanup failed'
    }, { status: 500 })
  }
}

// Also support GET for health checks
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'idempotency-cleanup',
    timestamp: new Date().toISOString()
  })
}