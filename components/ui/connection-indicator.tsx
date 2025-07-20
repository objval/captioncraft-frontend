import { cn } from "@/lib/utils/general"

interface ConnectionIndicatorProps {
  isConnected: boolean
  className?: string
}

export function ConnectionIndicator({ isConnected, className }: ConnectionIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      <div className={cn(
        "h-2 w-2 rounded-full",
        isConnected ? "bg-green-500 animate-pulse" : "bg-yellow-500"
      )} />
      <span className="text-muted-foreground">
        {isConnected ? "Real-time connected" : "Polling mode"}
      </span>
    </div>
  )
}