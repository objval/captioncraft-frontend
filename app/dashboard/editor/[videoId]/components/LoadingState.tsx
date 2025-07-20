import { Skeleton } from "@/components/ui/skeleton"

export function LoadingState() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  )
}