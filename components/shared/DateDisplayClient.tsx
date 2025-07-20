"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock } from "lucide-react"
import { 
  formatRelativeTime, 
  formatSmartDate, 
  formatDateTime,
  formatTableDate 
} from "@/lib/utils/date-helpers"
import { cn } from "@/lib/utils/general"

interface DateDisplayProps {
  date: Date | string
  format?: 'relative' | 'smart' | 'datetime' | 'table'
  showIcon?: boolean
  className?: string
  iconClassName?: string
}

export function DateDisplay({ 
  date, 
  format = 'relative',
  showIcon = false,
  className,
  iconClassName
}: DateDisplayProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const Icon = format === 'relative' ? Clock : Calendar
  
  // Show placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <span className={cn("inline-flex items-center gap-1", className)}>
        {showIcon && (
          <Icon className={cn("h-3 w-3", iconClassName)} />
        )}
        <span className="text-muted-foreground">...</span>
      </span>
    )
  }
  
  const formattedDate = {
    relative: formatRelativeTime(date),
    smart: formatSmartDate(date),
    datetime: formatDateTime(date),
    table: formatTableDate(date)
  }[format]

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {showIcon && (
        <Icon className={cn("h-3 w-3", iconClassName)} />
      )}
      <span>{formattedDate}</span>
    </span>
  )
}

// Compact version for inline use
export function RelativeTime({ date, className }: { date: Date | string; className?: string }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return <span className={className}>...</span>
  }
  
  return <span className={className}>{formatRelativeTime(date)}</span>
}