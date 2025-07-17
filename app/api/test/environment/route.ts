import { NextResponse } from 'next/server'
import { getHypayConfig, validateTestEnvironment, logTestEnvironmentStatus } from '@/lib/hypay-test-utils'

export async function GET() {
  try {
    // Get current configuration
    const config = getHypayConfig()
    
    // Validate test environment
    const validation = await validateTestEnvironment()
    
    // Log environment status
    logTestEnvironmentStatus()
    
    return NextResponse.json({
      success: true,
      environment: {
        testMode: config.testMode,
        nodeEnv: process.env.NODE_ENV,
        hypayTestMode: process.env.HYPAY_TEST_MODE,
        masof: config.masof,
        userId: config.userId,
        baseUrl: config.baseUrl
      },
      validation: {
        isValid: validation.isValid,
        issues: validation.issues
      },
      testCard: {
        number: '5326105300985614',
        cvv: '125',
        expiry: '12/25',
        testIds: ['203269535', '890108566', '000000000']
      },
      status: config.testMode ? 'TEST_MODE_ACTIVE' : 'PRODUCTION_MODE_ACTIVE',
      message: config.testMode 
        ? '🧪 Test mode is active. No real charges will be made.'
        : '💳 Production mode is active. Real charges will be made!'
    })
  } catch (error) {
    console.error('Environment check error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}