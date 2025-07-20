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
  const Icon = format === 'relative' ? Clock : Calendar
  
  const formattedDate = {
    relative: formatRelativeTime(date),
    smart: formatSmartDate(date),
    datetime: formatDateTime(date),
    table: formatTableDate(date)
  }[format]

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {showIcon && (
        <Icon className={cn("h-3 w-3", iconClassName)} />
      )}
      <span>{formattedDate}</span>
    </div>
  )
}

// Compact version for inline use
export function RelativeTime({ date, className }: { date: Date | string; className?: string }) {
  return <span className={className}>{formatRelativeTime(date)}</span>
}