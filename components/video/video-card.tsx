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
  }
> = {
  uploading: {
    label: "Uploading",
    color: "secondary",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    className: "bg-slate-100 text-slate-800",
  },
  processing: {
    label: "Processing",
    color: "secondary",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    className: "bg-indigo-100 text-indigo-800",
  },
  ready: {
    label: "Ready",
    color: "default",
    icon: <CheckCircle className="h-3 w-3" />,
    className: "bg-sky-100 text-sky-800",
  },
  burning_in: {
    label: "Burning Captions",
    color: "secondary",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    className: "bg-blue-200 text-blue-900",
  },
  complete: {
    label: "Complete",
    color: "default",
    icon: <CheckCircle className="h-3 w-3" />,
    className: "bg-blue-100 text-blue-800",
  },
  failed: {
    label: "Failed",
    color: "destructive",
    icon: <AlertCircle className="h-3 w-3" />,
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
      <Card className={`overflow-hidden ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Selection Checkbox */}
            {showSelection && (
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={handleSelectionChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            )}

            {/* Compact Thumbnail */}
            <div className="w-32 h-20 bg-muted relative flex-shrink-0 rounded-lg overflow-hidden">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url || "/placeholder.svg"}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-1 right-1">
                <Badge variant={status.color} className={`flex items-center gap-1 text-xs ${status.className || ''}`}>
                  {status.icon}
                  <span className="hidden sm:inline">{status.label}</span>
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{video.title}</h3>
                  <p className="text-sm text-muted-foreground">Created {createdAt}</p>
                </div>
                
                <div className="flex gap-2 flex-shrink-0">
                  {video.status === "ready" && (
                    <Button asChild size="sm">
                      <Link href={`/dashboard/editor/${video.id}`}>
                        <Edit className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>
                    </Button>
                  )}

                  {video.status === "complete" && (
                    <>
                      <Button asChild size="sm">
                        <Link href={`/dashboard/editor/${video.id}`}>
                          <Edit className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                    </>
                  )}

                  {video.status === "failed" && (
                    <Button size="sm" variant="outline" onClick={() => onRetryAction(video.id)}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Retry</span>
                    </Button>
                  )}

                  {(video.status === "uploading" || video.status === "processing" || video.status === "burning_in") && (
                    <Button size="sm" disabled>
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Processing...</span>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteAction(video.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
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
    <Card className={`overflow-hidden ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Selection Checkbox for Grid View */}
      {showSelection && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectionChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      )}

      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="aspect-video bg-muted relative">
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url || "/placeholder.svg"}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant={status.color} className={`flex items-center gap-1 ${status.className || ''}`}>
              {status.icon}
              {status.label}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold truncate mb-1">{video.title}</h3>
          <p className="text-sm text-muted-foreground mb-3">Created {createdAt}</p>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {video.status === "ready" && (
              <Button asChild size="sm" className="flex-1">
                <Link href={`/dashboard/editor/${video.id}`}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
            )}

            {video.status === "complete" && (
              <>
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/dashboard/editor/${video.id}`}>
                    <Edit className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </>
            )}

            {video.status === "failed" && (
              <Button size="sm" variant="outline" onClick={() => onRetryAction(video.id)} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            )}

            {(video.status === "uploading" || video.status === "processing" || video.status === "burning_in") && (
              <Button size="sm" disabled className="flex-1">
                <Clock className="h-4 w-4 mr-1" />
                Processing...
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteAction(video.id)}
          className="w-full text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}
