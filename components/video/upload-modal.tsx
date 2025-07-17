"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useCreditBalance } from "@/hooks/use-credit-balance"
import { useAuth } from "@/components/providers/auth-provider"
import { Upload, X, AlertCircle, Coins, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"
import { createClient } from "@/utils/supabase/client"

interface UploadModalProps {
  isOpen: boolean
  onCloseAction: () => void
}

export function UploadModal({ isOpen, onCloseAction }: UploadModalProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadComplete, setUploadComplete] = useState(false)

  const { user } = useAuth()
  const { credits } = useCreditBalance(user?.id)

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

    setUploading(true)
    setUploadProgress(0)

    try {
      const response = await uploadVideo(selectedFile)
      setUploadProgress(100)
      setUploadComplete(true)

      toast.success(`Video uploaded successfully! Video ID: ${response.videoId || response.id}`)
      console.log("Upload response:", response)

      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error: any) {
      console.error("Upload error:", error)
      handleUploadError(error)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (!uploading) {
      onCloseAction()
      setSelectedFile(null)
      setUploadProgress(0)
      setUploadComplete(false)
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

          {/* Upload Complete */}
          {uploadComplete && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Upload completed successfully! Processing will begin shortly.</span>
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
              <p className="text-xs text-muted-foreground">Please don't close this window while uploading...</p>
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
