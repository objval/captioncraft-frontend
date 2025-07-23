"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useVideoSubscription } from "@/hooks/video"
import toast from "@/lib/utils/toast"
import { uploadEvents } from "@/lib/utils/upload-events"

// Import gallery components
import { GalleryHeader } from "@/components/dashboard/gallery/GalleryHeader"
import { GalleryFilters } from "@/components/dashboard/gallery/GalleryFilters"
import { VideoGrid } from "@/components/dashboard/gallery/VideoGrid"
import { GallerySkeleton } from "@/components/dashboard/gallery/GallerySkeleton"
import { api } from "@/lib/api/api"

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  const { user } = useAuth()
  const { videos, loading, refreshSubscription } = useVideoSubscription(user?.id)

  // Listen for upload completion events
  useEffect(() => {
    const cleanup = uploadEvents.onUploadComplete((videoId) => {
      console.log('Video upload completed, refreshing gallery:', videoId)
      // Force refresh the subscription to ensure the new video appears
      refreshSubscription()
    })

    return cleanup
  }, [refreshSubscription])

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || video.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDeleteVideo = async (id: string) => {
    try {
      await api.deleteVideo(id)
      toast.success("Video deleted successfully")
      
      // Force a page reload if video doesn't disappear within 2 seconds
      setTimeout(() => {
        const videoStillExists = videos.some(video => video.id === id)
        if (videoStillExists) {
          console.log('Video not updated via subscription, reloading page...')
          window.location.reload()
        }
      }, 2000)
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
      const videoIds = Array.from(selectedVideos)
      
      // Use bulk delete endpoint for better performance
      const result = await api.deleteVideos(videoIds)
      
      if (result.deleted > 0) {
        toast.success(`Deleted ${result.deleted} video${result.deleted !== 1 ? 's' : ''}`)
      }
      
      if (result.failed > 0) {
        toast.warning(`Failed to delete ${result.failed} video${result.failed !== 1 ? 's' : ''}`)
        console.error('Delete errors:', result.errors)
      }
      
      setSelectedVideos(new Set())
      setIsSelectionMode(false)
      
      // Force a page reload if videos don't update within 2 seconds
      // This is a fallback in case the subscription doesn't update immediately
      setTimeout(() => {
        // Check if any deleted videos are still visible
        const deletedVideosStillVisible = videoIds.some(id => 
          videos.some(video => video.id === id)
        )
        
        if (deletedVideosStillVisible) {
          console.log('Videos not updated via subscription, reloading page...')
          window.location.reload()
        }
      }, 2000)
    } catch (error) {
      toast.error("Delete operation failed")
      console.error('Bulk delete error:', error)
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
    return <GallerySkeleton />
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="space-y-6 md:space-y-8">
        {/* Gallery Header */}
        <GalleryHeader
          totalVideos={videos.length}
          isSelectionMode={isSelectionMode}
          selectedCount={selectedVideos.size}
          filteredCount={filteredVideos.length}
          viewMode={viewMode}
          onToggleSelectionMode={toggleSelectionMode}
          onSelectAll={handleSelectAll}
          onDeleteSelected={handleDeleteSelected}
          onViewModeChange={setViewMode}
        />

        {/* Gallery Filters */}
        <GalleryFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          statusCounts={statusCounts}
          onSearchChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Video Grid */}
        <VideoGrid
          videos={filteredVideos}
          viewMode={viewMode}
          isSelectionMode={isSelectionMode}
          selectedVideos={selectedVideos}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onDeleteVideo={handleDeleteVideo}
          onRetryVideo={handleRetryVideo}
          onSelectionChange={handleSelectionChange}
        />
      </div>
    </div>
  )
} 