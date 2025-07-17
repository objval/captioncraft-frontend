/**
 * Complete Hypay/Shva error code mapping
 * Based on Hypay documentation: 0-200 (Shva) + 201-999 (Hypay)
 */

export interface HypayError {
  code: string
  category: 'success' | 'card_declined' | 'system_error' | 'validation_error' | 'authentication_error' | 'configuration_error'
  severity: 'info' | 'warning' | 'error' | 'critical'
  userMessage: string
  technicalMessage: string
  retryable: boolean
}

export const HYPAY_ERROR_CODES: Record<string, HypayError> = {
  // Success codes
  '0': {
    code: '0',
    category: 'success',
    severity: 'info',
    userMessage: 'Payment completed successfully.',
    technicalMessage: 'Transaction approved.',
    retryable: false
  },

  // Special status codes (not errors but special cases)
  '600': {
    code: '600',
    category: 'card_declined',
    severity: 'warning',
    userMessage: 'Card verification completed. No charge applied.',
    technicalMessage: 'Checking card number (J2 mode).',
    retryable: false
  },
  
  '700': {
    code: '700',
    category: 'card_declined',
    severity: 'warning',
    userMessage: 'Credit line approved without charge.',
    technicalMessage: 'Approved without charge (J5 credit line reservation).',
    retryable: false
  },
  
  '800': {
    code: '800',
    category: 'card_declined',
    severity: 'info',
    userMessage: 'Payment postponed for manual processing.',
    technicalMessage: 'Postponed transaction.',
    retryable: false
  },

  // Common card declined codes (Shva 0-200)
  '1': {
    code: '1',
    category: 'card_declined',
    severity: 'error',
    userMessage: 'Payment declined. Please try a different card or contact your bank.',
    technicalMessage: 'General decline by card issuer.',
    retryable: true
  },
  
  '2': {
    code: '2',
    category: 'card_declined',
    severity: 'error',
    userMessage: 'Payment declined. Please contact your bank.',
    technicalMessage: 'Card declined - contact issuer.',
    retryable: true
  },
  
  '3': {
    code: '3',
    category: 'validation_error',
    severity: 'error',
    userMessage: 'Invalid merchant. Please contact support.',
    technicalMessage: 'Invalid merchant ID.',
    retryable: false
  },
  
  '4': {
    code: '4',
    category: 'card_declined',
    severity: 'error',
    userMessage: 'Card restricted. Please contact your bank or use a different card.',
    technicalMessage: 'Card pickup - restricted card.',
    retryable: true
  },
  
  '5': {
    code: '5',
    category: 'card_declined',
    severity: 'error',
    userMessage: 'Payment declined. Please try a different card.',
    technicalMessage: 'Do not honor.',
    retryable: true
  },
  
  '12': {
    code: '12',
    category: 'validation_error',
    severity: 'error',
    userMessage: 'Invalid transaction. Please try again.',
    technicalMessage: 'Invalid transaction.',
    retryable: true
  },
  
  '13': {
    code: '13',
    category: 'validation_error',
    severity: 'error',
    userMessage: 'Invalid amount. Please check the payment amount.',
    technicalMessage: 'Invalid amount.',
    retryable: true
  },
  
  '14': {
    code: '14',
    category: 'validation_error',
    severity: 'error',
    userMessage: 'Invalid card number. Please check your card details.',
    technicalMessage: 'Invalid card number.',
    retryable: true
  },
  
  '30': {
    code: '30',
    category: 'system_error',
    severity: 'error',
    userMessage: 'System error. Please try again later.',
    technicalMessage: 'Format error.',
    retryable: true
  },
  
  '33': {
    code: '33',
    category: 'validation_error',
    severity: 'error',
    userMessage: 'Refund amount exceeds original transaction amount.',
    technicalMessage: 'Refund amount is greater than the original transaction amount.',
    retryable: false
  },
  
  '51': {
    code: '51',
    category: 'card_declined',
    severity: 'error',
    userMessage: 'Insufficient funds. Please check your account balance or use a different card.',
    technicalMessage: 'Insufficient funds.',
    retryable: true
  },
  
  '54': {
    code: '54',
    category: 'card_declined',
    severity: 'error',
    userMessage: 'Card expired. Please use a valid card.',
    technicalMessage: 'Expired card.',
    retryable: true
  },
  
  '55': {
    code: '55',
    category: 'card_declined',
    severity: 'error',
    userMessage: 'Incorrect PIN. Please try again.',
    technicalMessage: 'Incorrect PIN.',
    retryable: true
  },
  
  '57': {
    code: '57',
    category: 'card_declined',
    severity: 'error',
    userMessage: 'Transaction not permitted for this card.',
    technicalMessage: 'Transaction not permitted to cardholder.',
    retryable: false
  },
  
  '61': {
    code: '61',
    category: 'card_declined',
    severity: 'error',
    userMessage: 'Amount limit exceeded. Please use a smaller amount.',
    technicalMessage: 'Exceeds withdrawal amount limit.',
    retryable: true
  },
  
  '62': {
    code: '62',
    category: 'card_declined',
    severity: 'error',
    userMessage: 'Card restricted. Please contact your bank.',
    technicalMessage: 'Restricted card.',
    retryable: true
  },
  
  '65': {
    code: '65',
    category: 'card_declined',
    severity: 'error',
    userMessage: 'Activity limit exceeded. Please try again later.',
    technicalMessage: 'Exceeds withdrawal frequency limit.',
    retryable: true
  },
  
  '75': {
    code: '75',
    category: 'card_declined',
    severity: 'error',
    userMessage: 'PIN attempts exceeded. Please contact your bank.',
    technicalMessage: 'Allowable number of PIN tries exceeded.',
    retryable: false
  },
  
  '91': {
    code: '91',
    category: 'system_error',
    severity: 'error',
    userMessage: 'System temporarily unavailable. Please try again later.',
    technicalMessage: 'Issuer unavailable.',
    retryable: true
  },
  
  '96': {
    code: '96',
    category: 'system_error',
    severity: 'error',
    userMessage: 'System error. Please try again later.',
    technicalMessage: 'System malfunction.',
    retryable: true
  },

  // Hypay-specific error codes (201-999)
  '400': {
    code: '400',
    category: 'validation_error',
    severity: 'error',
    userMessage: 'Invoice items validation failed. Please contact support.',
    technicalMessage: 'Sum of items differ from transaction amount (invoice module).',
    retryable: false
  },
  
  '401': {
    code: '401',
    category: 'validation_error',
    severity: 'error',
    userMessage: 'Client name is required. Please provide your full name.',
    technicalMessage: 'Client name or last name is required.',
    retryable: true
  },
  
  '402': {
    code: '402',
    category: 'validation_error',
    severity: 'error',
    userMessage: 'Transaction information is required.',
    technicalMessage: 'Deal information is required.',
    retryable: false
  },
  
  '901': {
    code: '901',
    category: 'configuration_error',
    severity: 'error',
    userMessage: 'Payment method not available. Please contact support.',
    technicalMessage: 'Terminal is not permitted to work in this method.',
    retryable: false
  },
  
  '902': {
    code: '902',
    category: 'authentication_error',
    severity: 'critical',
    userMessage: 'Authentication error. Please contact support.',
    technicalMessage: 'Authentication error. Verify terminal settings.',
    retryable: false
  },
  
  '903': {
    code: '903',
    category: 'validation_error',
    severity: 'error',
    userMessage: 'Payment plan not available. Please choose a different option.',
    technicalMessage: 'Exceeded maximum number of payments configured in terminal.',
    retryable: true
  },
  
  '904': {
    code: '904',
    category: 'validation_error',
    severity: 'error',
    userMessage: 'Invalid payment amount.',
    technicalMessage: 'Amount validation failed.',
    retryable: true
  },
  
  '905': {
    code: '905',
    category: 'validation_error',
    severity: 'error',
    userMessage: 'Invalid parameter value.',
    technicalMessage: 'Wrong parameter value.',
    retryable: true
  },
  
  '906': {
    code: '906',
    category: 'validation_error',
    severity: 'error',
    userMessage: 'Agreement not found.',
    technicalMessage: 'Agreement does not exist.',
    retryable: false
  },
  
  '910': {
    code: '910',
    category: 'validation_error',
    severity: 'error',
    userMessage: 'Invalid transaction for token generation.',
    technicalMessage: 'Token request from invalid transaction.',
    retryable: false
  },
  
  '920': {
    code: '920',
    category: 'validation_error',
    severity: 'error',
    userMessage: 'Transaction not found or already processed.',
    technicalMessage: 'Deal does not exist or already committed.',
    retryable: false
  },
  
  '990': {
    code: '990',
    category: 'card_declined',
    severity: 'error',
    userMessage: 'Card details not readable. Please try again or use a different card.',
    technicalMessage: 'Card details not fully readable.',
    retryable: true
  },
  
  '996': {
    code: '996',
    category: 'configuration_error',
    severity: 'error',
    userMessage: 'Token payment not available. Please contact support.',
    technicalMessage: 'Terminal is not permitted to use token.',
    retryable: false
  },
  
  '997': {
    code: '997',
    category: 'validation_error',
    severity: 'error',
    userMessage: 'Invalid payment token. Please start a new payment.',
    technicalMessage: 'Token is not valid.',
    retryable: true
  },
  
  '998': {
    code: '998',
    category: 'system_error',
    severity: 'error',
    userMessage: 'Payment cancelled. Please try again.',
    technicalMessage: 'Deal cancelled by Hypay.',
    retryable: true
  },
  
  '999': {
    code: '999',
    category: 'system_error',
    severity: 'critical',
    userMessage: 'Communication error. Please try again later.',
    technicalMessage: 'Communication error with Hypay.',
    retryable: true
  }
}

