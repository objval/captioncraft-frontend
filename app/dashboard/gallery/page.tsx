"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { VideoCard } from "@/components/video/video-card"
import { useAuth } from "@/components/providers/auth-provider"
import { useVideoSubscription } from "@/hooks/use-video-subscription"
import { api } from "@/lib/api"
import { Search, Video, Plus, Filter, Grid3X3, List, Trash2, CheckSquare, Square } from "lucide-react"
import toast from "react-hot-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  const { user } = useAuth()
  const { videos, loading } = useVideoSubscription(user?.id)

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || video.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDeleteVideo = async (id: string) => {
    try {
      await api.deleteVideo(id)
      toast.success("Video deleted successfully")
    } catch (error) {
      toast.error("Failed to delete video")
    }
  }

  const handleRetryVideo = async (id: string) => {
    try {
      await api.retryVideo(id)
      toast.success("Video processing restarted")
    } catch (error) {
      toast.error("Failed to retry video processing")
    }
  }

  const handleSelectionChange = (videoId: string, selected: boolean) => {
    const newSelection = new Set(selectedVideos)
    if (selected) {
      newSelection.add(videoId)
    } else {
      newSelection.delete(videoId)
    }
    setSelectedVideos(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedVideos.size === filteredVideos.length) {
      setSelectedVideos(new Set())
    } else {
      setSelectedVideos(new Set(filteredVideos.map(video => video.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedVideos.size === 0) return
    
    try {
      const deletePromises = Array.from(selectedVideos).map(id => api.deleteVideo(id))
      await Promise.all(deletePromises)
      toast.success(`${selectedVideos.size} videos deleted successfully`)
      setSelectedVideos(new Set())
      setIsSelectionMode(false)
    } catch (error) {
      toast.error("Failed to delete some videos")
    }
  }

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedVideos(new Set())
  }

  const statusCounts = {
    all: videos.length,
    processing: videos.filter(v => v.status === "processing").length,
    ready: videos.filter(v => v.status === "ready").length,
    complete: videos.filter(v => v.status === "complete").length,
    failed: videos.filter(v => v.status === "failed").length,
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Video Gallery</h1>
            <p className="text-muted-foreground">Manage your video transcriptions and captions</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Selection Controls */}
            {isSelectionMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedVideos.size === filteredVideos.length ? (
                    <CheckSquare className="h-4 w-4 mr-2" />
                  ) : (
                    <Square className="h-4 w-4 mr-2" />
                  )}
                  {selectedVideos.size === filteredVideos.length ? "Deselect All" : "Select All"}
                </Button>
                
                {selectedVideos.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete {selectedVideos.size} video{selectedVideos.size > 1 ? 's' : ''}
                  </Button>
                )}
              </>
            )}
            
            {/* Selection Mode Toggle */}
            <Button
              variant={isSelectionMode ? "default" : "outline"}
              size="sm"
              onClick={toggleSelectionMode}
            >
              {isSelectionMode ? "Cancel" : "Select"}
            </Button>
            
            {/* View Mode Buttons */}
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selection Status */}
        {isSelectionMode && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedVideos.size} of {filteredVideos.length} selected
            </Badge>
          </div>
        )}

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={statusFilter === "all" ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setStatusFilter("all")}
          >
            All ({statusCounts.all})
          </Badge>
          <Badge
            variant={statusFilter === "processing" ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setStatusFilter("processing")}
          >
            Processing ({statusCounts.processing})
          </Badge>
          <Badge
            variant={statusFilter === "ready" ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setStatusFilter("ready")}
          >
            Ready ({statusCounts.ready})
          </Badge>
          <Badge
            variant={statusFilter === "complete" ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setStatusFilter("complete")}
          >
            Complete ({statusCounts.complete})
          </Badge>
          <Badge
            variant={statusFilter === "failed" ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setStatusFilter("failed")}
          >
            Failed ({statusCounts.failed})
          </Badge>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Videos Grid/List */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No videos found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== "all"
              ? "No videos match your search criteria."
              : "Upload your first video to get started with transcription and caption burning."}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Button onClick={() => window.dispatchEvent(new CustomEvent('open-upload-modal'))}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Your First Video
            </Button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            : "space-y-4"
        }>
          {filteredVideos.map((video) => (
            <VideoCard 
              key={video.id} 
              video={video} 
              onDeleteAction={handleDeleteVideo} 
              onRetryAction={handleRetryVideo}
              viewMode={viewMode}
              isSelected={selectedVideos.has(video.id)}
              onSelectionChange={handleSelectionChange}
              showSelection={isSelectionMode}
            />
          ))}
        </div>
      )}
    </div>
  )
} 