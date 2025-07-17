/**
 * Hypay Test Environment Utilities
 * Handles test/production environment switching and validation
 */

import { paymentLogger } from './payment-logger'

export interface HypayConfig {
  masof: string
  apiKey: string
  passP: string
  userId: string
  baseUrl: string
  testMode: boolean
}

export interface TestCardData {
  number: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  holderIds: string[]
  description: string
}

/**
 * Test card data from Hypay documentation
 */
export const HYPAY_TEST_CARDS: Record<string, TestCardData> = {
  success: {
    number: '5326105300985614',
    expiryMonth: '12',
    expiryYear: '25', 
    cvv: '125',
    holderIds: ['890108566', '000000000', '203269535'],
    description: 'Standard test card for successful transactions'
  },
  // You can add more test scenarios as needed
  failure: {
    number: '4580121900146022', // Real card that will decline in test terminal
    expiryMonth: '04',
    expiryYear: '23',
    cvv: '123',
    holderIds: ['203269535'],
    description: 'Real card for testing failure scenarios'
  }
}

/**
 * Recommended test amounts (small amounts per Hypay docs)
 */
export const TEST_AMOUNTS = [5, 10, 29, 50, 99] // In NIS

/**
 * Determine if we're in test environment
 */
export function isTestEnvironment(): boolean {
  // Only use test mode if explicitly set - otherwise use production
  return process.env.HYPAY_TEST_MODE === 'true'
}

/**
 * Get Hypay configuration based on environment
 */
export function getHypayConfig(): HypayConfig {
  const isTest = isTestEnvironment()
  
  if (isTest) {
    // Use test configuration from Hypay docs
    return {
      masof: '0010020610',                                           // Alternative test terminal from docs
      apiKey: '7110eda4d09e062aa5e4a390b0a572ac0d2c0220',           // Test API key from docs  
      passP: 'yaad',                                                 // Test PassP from docs
      userId: '203269535',                                           // Test UserId from docs
      baseUrl: process.env.HYPAY_BASE_URL || 'https://pay.hyp.co.il/p/',
      testMode: true
    }
  } else {
    // Use production configuration from environment variables
    return {
      masof: process.env.HYPAY_MASOF!,
      apiKey: process.env.HYPAY_API_KEY!,
      passP: process.env.HYPAY_PASS_P!,
      userId: process.env.HYPAY_USER_ID!,
      baseUrl: process.env.HYPAY_BASE_URL!,
      testMode: false
    }
  }
}

/**
 * Validate test environment configuration
 */
