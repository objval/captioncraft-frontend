import { Suspense } from "react"

interface SuspenseNumberProps {
  value: number | string
  fallback?: React.ReactNode
  className?: string
}

export function SuspenseNumber({ value, fallback = "...", className }: SuspenseNumberProps) {
  return (
    <span className={className}>
      {value}
    </span>
  )
}

interface SuspenseTextProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

export function SuspenseText({ children, fallback = "...", className }: SuspenseTextProps) {
  return (
    <span className={className}>
      {children}
    </span>
  )
}

interface DataLoaderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function DataLoader({ children, fallback = <span className="text-muted-foreground animate-pulse">...</span> }: DataLoaderProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}