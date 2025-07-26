"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useCreditBalance, useUploadCredits } from "@/hooks/credits"
import { useAuth } from "@/components/providers/auth-provider"
import { Upload, X, AlertCircle, Coins, CheckCircle, Sparkles } from "lucide-react"
import toast from "@/lib/utils/toast"
import { createClient } from "@/lib/database/supabase/client"
import { uploadEvents } from "@/lib/utils/upload-events"
import type { Video } from "@/lib/api/api"

interface UploadModalProps {
  isOpen: boolean
  onCloseAction: () => void
  onUploadComplete?: (videoId: string) => void
}

export function UploadModal({ isOpen, onCloseAction, onUploadComplete }: UploadModalProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [autoRedirect, setAutoRedirect] = useState(() => {
    // Load preference from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('autoRedirectAfterUpload') === 'true'
    }
    return false
  })
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null)
  const router = useRouter()

  const { user } = useAuth()
  const { credits, refreshCredits } = useCreditBalance(user?.id, { watchTransactions: true })
  const { startListening, stopListening } = useUploadCredits({
    userId: user?.id,
    onCreditUpdate: (newCredits) => {
      // Credits will be updated via the main hook
      refreshCredits()
    }
  })

  // Set up realtime subscription for video status
  // NOTE: Make sure Realtime is enabled for the 'videos' table in Supabase dashboard
  // Go to Database > Replication and enable the 'videos' table
  useEffect(() => {
    if (!uploadedVideoId || !autoRedirect) return

    const supabase = createClient()
    let channel: any = null
    let pollInterval: NodeJS.Timeout | null = null
    
    console.log('Setting up realtime subscription for video:', uploadedVideoId)
    
    // First, do a direct query to check current status
    const checkVideoStatus = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', uploadedVideoId)
        .single()
      
      if (data && (data.status === 'ready' || data.status === 'complete')) {
        toast.success("Video is ready! Redirecting to editor...")
        router.push(`/dashboard/editor/${uploadedVideoId}`)
        return true
      }
      return false
    }
    
    // Check immediately in case it's already ready
    checkVideoStatus().then(isReady => {
      if (isReady) return
      
      // If not ready, set up realtime subscription
      channel = supabase
        .channel(`video-${uploadedVideoId}`)
        .on(
          'postgres_changes' as any,
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'videos',
            filter: `id=eq.${uploadedVideoId}`
          },
          async (payload) => {
            console.log("Realtime update received:", payload)
            const updatedVideo = payload.new as Video
            console.log("Video status updated:", updatedVideo.status)
            
            // Check if video is ready (processed and transcript is available)
            if (updatedVideo.status === "ready" || updatedVideo.status === "complete") {
              console.log("Video is ready! Attempting redirect...")
              toast.success("Video is ready! Redirecting to editor...")
              // Small delay to ensure everything is loaded
              setTimeout(() => {
                console.log("Redirecting to:", `/dashboard/editor/${uploadedVideoId}`)
                router.push(`/dashboard/editor/${uploadedVideoId}`)
              }, 500)
            } else if (updatedVideo.status === "failed") {
              toast.error("Video processing failed. Please try again.")
              setAutoRedirect(false) // Disable auto-redirect on failure
            } else {
              console.log("Video status is:", updatedVideo.status, "- not redirecting yet")
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to video updates')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Error subscribing to video updates')
            // Fall back to polling
            pollInterval = setInterval(async () => {
              const ready = await checkVideoStatus()
              if (ready) {
                clearInterval(pollInterval!)
                pollInterval = null
              }
            }, 2000) // Check every 2 seconds
          }
        })
    })

    return () => {
      // Clean up any polling interval if it exists
      if (pollInterval) {
        clearInterval(pollInterval)
      }
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [uploadedVideoId, autoRedirect, router])

  const uploadVideo = async (file: File): Promise<any> => {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token

    if (!token) {
      throw new Error("No authentication token found")
    }

    const formData = new FormData()
    formData.append("video", file) // Changed from 'file' to 'video'

    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Progress tracking
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setUploadProgress(Math.round(percentComplete))
        }
      })

      // Success handler
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } catch (error) {
            reject(new Error("Invalid response format"))
          }
        } else {
          let errorMessage = `Upload failed: ${xhr.status} ${xhr.statusText}`
          try {
            const errorData = JSON.parse(xhr.responseText)
            errorMessage = errorData.message || errorMessage
          } catch (e) {
            // Use default error message
          }
          reject(new Error(errorMessage))
        }
      })

      // Error handler
      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"))
      })

      // Timeout handler
      xhr.addEventListener("timeout", () => {
        reject(new Error("Upload timeout - please try again"))
      })

      // Setup request
      xhr.open("POST", "https://nesontheshet.com/v1/videos/upload")
      xhr.setRequestHeader("Authorization", `Bearer ${token}`)
      xhr.withCredentials = true
      xhr.timeout = 300000 // 5 minute timeout

      // Send request
      xhr.send(formData)
    })
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Validate file size (max 500MB - updated from 250MB)
      const maxSize = 500 * 1024 * 1024 // 500MB
      if (file.size > maxSize) {
        toast.error(`File size exceeds 500MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`)
        return
      }

      // Enhanced file type validation
      const allowedTypes = [
        "video/mp4",
        "video/avi",
        "video/quicktime",
        "video/x-msvideo",
        "video/x-matroska",
        "video/webm",
      ]
      const allowedExtensions = [".mp4", ".avi", ".mov", ".mkv", ".webm"]

      const isValidType =
        allowedTypes.includes(file.type) || allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

      if (!isValidType) {
        toast.error("Please upload a valid video file (MP4, AVI, MOV, MKV, WebM)")
        return
      }

      setSelectedFile(file)
      setUploadComplete(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm"],
    },
    multiple: false,
    maxSize: 500 * 1024 * 1024, // 500MB
  })

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error)

    const errorMessage = error.message.toLowerCase()

    if (
      errorMessage.includes("413") ||
      errorMessage.includes("payload too large") ||
      errorMessage.includes("file too large")
    ) {
      toast.error(
        `File too large. Please upload a file smaller than 500MB. Current size: ${(selectedFile!.size / (1024 * 1024)).toFixed(2)}MB`,
      )
    } else if (errorMessage.includes("402") || errorMessage.includes("insufficient credits")) {
      toast.error("Insufficient credits. Please purchase more credits.")
    } else if (errorMessage.includes("cors") || errorMessage.includes("network error")) {
      toast.error("Connection error. Please check your internet connection and try again.")
    } else if (
      errorMessage.includes("400") ||
      errorMessage.includes("bad request") ||
      errorMessage.includes("invalid file")
    ) {
      toast.error("Invalid file format. Please upload a valid video file (MP4, AVI, MOV, MKV, WebM).")
    } else if (errorMessage.includes("timeout")) {
      toast.error("Upload timeout. Please try again with a smaller file or better internet connection.")
    } else if (errorMessage.includes("no authentication token")) {
      toast.error("Authentication error. Please sign in again.")
    } else {
      toast.error(`Upload failed: ${error.message}`)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    if (credits < 1) {
      toast.error("Insufficient credits. Please purchase more credits.")
      return
    }

    console.log("Starting upload - current credits:", credits)
    setUploading(true)
    setUploadProgress(0)
    
    // Start listening for credit updates during upload
    startListening()

    try {
      const response = await uploadVideo(selectedFile)
      setUploadProgress(100)
      setUploadComplete(true)

      const videoId = response.videoId || response.id
      setUploadedVideoId(videoId) // Store the video ID for realtime subscription
      
      if (autoRedirect) {
        toast.success("Video uploaded! Waiting for processing to complete...")
      } else {
        toast.success(`Video uploaded successfully! Video ID: ${videoId}`)
      }
      
      console.log("Upload response:", response)
      console.log("Upload complete - waiting for real-time credit update")

      // Credits will be updated via real-time subscription
      // No need to manually refresh
      
      // Notify parent component that upload is complete
      if (onUploadComplete && videoId) {
        // Wait a bit to ensure the backend has created the database record
        setTimeout(() => {
          onUploadComplete(videoId)
        }, 1000)
      }
      
      // Emit global upload complete event
      setTimeout(() => {
        uploadEvents.emitUploadComplete(videoId)
      }, 1500) // Wait 1.5 seconds to ensure database record exists

      // Don't auto-close if auto-redirect is enabled
      if (!autoRedirect) {
        // Auto-close after 3 seconds to ensure database record is created
        setTimeout(() => {
          handleClose()
        }, 3000)
      }
    } catch (error: any) {
      console.error("Upload error:", error)
      handleUploadError(error)
    } finally {
      setUploading(false)
      // Stop listening when upload is done
      stopListening()
    }
  }

  const handleClose = () => {
    if (!uploading) {
      onCloseAction()
      setSelectedFile(null)
      setUploadProgress(0)
      setUploadComplete(false)
      setUploadedVideoId(null)
      setAutoRedirect(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Credit Warning */}
          {credits < 1 && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Insufficient credits. Please purchase more credits to upload videos.</span>
            </div>
          )}

          {/* Cost Info */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm">Upload cost:</span>
            <div className="flex items-center gap-1">
                              <Coins className="h-4 w-4 text-blue-600" />
              <span className="font-medium">1 credit</span>
            </div>
          </div>

          {/* Auto-redirect Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <Label htmlFor="auto-redirect" className="flex items-center gap-2 cursor-pointer">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm">Auto-redirect when ready</span>
            </Label>
            <Switch
              id="auto-redirect"
              checked={autoRedirect}
              onCheckedChange={(checked) => {
                setAutoRedirect(checked)
                // Save preference to localStorage
                localStorage.setItem('autoRedirectAfterUpload', checked.toString())
              }}
              disabled={uploading || uploadComplete}
            />
          </div>

          {/* Upload Complete */}
          {uploadComplete && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">
                {autoRedirect 
                  ? "Upload completed! You'll be redirected when the video is ready..." 
                  : "Upload completed successfully! Processing will begin shortly."}
              </span>
            </div>
          )}

          {/* File Drop Zone */}
          {!selectedFile && !uploadComplete && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p>Drop the video file here...</p>
              ) : (
                <div>
                  <p className="mb-2">Drag & drop a video file here, or click to select</p>
                  <p className="text-sm text-muted-foreground">Supports MP4, MOV, AVI, MKV, WebM (max 500MB)</p>
                </div>
              )}
            </div>
          )}

          {/* Selected File */}
          {selectedFile && !uploading && !uploadComplete && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Uploading...</span>
                <span className="text-sm">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
              <p className="text-xs text-muted-foreground">Please don&apos;t close this window while uploading...</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={uploading} className="flex-1 bg-transparent">
              {uploadComplete ? "Close" : "Cancel"}
            </Button>
            {!uploadComplete && (
              <Button onClick={handleUpload} disabled={!selectedFile || uploading || credits < 1} className="flex-1">
                {uploading ? "Uploading..." : "Upload Video"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