export async function validateTestEnvironment(): Promise<{
  isValid: boolean
  issues: string[]
  config: HypayConfig
}> {
  const issues: string[] = []
  const config = getHypayConfig()
  
  // Validate test terminal format
  if (config.testMode) {
    if (!config.masof.startsWith('00100')) {
      issues.push(`Test masof should start with 00100 for test terminals, got: ${config.masof}`)
    }
    
    // Check test configuration completeness
    if (!config.apiKey || config.apiKey.length < 10) {
      issues.push('Test API key appears invalid')
    }
    
    if (!config.passP) {
      issues.push('Test PassP is required')
    }
    
    if (!config.userId) {
      issues.push('Test UserId is required')
    }
  } else {
    // Validate production configuration
    if (!process.env.HYPAY_MASOF || !process.env.HYPAY_API_KEY || 
        !process.env.HYPAY_PASS_P || !process.env.HYPAY_USER_ID) {
      issues.push('Missing required production environment variables')
    }
    
    if (process.env.HYPAY_MASOF?.startsWith('00100')) {
      issues.push('WARNING: Production environment using test terminal!')
    }
  }
  
  // Test signature generation
  try {
    const { generatePrintHeshSignature } = await import('./hypay-crypto')
    const testSignature = generatePrintHeshSignature(
      config.masof,
      'TEST123',
      config.apiKey
    )
    
    if (!testSignature || testSignature.length !== 64) {
      issues.push('Signature generation produces invalid results')
    }
  } catch (error) {
    issues.push(`Signature generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  // Log validation results
  paymentLogger.log(issues.length === 0 ? 'info' : 'error', 'test_environment_validation', {
    metadata: {
      testMode: config.testMode,
      masof: config.masof,
      issueCount: issues.length,
      issues: issues.length > 0 ? issues : undefined
    }
  })
  
  return {
    isValid: issues.length === 0,
    issues,
    config
  }
}

/**
 * Test payment parameters for different scenarios
 */
export function getTestPaymentParams(scenario: 'success' | 'failure' = 'success') {
  const testCard = HYPAY_TEST_CARDS[scenario]
  const testAmount = TEST_AMOUNTS[0] // Use smallest test amount
  
  return {
    // Test card info (for reference/documentation only - not used in redirect flow)
    testCard: {
      ...testCard,
      note: 'This card data is for documentation only. Users enter card details on Hypay page.'
    },
    
    // Test payment parameters
    testParams: {
      Amount: testAmount.toString(),
      UserId: testCard.holderIds[0],
      Info: `Test payment - ${scenario} scenario`,
      Order: `TEST-${Date.now()}-${scenario.toUpperCase()}`,
      
      // Test-specific parameters
      Tash: '1', // Single payment
      Coin: '1', // ILS
      UTF8: 'True',
      UTF8out: 'True',
      Sign: 'True',
      MoreData: 'True',
      pageTimeOut: 'True',
      sendemail: 'True',
      SendHesh: 'True',
      Pritim: 'True',
      blockItemValidation: 'True'
    }
  }
}

/**
 * Create test credit pack for development
 */
export function createTestCreditPack() {
  return {
    id: 'test-credit-pack',
    name: 'Test Pack (Dev Only)',
    credits_amount: 10,
    price_nis: TEST_AMOUNTS[1] // 10 NIS
  }
}

/**
 * Generate test idempotency key
 */
export function generateTestIdempotencyKey(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Mock test payment response for development
 */
export function getMockTestResponse(success: boolean = true) {
  const baseParams = {
    Order: 'TEST-PAYMENT-123',
    Id: '12345678',
    Amount: '10',
    ACode: '0012345',
    UserId: '203269535',
    Fild1: 'Test Client',
    Fild2: 'test@example.com',
    Fild3: '050-123-4567'
  }
  
  if (success) {
    return {
      ...baseParams,
      CCode: '0', // Success
      Hesh: '123', // Invoice number
      Sign: 'test-signature-would-be-here',
      // MoreData fields
      Bank: '6',
      Payments: '1',
      Brand: '2',
      Issuer: '2',
      L4digit: '5614',
      errMsg: ' (0)'
    }
  } else {
    return {
      ...baseParams,
      CCode: '051', // Insufficient funds
      errMsg: 'Insufficient funds',
      Sign: 'test-signature-would-be-here'
    }
  }
}

/**
 * Log test environment status on startup
 */
export function logTestEnvironmentStatus(): void {
  const config = getHypayConfig()
  
  paymentLogger.log('info', 'hypay_environment_initialized', {
    metadata: {
      testMode: config.testMode,
      masof: config.masof,
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    }
  })
  
  if (config.testMode) {
    console.log(`
🧪 HYPAY TEST MODE ACTIVE
═══════════════════════
Terminal: ${config.masof}
PassP: ${config.passP}
UserId: ${config.userId}
Test Card: ${HYPAY_TEST_CARDS.success.number}
Test CVV: ${HYPAY_TEST_CARDS.success.cvv}
Test Amounts: ${TEST_AMOUNTS.join(', ')} NIS

⚠️  No real charges will be made
    `)
  } else {
    console.log(`
💳 HYPAY PRODUCTION MODE
═══════════════════════
Terminal: ${config.masof}
⚠️  REAL CHARGES WILL BE MADE
    `)
  }
}

/**
 * Enhanced payment creation with test mode support
 */
export async function createTestModePayment(
  userId: string,
  creditPackId: string,
  amount: number,
  paymentUrl: string
): Promise<string> {
  const config = getHypayConfig()
  
  // Import createClient dynamically to avoid circular dependencies
  const { createClient } = await import('@/utils/supabase/server')
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      credit_pack_id: creditPackId,
      amount: amount,
      status: 'pending',
      payment_url: paymentUrl,
      test_mode: config.testMode, // Flag test payments
      idempotency_key: generateTestIdempotencyKey()
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating test payment record:', error)
    throw new Error('Failed to create test payment record')
  }

  // Log test payment creation
  paymentLogger.log('info', 'test_payment_created', {
    paymentId: data.id,
    userId,
    amount,
    metadata: {
      testMode: config.testMode,
      creditPackId,
      masof: config.masof
    }
  })

  return data.id
}

/**
 * Validate test payment callback
 */
export function validateTestCallback(params: Record<string, string>): {
  isValid: boolean
  issues: string[]
} {
  const issues: string[] = []
  const config = getHypayConfig()
  
  if (!config.testMode) {
    return { isValid: true, issues: [] } // Skip validation in production
  }
  
  // Check required test parameters
  if (!params.Order?.includes('TEST') && !params.Order?.startsWith('test-')) {
    issues.push('Test callback should have test order identifier')
  }
  
  if (params.Amount && parseFloat(params.Amount) > 100) {
    issues.push('Test amounts should be small (recommended: 5-50 NIS)')
  }
  
  if (params.CCode === '0' && !params.Id) {
    issues.push('Successful test callback missing transaction ID')
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}