import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  PlayCircle, 
  Activity, 
  Zap, 
  Video,
  Upload,
  CheckCircle2
} from "lucide-react"
import { ReactElement } from "react"

// Type definitions
export type VideoStatus = 'uploading' | 'processing' | 'ready' | 'burning_in' | 'complete' | 'failed'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed'

// Combined status type for flexibility
export type Status = VideoStatus | PaymentStatus | string

// Status configurations
interface StatusConfig {
  color: string
  icon: ReactElement
  label: string
}

// Video status configurations
const VIDEO_STATUS_CONFIG: Record<VideoStatus, StatusConfig> = {
  complete: {
    color: "bg-blue-100 text-blue-800",
    icon: <CheckCircle className="h-4 w-4" />,
    label: "Complete"
  },
  ready: {
    color: "bg-sky-100 text-sky-800",
    icon: <PlayCircle className="h-4 w-4" />,
    label: "Ready"
  },
  processing: {
    color: "bg-indigo-100 text-indigo-800",
    icon: <Clock className="h-4 w-4" />,
    label: "Processing"
  },
  uploading: {
    color: "bg-slate-100 text-slate-800",
    icon: <Activity className="h-4 w-4" />,
    label: "Uploading"
  },
  burning_in: {
    color: "bg-blue-200 text-blue-900",
    icon: <Zap className="h-4 w-4" />,
    label: "Burning In"
  },
  failed: {
    color: "bg-red-100 text-red-800",
    icon: <AlertCircle className="h-4 w-4" />,
    label: "Failed"
  }
}

// Payment status configurations
const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, StatusConfig> = {
  succeeded: {
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    label: "Succeeded"
  },
  pending: {
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="h-4 w-4 text-yellow-500" />,
    label: "Pending"
  },
  failed: {
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="h-4 w-4 text-red-500" />,
    label: "Failed"
  }
}

// Combined status configurations
const STATUS_CONFIG: Record<string, StatusConfig> = {
  ...VIDEO_STATUS_CONFIG,
  ...PAYMENT_STATUS_CONFIG
}

// Default configuration for unknown statuses
const DEFAULT_STATUS_CONFIG: StatusConfig = {
  color: "bg-gray-100 text-gray-800",
  icon: <AlertCircle className="h-4 w-4 text-gray-500" />,
  label: "Unknown"
}

/**
 * Get the color classes for a given status
 */
export function getStatusColor(status: Status): string {
  return STATUS_CONFIG[status]?.color || DEFAULT_STATUS_CONFIG.color
}

/**
 * Get the icon component for a given status
 */
export function getStatusIcon(status: Status): ReactElement {
  return STATUS_CONFIG[status]?.icon || DEFAULT_STATUS_CONFIG.icon
}

/**
 * Get the display label for a given status
 */
export function getStatusLabel(status: Status): string {
  return STATUS_CONFIG[status]?.label || status
}

/**
 * Get the complete status configuration
 */
export function getStatusConfig(status: Status): StatusConfig {
  return STATUS_CONFIG[status] || DEFAULT_STATUS_CONFIG
}

/**
 * Get icon with custom color classes (for backward compatibility)
 */
export function getStatusIconWithColor(status: Status, colorClass?: string): ReactElement {
  const baseIcon = getStatusIcon(status)
  
  if (!colorClass) {
    return baseIcon
  }

  // Clone the icon with new className
  return {
    ...baseIcon,
    props: {
      ...baseIcon.props,
      className: colorClass
    }
  }
}

/**
 * Check if a status represents a final state
 */
export function isFinalStatus(status: Status): boolean {
  return ['complete', 'failed', 'succeeded'].includes(status)
}

/**
 * Check if a status represents an active/processing state
 */
export function isActiveStatus(status: Status): boolean {
  return ['uploading', 'processing', 'burning_in', 'pending'].includes(status)
}

/**
 * Get badge variant for status (for Badge component)
 */
export function getStatusBadgeVariant(status: Status): "default" | "secondary" | "destructive" | "outline" {
  if (status === 'succeeded' || status === 'complete') return "default"
  if (status === 'failed') return "destructive"
  if (status === 'pending' || status === 'processing') return "secondary"
  return "outline"
}