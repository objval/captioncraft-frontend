import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/general"
import { 
  getStatusColor, 
  getStatusIcon, 
  getStatusLabel,
  getStatusBadgeVariant,
  type Status 
} from "@/lib/utils/status-helpers"

interface StatusBadgeProps {
  status: Status
  showIcon?: boolean
  className?: string
  variant?: "default" | "secondary" | "destructive" | "outline"
}

export function StatusBadge({ 
  status, 
  showIcon = true, 
  className,
  variant
}: StatusBadgeProps) {
  const statusColor = getStatusColor(status)
  const statusIcon = showIcon ? getStatusIcon(status) : null
  const statusLabel = getStatusLabel(status)
  const badgeVariant = variant || getStatusBadgeVariant(status)

  return (
    <Badge 
      className={cn(
        statusColor,
        "border-0 shadow-sm",
        className
      )}
      variant={badgeVariant}
    >
      <div className="flex items-center gap-1.5">
        {statusIcon}
        <span>{statusLabel}</span>
      </div>
    </Badge>
  )
}

// Compact version without text
export function StatusIcon({ status, className }: { status: Status; className?: string }) {
  const icon = getStatusIcon(status)
  
  return (
    <div className={cn("flex items-center justify-center", className)}>
      {icon}
    </div>
  )
}