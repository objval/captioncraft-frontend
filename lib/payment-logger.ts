/**
 * Comprehensive payment transaction logging and audit trail
 * Tracks all payment-related activities for security and compliance
 */

export interface PaymentLogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'critical'
  event: string
  paymentId?: string
  transactionId?: string
  userId?: string
  amount?: number
  currency?: string
  status?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  errorCode?: string
  errorMessage?: string
  stackTrace?: string
}

export interface PaymentAuditEvent {
  event: 'payment_initiated' | 'payment_success' | 'payment_failure' | 'signature_verification' | 
         'callback_received' | 'invoice_generated' | 'credits_added' | 'security_violation'
  details: Record<string, any>
}

class PaymentLogger {
  private logs: PaymentLogEntry[] = []
  private readonly maxLogs = 1000 // Keep last 1000 logs in memory

  /**
   * Log a payment event with comprehensive details
   */
  log(
    level: PaymentLogEntry['level'],
    event: string,
    details: Partial<PaymentLogEntry> = {},
    request?: Request
  ): void {
    const logEntry: PaymentLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      ...details,
      ...(request && {
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined
      })
    }

    // Add to in-memory logs
    this.logs.push(logEntry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift() // Remove oldest log
    }

    // Console logging based on level
    switch (level) {
      case 'critical':
      case 'error':
        console.error(`[PAYMENT ${level.toUpperCase()}]`, logEntry)
        break
      case 'warn':
        console.warn(`[PAYMENT WARN]`, logEntry)
        break
      case 'info':
      default:
        console.log(`[PAYMENT INFO]`, logEntry)
        break
    }

