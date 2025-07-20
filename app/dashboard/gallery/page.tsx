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
      <div className="min-h-screen p-4 lg:p-8">
        <div className="space-y-6 md:space-y-8">
          {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-48 shimmer"></div>
            <div className="h-5 bg-slate-200 rounded-lg w-80 shimmer"></div>
          </div>
          
          {/* Controls Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-10 bg-slate-200 rounded-lg flex-1 shimmer"></div>
            <div className="h-10 bg-slate-200 rounded-lg w-48 shimmer"></div>
          </div>
          
          {/* Filter Pills Skeleton */}
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-6 bg-slate-200 rounded-full w-20 shimmer"></div>
            ))}
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="dashboard-card">
              <div className="p-0">
                <div className="aspect-video bg-slate-200 shimmer"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4 shimmer"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 shimmer"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-slate-200 rounded flex-1 shimmer"></div>
                    <div className="h-8 bg-slate-200 rounded w-10 shimmer"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="space-y-6 md:space-y-8">
        {/* Professional Header */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Video Gallery
            </h1>
            <p className="text-lg text-slate-600">Manage your video transcriptions and captions</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Selection Controls */}
            {isSelectionMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="bg-white/80 border-slate-300 hover:bg-slate-50"
                >
                  {selectedVideos.size === filteredVideos.length ? (
                    <CheckSquare className="h-4 w-4 mr-2 text-blue-600" />
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
                    className="shadow-lg hover:shadow-xl"
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
              className={isSelectionMode ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" : "bg-white/80 border-slate-300 hover:bg-slate-50"}
            >
              {isSelectionMode ? "Cancel" : "Select"}
            </Button>
            
            {/* View Mode Buttons */}
            <div className="flex bg-white/60 rounded-lg p-1 border border-slate-200">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm" : "hover:bg-white/80"}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm" : "hover:bg-white/80"}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Selection Status */}
        {isSelectionMode && (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
              {selectedVideos.size} of {filteredVideos.length} selected
            </div>
          </div>
        )}

        {/* Enhanced Status Filter Pills */}
        <div className="flex flex-wrap gap-3">
          <div
            className={`cursor-pointer px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
              statusFilter === "all" 
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25" 
                : "bg-white/80 text-slate-700 border border-slate-200 hover:bg-white hover:shadow-sm"
            }`}
            onClick={() => setStatusFilter("all")}
          >
            All ({statusCounts.all})
          </div>
          <div
            className={`cursor-pointer px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
              statusFilter === "processing" 
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25" 
                : "bg-white/80 text-slate-700 border border-slate-200 hover:bg-white hover:shadow-sm"
            }`}
            onClick={() => setStatusFilter("processing")}
          >
            Processing ({statusCounts.processing})
          </div>
          <div
            className={`cursor-pointer px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
              statusFilter === "ready" 
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25" 
                : "bg-white/80 text-slate-700 border border-slate-200 hover:bg-white hover:shadow-sm"
            }`}
            onClick={() => setStatusFilter("ready")}
          >
            Ready ({statusCounts.ready})
          </div>
          <div
            className={`cursor-pointer px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
              statusFilter === "complete" 
                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25" 
                : "bg-white/80 text-slate-700 border border-slate-200 hover:bg-white hover:shadow-sm"
            }`}
            onClick={() => setStatusFilter("complete")}
          >
            Complete ({statusCounts.complete})
          </div>
          <div
            className={`cursor-pointer px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
              statusFilter === "failed" 
                ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25" 
                : "bg-white/80 text-slate-700 border border-slate-200 hover:bg-white hover:shadow-sm"
            }`}
            onClick={() => setStatusFilter("failed")}
          >
            Failed ({statusCounts.failed})
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white/80 border-slate-300 shadow-sm hover:shadow-md focus:shadow-lg transition-all duration-200 rounded-xl"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-56 h-12 bg-white/80 border-slate-300 shadow-sm hover:shadow-md rounded-xl">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-xl border-slate-200 shadow-xl rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Professional Videos Grid/List */}
      {filteredVideos.length === 0 ? (
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
    </div>
  )
} 