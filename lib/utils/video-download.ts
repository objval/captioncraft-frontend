import toast from "react-hot-toast"
import type { Video } from "@/lib/api/api"

export async function downloadVideo(
  video: Video,
  onProgress: (progress: number | null) => void
) {
  if (!video || !video.final_video_url || video.status !== "complete") {
    toast("Video is still being processed. Please wait until it's complete to download.")
    return
  }

  onProgress(0)
  const toastId = toast.loading("Starting download...", {
    icon: '⏬',
    style: {
      borderRadius: '10px',
      background: '#333',
      color: '#fff',
    }
  })

  try {
    // Fetch the video
    const response = await fetch(video.final_video_url)
    
    if (!response.ok) throw new Error('Download failed')
    
    // Get content length to track progress
    const contentLength = response.headers.get('content-length')
    const total = contentLength ? parseInt(contentLength, 10) : 0
    let loaded = 0
    
    // Create reader to read the stream
    const reader = response.body?.getReader()
    const chunks: Uint8Array[] = []
    
    if (!reader) throw new Error('Failed to create reader')
    
    // Read the stream with progress
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      loaded += value.length
      
      // Update progress
      if (total > 0) {
        const progress = Math.round((loaded / total) * 100)
        onProgress(progress)
        toast.loading(`Downloading: ${progress}%`, { id: toastId })
      }
    }
    
    // Combine all chunks into a single Blob
    const blob = new Blob(chunks, { type: 'video/mp4' })
    
    // Create and trigger download link
    const downloadUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `${video.title || 'video'}-with-captions.mp4`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    // Clean up
    URL.revokeObjectURL(downloadUrl)
    
    // Show success toast and reset progress
    toast.success("Download complete!", { id: toastId })
    setTimeout(() => onProgress(null), 1500)
  } catch (error) {
    console.error("Download error:", error)
    toast.error("Failed to download the video. Try again or right-click and save the video directly.", { id: toastId })
    onProgress(null)
  }
}