/**
 * Error tracking and reporting utilities
 */

export interface ErrorContext {
  userId?: string
  userEmail?: string
  route?: string
  component?: string
  action?: string
  timestamp?: Date
  additionalInfo?: Record<string, any>
}

export interface AppError extends Error {
  code?: string
  context?: ErrorContext
  severity?: 'low' | 'medium' | 'high' | 'critical'
  timestamp?: Date
}

class ErrorReporter {
  private static instance: ErrorReporter
  private context: ErrorContext = {}
  
  static getInstance(): ErrorReporter {
    if (!this.instance) {
      this.instance = new ErrorReporter()
    }
    return this.instance
  }
  
  setContext(context: Partial<ErrorContext>): void {
    this.context = { ...this.context, ...context }
  }
  
  clearContext(): void {
    this.context = {}
  }
  
  reportError(error: Error | AppError, additionalContext?: Partial<ErrorContext>): void {
    const enrichedError: AppError = {
      ...error,
      context: {
        ...this.context,
        ...additionalContext,
        timestamp: new Date()
      },
      severity: (error as AppError).severity || 'medium'
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Report:', {
        message: enrichedError.message,
        stack: enrichedError.stack,
        context: enrichedError.context,
        severity: enrichedError.severity
      })
    }
    
    // In production, send to error tracking service (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === 'production') {
      this.sendToTrackingService(enrichedError)
    }
  }
  
  private sendToTrackingService(error: AppError): void {
    // Integration with error tracking services
    // Example: Sentry.captureException(error, { extra: error.context })
    
    try {
      // Fallback: Send to your own error endpoint
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          context: error.context,
          severity: error.severity,
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(reportingError => {
        console.error('Failed to report error:', reportingError)
      })
    } catch (reportingError) {
      console.error('Error in error reporting:', reportingError)
    }
  }
}

export const errorReporter = ErrorReporter.getInstance()

/**
 * Error boundary hook for React components
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    errorReporter.reportError(error, {
      component: errorInfo?.componentStack?.split('\n')[1]?.trim(),
      additionalInfo: { errorInfo }
    })
  }
}

/**
 * Async error handler for promises
 */
export function handleAsyncError<T>(
  promise: Promise<T>,
  context?: Partial<ErrorContext>
): Promise<T> {
  return promise.catch(error => {
    errorReporter.reportError(error, context)
    throw error
  })
}

/**
 * Network error utilities
 */
export class NetworkError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}

export function isNetworkError(error: any): error is NetworkError {
  return error instanceof NetworkError || 
         error?.name === 'NetworkError' ||
         error?.message?.includes('fetch')
}

/**
 * Validation error utilities
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: any
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError || error?.name === 'ValidationError'
}

/**
 * Error retry utilities
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        errorReporter.reportError(lastError, {
          action: 'retry_exhausted',
          additionalInfo: { attempts: attempt + 1, maxRetries }
        })
        throw lastError
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  throw lastError!
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T,
  context?: Partial<ErrorContext>
): Promise<T | undefined> {
  try {
    return await operation()
  } catch (error) {
    errorReporter.reportError(error as Error, {
      ...context,
      action: 'safe_async_operation'
    })
    return fallback
  }
}
