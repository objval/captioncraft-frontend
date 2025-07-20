"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils/general"

interface FloatingActionButtonProps {
  onClick: () => void
  className?: string
  size?: "sm" | "md" | "lg"
}

export function FloatingActionButton({ 
  onClick, 
  className,
  size = "md" 
}: FloatingActionButtonProps) {
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-14 w-14",
    lg: "h-16 w-16"
  }

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6", 
    lg: "h-7 w-7"
  }

  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-50 bg-primary hover:bg-primary/90 border-0",
        sizeClasses[size],
        className
      )}
      size="icon"
    >
      <Plus className={cn(iconSizes[size], "text-primary-foreground")} />
      <span className="sr-only">Upload Video</span>
    </Button>
  )
} 