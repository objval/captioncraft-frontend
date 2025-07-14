"use client"

import { Progress } from "@/components/ui/progress"
import { CheckCircle, Upload, AlertCircle } from "lucide-react"

interface UploadProgressProps {
  progress: number
  status: "uploading" | "complete" | "error"
  fileName?: string
  fileSize?: number
  error?: string
}

export function UploadProgress({ progress, status, fileName, fileSize, error }: UploadProgressProps) {
  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  return (
    <div className="space-y-4">
      {/* File Info */}
      {fileName && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium truncate">{fileName}</span>
          {fileSize && <span className="text-muted-foreground">{formatFileSize(fileSize)}</span>}
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            {status === "uploading" && <Upload className="h-4 w-4 animate-pulse" />}
            {status === "complete" && <CheckCircle className="h-4 w-4 text-blue-600" />}
            {status === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}

            {status === "uploading" && "Uploading..."}
            {status === "complete" && "Upload Complete"}
            {status === "error" && "Upload Failed"}
          </span>
          <span className="font-medium">{progress}%</span>
        </div>

        <Progress
          value={progress}
          className={`h-2 ${status === "complete" ? "bg-blue-100" : status === "error" ? "bg-red-100" : ""}`}
        />
      </div>

      {/* Status Messages */}
      {status === "uploading" && (
        <p className="text-xs text-muted-foreground">Please don't close this window while uploading...</p>
      )}

      {status === "complete" && (
        <p className="text-xs text-blue-600">Upload completed successfully! Processing will begin shortly.</p>
      )}

      {status === "error" && error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
