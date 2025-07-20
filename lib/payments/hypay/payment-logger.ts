/**
 * Payment Logger Utility
 * Centralized logging for payment-related events
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export interface LogMetadata {
  paymentId?: string
  userId?: string
  amount?: number | string
  metadata?: Record<string, any>
  error?: Error | unknown
}

class PaymentLogger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  log(level: LogLevel, message: string, data?: LogMetadata): void {
    const timestamp = new Date().toISOString()
    const logData = {
      timestamp,
      level,
      message,
      ...data,
    }

    // In development, log everything
    if (this.isDevelopment) {
      switch (level) {
        case 'error':
          console.error(`[Payment ${level.toUpperCase()}]`, message, logData)
          break
        case 'warn':
          console.warn(`[Payment ${level.toUpperCase()}]`, message, logData)
          break
        case 'debug':
          console.debug(`[Payment ${level.toUpperCase()}]`, message, logData)
          break
        default:
          console.log(`[Payment ${level.toUpperCase()}]`, message, logData)
      }
    } else {
      // In production, only log warnings and errors
      if (level === 'error' || level === 'warn') {
        console[level](`[Payment ${level.toUpperCase()}]`, message, logData)
      }
    }

    // Here you could also send logs to an external service like Sentry, LogRocket, etc.
    // Example:
    // if (level === 'error' && typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(data?.error || new Error(message), {
    //     tags: { component: 'payment' },
    //     extra: logData
    //   })
    // }
  }

  info(message: string, data?: LogMetadata): void {
    this.log('info', message, data)
  }

  warn(message: string, data?: LogMetadata): void {
    this.log('warn', message, data)
  }

  error(message: string, data?: LogMetadata): void {
    this.log('error', message, data)
  }

  debug(message: string, data?: LogMetadata): void {
    this.log('debug', message, data)
  }
}

// Export singleton instance
export const paymentLogger = new PaymentLogger()