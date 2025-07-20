"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/database/supabase/client"
import toast from "@/lib/utils/toast"

interface UploadOptions {
  onProgress?: (progress: number) => void
  onSuccess?: (response: any) => void
  onError?: (error: Error) => void
}

export function useUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const supabase = createClient()

  const uploadVideo = useCallback(
    async (file: File, options: UploadOptions = {}) => {
      const { onProgress, onSuccess, onError } = options

      // Get auth token
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        const error = new Error("No authentication token found")
        onError?.(error)
        throw error
      }

      // Validate file
      const maxSize = 500 * 1024 * 1024 // 500MB
      if (file.size > maxSize) {
        const error = new Error(
          `File size exceeds 500MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        )
        onError?.(error)
        throw error
      }

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
        const error = new Error("Please upload a valid video file (MP4, AVI, MOV, MKV, WebM)")
        onError?.(error)
        throw error
      }

      setUploading(true)
      setProgress(0)

      try {
        const formData = new FormData()
        formData.append("video", file)

        // Use XMLHttpRequest for progress tracking
        const response = await new Promise<any>((resolve, reject) => {
          const xhr = new XMLHttpRequest()

          // Progress tracking
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100)
              setProgress(percentComplete)
              onProgress?.(percentComplete)
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

          // Error handlers
          xhr.addEventListener("error", () => {
            reject(new Error("Network error during upload"))
          })

          xhr.addEventListener("timeout", () => {
            reject(new Error("Upload timeout - please try again"))
          })

          // Setup request
          xhr.open("POST", "https://209f6fdb720c.34.176.101.69-free.app:3000/v1/videos/upload")
          xhr.setRequestHeader("Authorization", `Bearer ${token}`)
          xhr.withCredentials = true
          xhr.timeout = 300000 // 5 minute timeout

          // Send request
          xhr.send(formData)
        })

        setProgress(100)
        onSuccess?.(response)
        toast.success(`Video uploaded successfully!`)

        return response
      } catch (error: any) {
        console.error("Upload error:", error)

        // Enhanced error handling
        const errorMessage = error.message.toLowerCase()

        if (errorMessage.includes("413") || errorMessage.includes("payload too large")) {
          error.message = `File too large. Please upload a file smaller than 500MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
        } else if (errorMessage.includes("402") || errorMessage.includes("insufficient credits")) {
          error.message = "Insufficient credits. Please purchase more credits."
        } else if (errorMessage.includes("cors") || errorMessage.includes("network error")) {
          error.message = "Connection error. Please check your internet connection and try again."
        } else if (errorMessage.includes("400") || errorMessage.includes("bad request")) {
          error.message = "Invalid file format. Please upload a valid video file."
        } else if (errorMessage.includes("timeout")) {
          error.message = "Upload timeout. Please try again with a smaller file or better internet connection."
        }

        onError?.(error)
        toast.error(error.message)
        throw error
      } finally {
        setUploading(false)
      }
    },
    [supabase],
  )

  return {
    uploadVideo,
    uploading,
    progress,
  }
}
