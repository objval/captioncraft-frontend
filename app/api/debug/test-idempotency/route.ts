import { NextResponse } from 'next/server'
import { IdempotencyService, withIdempotency } from '@/lib/idempotency'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const testType = searchParams.get('type') || 'basic'
    
    if (testType === 'basic') {
      // Test basic idempotency key generation and validation
      const idempotencyKey = IdempotencyService.generateIdempotencyKey()
      const isValidTransaction = IdempotencyService.validateTransactionId('12345678')
      const isValidUUID = IdempotencyService.validateTransactionId('550e8400-e29b-41d4-a716-446655440000')
      
      return NextResponse.json({
        test: 'basic',
        results: {
          idempotencyKey,
          isValidTransaction,
          isValidUUID
        }
      })
    }
    
    if (testType === 'duplicate') {
      // Test duplicate request handling
      const idempotencyKey = 'test-' + Date.now()
      const requestParams = { amount: 100, creditPackId: 'test-pack' }
      
      // First request
      const result1 = await withIdempotency(
        idempotencyKey,
        requestParams,
        async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
          return { success: true, timestamp: Date.now() }
        }
      )
      
      // Second request with same key should return cached result
      const result2 = await withIdempotency(
        idempotencyKey,
        requestParams,
        async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
          return { success: true, timestamp: Date.now() }
        }
      )
      
      return NextResponse.json({
        test: 'duplicate',
        results: {
          result1,
          result2,
          areSame: JSON.stringify(result1) === JSON.stringify(result2)
        }
      })
    }
    
    if (testType === 'cleanup') {
      // Test cleanup functionality
      const idempotencyService = new IdempotencyService()
      const cleanedCount = await idempotencyService.cleanupExpiredRecords()
      
      return NextResponse.json({
        test: 'cleanup',
        results: {
          cleanedCount
        }
      })
    }
    
    return NextResponse.json({
      error: 'Invalid test type',
      availableTypes: ['basic', 'duplicate', 'cleanup']
    }, { status: 400 })
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Test failed',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}