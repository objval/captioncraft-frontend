import crypto from 'crypto'

/**
 * Hypay signature generation and verification utilities
 * Based on Hypay documentation requirements
 */

/**
 * Generate SHA-256 signature for PrintHesh URL
 * Format: PrintHesh${masof}${transId}EZCOUNT${apiKey}
 */
export function generatePrintHeshSignature(
  masof: string,
  transId: string,
  apiKey: string
): string {
  const signatureString = `PrintHesh${masof}${transId}EZCOUNT${apiKey}`
  return crypto.createHash('sha256').update(signatureString).digest('hex')
}

/**
 * Generate signature for APISign Step 1 (Payment URL signing)
 * This creates a hash of all payment parameters for security
 */
export function generatePaymentSignature(
  params: Record<string, string>,
  apiKey: string
): string {
  // Sort parameters alphabetically by key (excluding signature itself)
  const sortedParams = Object.keys(params)
    .filter(key => key !== 'signature')
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')
  
  const signatureString = `${sortedParams}${apiKey}`
  return crypto.createHash('sha256').update(signatureString).digest('hex')
}

/**
 * Verify signature from Hypay callback
 * Used in APISign Step 4 verification
 */
export function verifyHypaySignature(
  params: Record<string, string>,
  expectedSignature: string,
  apiKey: string
): boolean {
  try {
    const computedSignature = generatePaymentSignature(params, apiKey)
    return computedSignature === expectedSignature
  } catch (error) {
    console.error('Error verifying Hypay signature:', error)
    return false
  }
}

/**
 * Make APISign request to Hypay for signature generation
 * Step 1 of the secure payment flow
 */
export async function requestHypaySignature(
  params: Record<string, string>,
  config: {
    masof: string
    apiKey: string
    passP: string
    baseUrl: string
    testMode?: boolean
  }
): Promise<{ signedParams: Record<string, string>; signature: string }> {
  const signParams = new URLSearchParams({
    action: 'APISign',
    What: 'SIGN',
    Masof: config.masof,
    KEY: config.apiKey,
    PassP: config.passP,
    ...params
  })

  const signUrl = `${config.baseUrl}?${signParams.toString()}`
  
  try {
    const response = await fetch(signUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'CaptionCraft-Payment-System/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`APISign request failed: ${response.status} ${response.statusText}`)
    }

    const responseText = await response.text()
    console.log('APISign response:', responseText)
    
    // Check for error codes
    const responseParams = new URLSearchParams(responseText)
    const ccode = responseParams.get('CCode')
    
    if (ccode && ccode !== '0') {
      console.warn(`APISign returned error code: ${ccode}`)
      
      // If in test mode and APISign is not available, fall back to direct payment
      if (config.testMode && (ccode === '900' || ccode === '901' || ccode === '902')) {
        console.log('APISign not available in test mode, falling back to direct payment URL')
        
        // Generate a mock signature for testing
        const mockSignature = generatePaymentSignature(params, config.apiKey)
        
        return {
          signedParams: params,
          signature: mockSignature
        }
      }
      
      throw new Error(`APISign returned error code: ${ccode}`)
    }
    
    // Parse the response which should be in URL parameter format
    // Example: Amount=10&ClientName=Israel&...&signature=abc123
    const signedParams: Record<string, string> = {}
    const signature = responseParams.get('signature')

    if (!signature) {
      throw new Error('No signature returned from APISign request')
    }

    // Extract all parameters except signature
    responseParams.forEach((value, key) => {
      if (key !== 'signature') {
        signedParams[key] = value
      }
    })

    return { signedParams, signature }
  } catch (error) {
    console.error('APISign request failed:', error)
    
    // If in test mode and APISign fails, fall back to direct payment
    if (config.testMode) {
      console.log('Falling back to direct payment URL generation for testing')
      
      const mockSignature = generatePaymentSignature(params, config.apiKey)
      
      return {
        signedParams: params,
        signature: mockSignature
      }
    }
    
    throw new Error(`Failed to get payment signature: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Verify payment callback using APISign Step 4
 * Makes a verification request to Hypay to confirm the callback is authentic
 */
export async function verifyPaymentCallback(
  callbackParams: Record<string, string>,
  config: {
    masof: string
    apiKey: string
    passP: string
    baseUrl: string
  }
): Promise<{ isValid: boolean; ccode?: string; error?: string }> {
  const verifyParams = new URLSearchParams({
    action: 'APISign',
    What: 'VERIFY',
    Masof: config.masof,
    KEY: config.apiKey,
    PassP: config.passP,
    ...callbackParams
  })

  const verifyUrl = `${config.baseUrl}?${verifyParams.toString()}`

  try {
    const response = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'CaptionCraft-Payment-System/1.0'
      }
    })

    if (!response.ok) {
      return {
        isValid: false,
        error: `Verification request failed: ${response.status} ${response.statusText}`
      }
    }

    const responseText = await response.text()
    const responseParams = new URLSearchParams(responseText)
    const ccodeRaw = responseParams.get('CCode')
    const ccode = ccodeRaw ? ccodeRaw.trim() : null

    // CCode=0 means verification successful
    // CCode=902 means verification failed
    const isValid = ccode === '0'

    return {
      isValid,
      ccode: ccode || undefined,
      error: isValid ? undefined : `Verification failed with CCode: ${ccode}`
    }
  } catch (error) {
    console.error('Payment verification failed:', error)
    return {
      isValid: false,
      error: `Verification request error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Sanitize and validate parameters for signature generation
 * Ensures no malicious data is included in signatures
 */
export function sanitizeParams(params: Record<string, any>): Record<string, string> {
  const sanitized: Record<string, string> = {}
  
  for (const [key, value] of Object.entries(params)) {
    if (value != null) {
      // Convert to string and sanitize
      const stringValue = String(value).trim()
      
      // Basic validation - reject obviously malicious patterns
      if (stringValue.length > 1000) {
        console.warn(`Parameter ${key} too long, truncating`)
        sanitized[key] = stringValue.substring(0, 1000)
      } else if (stringValue.includes('<script') || stringValue.includes('javascript:')) {
        console.warn(`Potentially malicious parameter ${key}, rejecting`)
        continue
      } else {
        sanitized[key] = stringValue
      }
    }
  }
  
  return sanitized
}