import { formatDistanceToNow, format, isToday, isYesterday, isSameYear } from 'date-fns'

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string, options?: { addSuffix?: boolean }) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: options?.addSuffix ?? true })
}

/**
 * Format a date with smart formatting based on how recent it is
 */
export function formatSmartDate(date: Date | string) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isToday(dateObj)) {
    return format(dateObj, "'Today at' h:mm a")
  }
  
  if (isYesterday(dateObj)) {
    return format(dateObj, "'Yesterday at' h:mm a")
  }
  
  if (isSameYear(dateObj, new Date())) {
    return format(dateObj, "MMM d 'at' h:mm a")
  }
  
  return format(dateObj, "MMM d, yyyy 'at' h:mm a")
}

/**
 * Format a date for display in tables
 */
export function formatTableDate(date: Date | string) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'MMM d, yyyy')
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date | string) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'MMM d, yyyy h:mm a')
}

/**
 * Format a date for invoices or formal documents
 */
export function formatInvoiceDate(date: Date | string) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'MMMM d, yyyy')
}

/**
 * Get a human-readable duration from seconds
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

/**
 * Format file upload time
 */
export function formatUploadTime(date: Date | string) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) {
    return 'Just now'
  }
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }
  
  return formatRelativeTime(dateObj)
}