/**
 * Get error information for a given error code
 */
export function getHypayError(code: string): HypayError {
  const error = HYPAY_ERROR_CODES[code]
  
  if (error) {
    return error
  }
  
  // Handle unmapped codes
  const codeNumber = parseInt(code, 10)
  
  if (codeNumber >= 0 && codeNumber <= 200) {
    // Shva error codes
    return {
      code,
      category: 'card_declined',
      severity: 'error',
      userMessage: `Payment declined by card issuer (Code: ${code}). Please try a different card or contact your bank.`,
      technicalMessage: `Shva error code: ${code}`,
      retryable: true
    }
  } else if (codeNumber >= 201 && codeNumber <= 999) {
    // Hypay error codes
    return {
      code,
      category: 'system_error',
      severity: 'error',
      userMessage: `Payment failed with error code: ${code}. Please contact support if the problem persists.`,
      technicalMessage: `Hypay error code: ${code}`,
      retryable: true
    }
  } else {
    // Unknown error codes
    return {
      code,
      category: 'system_error',
      severity: 'error',
      userMessage: 'An unexpected error occurred. Please contact support.',
      technicalMessage: `Unknown error code: ${code}`,
      retryable: false
    }
  }
}

/**
 * Get user-friendly error message for display
 */
export function getUserErrorMessage(code: string, customMessage?: string): string {
  if (customMessage) {
    return customMessage
  }
  
  const error = getHypayError(code)
  return error.userMessage
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(code: string): boolean {
  const error = getHypayError(code)
  return error.retryable
}

/**
 * Get error severity level
 */
export function getErrorSeverity(code: string): 'info' | 'warning' | 'error' | 'critical' {
  const error = getHypayError(code)
  return error.severity
}