    // In production, you might want to send critical/error logs to external monitoring
    if (level === 'critical' || level === 'error') {
      this.alertSecurityTeam(logEntry)
    }
  }

  /**
   * Log payment initiation
   */
  logPaymentInitiated(paymentId: string, userId: string, amount: number, creditPackId: string, request?: Request): void {
    this.log('info', 'payment_initiated', {
      paymentId,
      userId,
      amount,
      currency: 'ILS',
      metadata: { creditPackId }
    }, request)
  }

  /**
   * Log successful payment
   */
  logPaymentSuccess(
    paymentId: string,
    transactionId: string,
    amount: number,
    invoiceNumber?: string,
    request?: Request
  ): void {
    this.log('info', 'payment_success', {
      paymentId,
      transactionId,
      amount,
      currency: 'ILS',
      status: 'succeeded',
      metadata: { invoiceNumber }
    }, request)
  }

  /**
   * Log payment failure
   */
  logPaymentFailure(
    paymentId: string,
    errorCode: string,
    errorMessage: string,
    transactionId?: string,
    request?: Request
  ): void {
    this.log('error', 'payment_failure', {
      paymentId,
      transactionId,
      status: 'failed',
      errorCode,
      errorMessage
    }, request)
  }

  /**
   * Log signature verification attempts
   */
  logSignatureVerification(
    success: boolean,
    paymentId?: string,
    transactionId?: string,
    errorMessage?: string,
    request?: Request
  ): void {
    this.log(success ? 'info' : 'critical', 'signature_verification', {
      paymentId,
      transactionId,
      metadata: { 
        verified: success,
        ...(errorMessage && { error: errorMessage })
      }
    }, request)
  }

  /**
   * Log callback reception
   */
  logCallbackReceived(
    type: 'success' | 'failure',
    params: Record<string, string>,
    request?: Request
  ): void {
    this.log('info', 'callback_received', {
      paymentId: params.Order,
      transactionId: params.Id,
      metadata: {
        type,
        ccode: params.CCode,
        amount: params.Amount,
        paramCount: Object.keys(params).length
      }
    }, request)
  }

  /**
   * Log invoice generation
   */
  logInvoiceGenerated(
    paymentId: string,
    invoiceNumber: string,
    invoiceUrl: string
  ): void {
    this.log('info', 'invoice_generated', {
      paymentId,
      metadata: {
        invoiceNumber,
        invoiceUrl: invoiceUrl.substring(0, 100) + '...' // Truncate URL for logging
      }
    })
  }

  /**
   * Log credits addition
   */
  logCreditsAdded(
    userId: string,
    amount: number,
    paymentId: string
  ): void {
    this.log('info', 'credits_added', {
      userId,
      paymentId,
      metadata: { creditsAmount: amount }
    })
  }

  /**
   * Log security violations
   */
  logSecurityViolation(
    violation: string,
    details: Record<string, any>,
    request?: Request
  ): void {
    this.log('critical', 'security_violation', {
      errorMessage: violation,
      metadata: details
    }, request)
  }

  /**
   * Log API errors
   */
  logAPIError(
    endpoint: string,
    error: Error,
    paymentId?: string,
    request?: Request
  ): void {
    this.log('error', 'api_error', {
      paymentId,
      errorMessage: error.message,
      stackTrace: error.stack,
      metadata: { endpoint }
    }, request)
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(count: number = 50): PaymentLogEntry[] {
    return this.logs.slice(-count)
  }

  /**
   * Get logs by payment ID
   */
  getPaymentLogs(paymentId: string): PaymentLogEntry[] {
    return this.logs.filter(log => log.paymentId === paymentId)
  }

  /**
   * Get error logs for monitoring
   */
  getErrorLogs(since?: Date): PaymentLogEntry[] {
    const sinceTime = since ? since.toISOString() : undefined
    return this.logs.filter(log => 
      (log.level === 'error' || log.level === 'critical') &&
      (!sinceTime || log.timestamp > sinceTime)
    )
  }

  /**
   * Extract client IP from request
   */
  private getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cloudflareIP = request.headers.get('cf-connecting-ip')
    
    if (cloudflareIP) return cloudflareIP
    if (realIP) return realIP
    if (forwarded) return forwarded.split(',')[0].trim()
    
    return 'unknown'
  }

  /**
   * Alert security team for critical issues
   */
  private alertSecurityTeam(logEntry: PaymentLogEntry): void {
    // In production, this would integrate with your alerting system
    // For now, just enhanced console logging
    console.error('🚨 SECURITY ALERT:', {
      timestamp: logEntry.timestamp,
      event: logEntry.event,
      details: logEntry
    })
    
    // You could integrate with:
    // - Slack webhooks
    // - Email alerts
    // - PagerDuty
    // - Discord webhooks
    // - External logging services (DataDog, LogRocket, etc.)
  }

  /**
   * Generate audit report for a specific time period
   */
  generateAuditReport(startDate: Date, endDate: Date): {
    totalTransactions: number
    successfulPayments: number
    failedPayments: number
    securityIncidents: number
    averageAmount: number
    logs: PaymentLogEntry[]
  } {
    const startTime = startDate.toISOString()
    const endTime = endDate.toISOString()
    
    const periodLogs = this.logs.filter(log => 
      log.timestamp >= startTime && log.timestamp <= endTime
    )

    const payments = periodLogs.filter(log => 
      log.event === 'payment_success' || log.event === 'payment_failure'
    )

    const successfulPayments = payments.filter(log => log.event === 'payment_success')
    const failedPayments = payments.filter(log => log.event === 'payment_failure')
    const securityIncidents = periodLogs.filter(log => log.level === 'critical')

    const totalAmount = successfulPayments.reduce((sum, log) => sum + (log.amount || 0), 0)
    const averageAmount = successfulPayments.length > 0 ? totalAmount / successfulPayments.length : 0

    return {
      totalTransactions: payments.length,
      successfulPayments: successfulPayments.length,
      failedPayments: failedPayments.length,
      securityIncidents: securityIncidents.length,
      averageAmount,
      logs: periodLogs
    }
  }
}

// Singleton instance
export const paymentLogger = new PaymentLogger()

/**
 * Audit decorator for payment functions
 */
export function auditPaymentFunction(
  functionName: string,
  paymentId?: string
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      
      try {
        paymentLogger.log('info', `${functionName}_started`, {
          paymentId,
          metadata: { functionName, args: args.length }
        })

        const result = await originalMethod.apply(this, args)
        
        const duration = Date.now() - startTime
        paymentLogger.log('info', `${functionName}_completed`, {
          paymentId,
          metadata: { functionName, duration }
        })

        return result
      } catch (error) {
        const duration = Date.now() - startTime
        paymentLogger.log('error', `${functionName}_failed`, {
          paymentId,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          stackTrace: error instanceof Error ? error.stack : undefined,
          metadata: { functionName, duration }
        })
        throw error
      }
    }

    return descriptor
  }
}