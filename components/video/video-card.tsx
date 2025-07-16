"use client"

import type React from "react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Video, VideoStatus } from "@/lib/api"
import { Play, Edit, Download, Trash2, RefreshCw, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface VideoCardProps {
  video: Video
  onDeleteAction: (id: string) => void
  onRetryAction: (id: string) => void
  viewMode?: "grid" | "list"
  isSelected?: boolean
  onSelectionChange?: (id: string, selected: boolean) => void
  showSelection?: boolean
}

const statusConfig: Record<
  VideoStatus,
  {
    label: string
    color: "default" | "secondary" | "destructive" | "outline"
    icon: React.ReactNode
    className?: string
    bgGradient?: string
  }
> = {
  uploading: {
    label: "Uploading",
    color: "secondary",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    className: "bg-slate-100 text-slate-800 border-slate-200",
    bgGradient: "from-slate-100 to-slate-200"
  },
  processing: {
    label: "Processing",
    color: "secondary",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    className: "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border-indigo-200",
    bgGradient: "from-indigo-100 to-purple-200"
  },
  ready: {
    label: "Ready",
    color: "default",
    icon: <CheckCircle className="h-3 w-3" />,
    className: "bg-gradient-to-r from-sky-100 to-blue-100 text-sky-800 border-sky-200",
    bgGradient: "from-sky-100 to-blue-200"
  },
  burning_in: {
    label: "Burning Captions",
    color: "secondary",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    className: "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200",
    bgGradient: "from-blue-100 to-indigo-200"
  },
  complete: {
    label: "Complete",
    color: "default",
    icon: <CheckCircle className="h-3 w-3" />,
    className: "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200",
    bgGradient: "from-emerald-100 to-green-200"
  },
  failed: {
    label: "Failed",
    color: "destructive",
    icon: <AlertCircle className="h-3 w-3" />,
    className: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200",
    bgGradient: "from-red-100 to-rose-200"
  },
}

export function VideoCard({ 
  video, 
  onDeleteAction, 
  onRetryAction, 
  viewMode = "grid", 
  isSelected = false,
  onSelectionChange,
  showSelection = false 
}: VideoCardProps) {
  const status = statusConfig[video.status]
  const createdAt = formatDistanceToNow(new Date(video.created_at), { addSuffix: true })

  const handleSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectionChange?.(video.id, e.target.checked)
  }

  if (viewMode === "list") {
    return (
      <Card className={`dashboard-card dashboard-card-dark transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* Selection Checkbox */}
            {showSelection && (
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={handleSelectionChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded transition-all duration-200"
                />
              </div>
            )}

            {/* Enhanced Thumbnail */}
            <div className="w-40 h-24 bg-slate-100 relative flex-shrink-0 rounded-xl overflow-hidden shadow-sm group">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url || "/placeholder.svg"}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl">
                  <Play className="h-8 w-8 text-slate-400" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg border shadow-sm ${status.className || ''}`}>
                  {status.icon}
                  <span className="hidden sm:inline">{status.label}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-lg text-slate-800 truncate mb-1">{video.title}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Created {createdAt}
                  </p>
                </div>
                
                <div className="flex gap-2 flex-shrink-0">
                  {video.status === "ready" && (
                    <Button asChild size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
                      <Link href={`/dashboard/editor/${video.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>
                    </Button>
                  )}

                  {video.status === "complete" && (
                    <>
                      <Button asChild size="sm" className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
                        <Link href={`/dashboard/editor/${video.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">View</span>
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" className="bg-white/80 border-slate-300 hover:bg-slate-50 shadow-sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {video.status === "failed" && (
                    <Button size="sm" variant="outline" onClick={() => onRetryAction(video.id)} className="bg-white/80 border-amber-300 text-amber-700 hover:bg-amber-50 shadow-sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Retry</span>
                    </Button>
                  )}

                  {(video.status === "uploading" || video.status === "processing" || video.status === "burning_in") && (
                    <Button size="sm" disabled className="bg-slate-100 text-slate-500">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Processing...</span>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteAction(video.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`dashboard-card dashboard-card-dark group transition-all duration-300 hover:scale-105 overflow-hidden ${isSelected ? 'ring-2 ring-blue-500 ring-offset-4' : ''}`}>
      {/* Selection Checkbox for Grid View */}
      {showSelection && (
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectionChange}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded transition-all duration-200 shadow-sm"
          />
        </div>
      )}

      <CardContent className="p-0">
        {/* Enhanced Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden rounded-t-xl">
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url || "/placeholder.svg"}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-t-xl"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-xl">
              <Play className="h-16 w-16 text-slate-400 group-hover:text-slate-500 transition-colors" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border shadow-lg backdrop-blur-sm ${status.className || ''}`}>
              {status.icon}
              {status.label}
            </div>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-white font-semibold text-lg tracking-wide">
              {video.status === "ready" ? "Edit Video" : video.status === "complete" ? "View Video" : "Processing..."}
            </div>
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="p-5">
          <h3 className="font-bold text-lg text-slate-800 truncate mb-2 group-hover:text-blue-700 transition-colors">{video.title}</h3>
          <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Created {createdAt}
          </p>

          {/* Enhanced Action Buttons */}
          <div className="flex gap-2">
            {video.status === "ready" && (
              <Button asChild size="sm" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href={`/dashboard/editor/${video.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            )}

            {video.status === "complete" && (
              <>
                <Button asChild size="sm" className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link href={`/dashboard/editor/${video.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="bg-white/80 border-slate-300 hover:bg-slate-50 shadow-sm hover:shadow-md transition-all duration-200">
                  <Download className="h-4 w-4" />
                </Button>
              </>
            )}

            {video.status === "failed" && (
              <Button size="sm" variant="outline" onClick={() => onRetryAction(video.id)} className="flex-1 bg-white/80 border-amber-300 text-amber-700 hover:bg-amber-50 shadow-sm hover:shadow-md transition-all duration-200">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}

            {(video.status === "uploading" || video.status === "processing" || video.status === "burning_in") && (
              <Button size="sm" disabled className="flex-1 bg-slate-100 text-slate-500">
                <Clock className="h-4 w-4 mr-2" />
                Processing...
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteAction(video.id)}
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}
