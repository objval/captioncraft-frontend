import { PageHeaderSkeleton, VideoGridSkeleton } from "@/components/shared/LoadingSkeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <VideoGridSkeleton count={6} />
    </div>
  )
}