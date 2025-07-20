import { VideoCard } from "@/components/video/video-card"
import { Button } from "@/components/ui/button"
import { Video, Plus } from "lucide-react"
import type { Video as VideoType } from "@/lib/api"

interface VideoGridProps {
  videos: VideoType[]
  viewMode: "grid" | "list"
  isSelectionMode: boolean
  selectedVideos: Set<string>
  searchQuery: string
  statusFilter: string
  onDeleteVideo: (id: string) => void
  onRetryVideo: (id: string) => void
  onSelectionChange: (videoId: string, selected: boolean) => void
}

export function VideoGrid({
  videos,
  viewMode,
  isSelectionMode,
  selectedVideos,
  searchQuery,
  statusFilter,
  onDeleteVideo,
  onRetryVideo,
  onSelectionChange,
}: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 mx-auto w-fit mb-6">
          <Video className="h-16 w-16 mx-auto text-slate-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3">No videos found</h3>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          {searchQuery || statusFilter !== "all"
            ? "No videos match your search criteria. Try adjusting your filters or search terms."
            : "Upload your first video to get started with transcription and caption burning."}
        </p>
        {!searchQuery && statusFilter === "all" && (
          <Button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-upload-modal'))}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            Upload Your First Video
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={
      viewMode === "grid" 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        : "space-y-4"
    }>
      {videos.map((video) => (
        <VideoCard 
          key={video.id} 
          video={video} 
          onDeleteAction={onDeleteVideo} 
          onRetryAction={onRetryVideo}
          viewMode={viewMode}
          isSelected={selectedVideos.has(video.id)}
          onSelectionChange={onSelectionChange}
          showSelection={isSelectionMode}
        />
      ))}
    </div>
  )
}