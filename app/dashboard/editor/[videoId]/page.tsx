"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { api, type Video, type TranscriptData, type TranscriptWord, type TranscriptSegment } from "@/lib/api"
import { getUserVideo, updateVideoTranscript } from "@/lib/videos"
import {
  Play,
  Pause,
  Save,
  Flame,
  CheckCircle,
  Clock,
  AlertCircle,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  Edit3,
  Type,
  List,
  MousePointer,
  Download,
  Timer,
  Eye,
  EyeOff,
  Monitor,
  Film,
} from "lucide-react"
import toast from "react-hot-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/utils/supabase/client"

// Debounce hook
function useDebounce(callback: Function, delay: number) {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>()

  const debouncedCallback = useCallback(
    (...args: any[]) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      const newTimer = setTimeout(() => {
        callback(...args)
      }, delay)

      setDebounceTimer(newTimer)
    },
    [callback, delay, debounceTimer],
  )

  return debouncedCallback
}

type SaveStatus = "saved" | "saving" | "editing" | "error"
type EditMode = "segments" | "words"

// Helper function to format time
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

// Helper function to format time with milliseconds
const formatTimeDetailed = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`
}

// Helper function to detect RTL languages
const isRTLLanguage = (language?: string): boolean => {
  if (!language) return false
  const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'yi', 'iw', 'ji', 'ku', 'ps', 'sd']
  return rtlLanguages.includes(language.toLowerCase().substring(0, 2))
}

// Helper function to get text direction
const getTextDirection = (language?: string): 'ltr' | 'rtl' => {
  return isRTLLanguage(language) ? 'rtl' : 'ltr'
}

export default function EditorPage() {
  const params = useParams() || {}
  const videoId = params.videoId as string
  const videoRef = useRef<HTMLVideoElement>(null)

  // Video and transcript state
  const [video, setVideo] = useState<Video | null>(null)
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved")
  const [burningIn, setBurningIn] = useState(false)
  const [editMode, setEditMode] = useState<EditMode>("segments")
  const [showFinalVideo, setShowFinalVideo] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  // Transcript editing state
  const [editingSegmentId, setEditingSegmentId] = useState<number | null>(null)
  const [editingWordIndex, setEditingWordIndex] = useState<number | null>(null)
  const [editingText, setEditingText] = useState("")
  const [editingStartTime, setEditingStartTime] = useState<number>(0)
  const [editingEndTime, setEditingEndTime] = useState<number>(0)
  const [activeSegmentId, setActiveSegmentId] = useState<number | null>(null)
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null)

  // Load video and transcript data
  useEffect(() => {
    const loadData = async () => {
      try {
        const videoData = await getUserVideo(videoId)
        setVideo(videoData)

        // If final video is available, default to showing it
        if (videoData.final_video_url && videoData.status === "complete") {
          setShowFinalVideo(true)
        }

        // Use transcript_data directly from video or from transcripts array
        const transcript = videoData.transcript_data || videoData.transcripts?.[0]?.transcript_data
        if (transcript) {
          setTranscriptData(transcript)
        } else {
          toast.error("No transcript found for this video")
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Failed to load video data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [videoId])

  // Real-time subscription for video updates
  useEffect(() => {
    if (!videoId) return

    const supabase = createClient()
    
    const channel = supabase
      .channel(`video-${videoId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "videos",
          filter: `id=eq.${videoId}`,
        },
                 (payload: any) => {
           const updatedVideo = payload.new as Video
           console.log("Video updated:", updatedVideo)
           
           setVideo(prev => {
             if (!prev) return prev
             return {
               ...prev,
               ...updatedVideo,
               // Use the URL directly from the database, no need to construct it
               original_video_url: updatedVideo.original_video_url || prev.original_video_url,
               final_video_url: updatedVideo.final_video_url || prev.final_video_url,
             }
           })

           // Auto-switch to final video when burning is complete
           if (updatedVideo.status === "complete" && updatedVideo.final_video_cloudinary_id) {
             setShowFinalVideo(true)
             toast.success("Video processing complete! Showing final video with burned-in captions.")
           } else if (updatedVideo.status === "burning_in") {
             toast.success("Burning captions into video...")
           } else if (updatedVideo.status === "failed") {
             toast.error("Video processing failed. Please try again.")
           }
         },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [videoId])

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)

      // Find active segment
      if (transcriptData?.segments) {
        const activeSegment = transcriptData.segments.find(
          (segment) => video.currentTime >= segment.start && video.currentTime <= segment.end,
        )
        setActiveSegmentId(activeSegment?.id ?? null)
      }

      // Find active word
      if (transcriptData?.words) {
        const activeWordIdx = transcriptData.words.findIndex(
          (word) => video.currentTime >= word.start && video.currentTime <= word.end,
        )
        setActiveWordIndex(activeWordIdx >= 0 ? activeWordIdx : null)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
    }
  }, [transcriptData])

  // Handle video source switching
  useEffect(() => {
    if (videoRef.current && video) {
      // When video source changes, we need to properly reload the video
      const videoElement = videoRef.current
      
      // Store current state
      const wasPlaying = !videoElement.paused
      const currentPosition = videoElement.currentTime
      
      // Add event listener for when metadata is loaded
      const handleLoadedMetadata = () => {
        // Restore position
        if (currentPosition > 0) {
          videoElement.currentTime = currentPosition
        }
        
        // Resume playback if it was playing
        if (wasPlaying) {
          videoElement.play().catch(error => {
            console.error("Error playing video after source change:", error)
            toast.error("Could not play video. Please try manually clicking play.")
          })
        }
        
        // Remove this listener after it runs once
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
      
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)
      
      // Force reload by setting currentTime to 0
      videoElement.currentTime = 0
    }
  }, [showFinalVideo, video?.final_video_url, video?.original_video_url])

  // Auto-save with debouncing
  const debouncedSave = useDebounce(async (updatedTranscript: TranscriptData) => {
    if (!video) return

    setSaveStatus("saving")
    try {
      await updateVideoTranscript(video.id, updatedTranscript)
      setSaveStatus("saved")
      toast.success("Changes saved")
    } catch (error) {
      setSaveStatus("error")
      toast.error("Failed to save changes")
    }
  }, 1000)

  // Video control functions
  const togglePlayPause = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      // Wrap play() in a try/catch since it returns a promise that might reject
      videoRef.current.play()
        .catch(error => {
          console.error("Error playing video:", error)
          toast.error("Could not play video. The video source might be invalid or still processing.")
          
          // If the video fails to play, force a refresh of the source
          if (video && showFinalVideo && video.final_video_url) {
            toast("Attempting to reload the video...")
            // Toggle back to original video if final video can't be played
            setShowFinalVideo(false)
          }
        })
    }
  }

  const seekTo = (time: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = time
  }

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0]
    setVolume(vol)
    if (videoRef.current) {
      videoRef.current.volume = vol
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    const newMuted = !isMuted
    setIsMuted(newMuted)
    videoRef.current.muted = newMuted
  }

  const skipBackward = () => {
    seekTo(Math.max(0, currentTime - 5))
  }

  const skipForward = () => {
    seekTo(Math.min(duration, currentTime + 5))
  }

  // Editing functions
  const startEditingSegment = (segment: TranscriptSegment) => {
    setEditingSegmentId(segment.id)
    setEditingText(segment.text)
    setEditingStartTime(segment.start)
    setEditingEndTime(segment.end)
    setSaveStatus("editing")
  }

  const saveSegmentEdit = () => {
    if (!transcriptData || editingSegmentId === null) return

    const updatedSegments = transcriptData.segments.map((segment) =>
      segment.id === editingSegmentId
        ? { ...segment, text: editingText, start: editingStartTime, end: editingEndTime }
        : segment,
    )

    const updatedTranscript = { ...transcriptData, segments: updatedSegments }
    setTranscriptData(updatedTranscript)
    setEditingSegmentId(null)
    setEditingText("")
    debouncedSave(updatedTranscript)
  }

  const cancelSegmentEdit = () => {
    setEditingSegmentId(null)
    setEditingText("")
    setSaveStatus("saved")
  }

  const startEditingWord = (wordIndex: number) => {
    if (!transcriptData?.words) return

    const word = transcriptData.words[wordIndex]
    setEditingWordIndex(wordIndex)
    setEditingText(word.word)
    setEditingStartTime(word.start)
    setEditingEndTime(word.end)
    setSaveStatus("editing")
  }

  const saveWordEdit = () => {
    if (!transcriptData || editingWordIndex === null) return

    const updatedWords = transcriptData.words.map((word, index) =>
      index === editingWordIndex
        ? { ...word, word: editingText, start: editingStartTime, end: editingEndTime }
        : word,
    )

    const updatedTranscript = { ...transcriptData, words: updatedWords }
    setTranscriptData(updatedTranscript)
    setEditingWordIndex(null)
    setEditingText("")
    debouncedSave(updatedTranscript)
  }

  const cancelWordEdit = () => {
    setEditingWordIndex(null)
    setEditingText("")
    setSaveStatus("saved")
  }

  const jumpToSegment = (segment: TranscriptSegment) => {
    seekTo(segment.start)
  }

  const jumpToWord = (word: TranscriptWord) => {
    seekTo(word.start)
  }

  const handleBurnIn = async () => {
    if (!video) return

    setBurningIn(true)
    try {
      await api.burnInVideo(video.id)
      toast.success("Caption burning started! Your video will be ready shortly.")
    } catch (error) {
      console.error("Error burning in video:", error)
      toast.error("Failed to start caption burning")
    } finally {
      setBurningIn(false)
    }
  }

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case "saved":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "saving":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case "editing":
        return <Edit3 className="h-4 w-4 text-blue-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case "saved":
        return "Saved"
      case "saving":
        return "Saving..."
      case "editing":
        return "Editing"
      case "error":
        return "Error"
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case " ":
          e.preventDefault()
          togglePlayPause()
          break
        case "ArrowLeft":
          e.preventDefault()
          skipBackward()
          break
        case "ArrowRight":
          e.preventDefault()
          skipForward()
          break
        case "m":
          e.preventDefault()
          toggleMute()
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isPlaying, currentTime, duration])

  // Function to handle video download with progress tracking
  const handleVideoDownload = async () => {
    if (!video || !video.final_video_url || video.status !== "complete") {
      toast("Video is still being processed. Please wait until it's complete to download.");
      return;
    }
    
    setDownloadProgress(0);
    const toastId = toast.loading("Starting download...", {
      icon: '⏬',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      }
    });
    
    try {
      // Fetch the video
      const response = await fetch(video.final_video_url);
      
      if (!response.ok) throw new Error('Download failed');
      
      // Get content length to track progress
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;
      
      // Create reader to read the stream
      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];
      
      if (!reader) throw new Error('Failed to create reader');
      
      // Read the stream with progress
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        
        // Update progress
        if (total > 0) {
          const progress = Math.round((loaded / total) * 100);
          setDownloadProgress(progress);
          toast.loading(`Downloading: ${progress}%`, { id: toastId });
        }
      }
      
      // Combine all chunks into a single Blob
      const blob = new Blob(chunks, { type: 'video/mp4' });
      
      // Create and trigger download link
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${video.title || 'video'}-with-captions.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up
      URL.revokeObjectURL(downloadUrl);
      
      // Show success toast and reset progress
      toast.success("Download complete!", { id: toastId });
      setTimeout(() => setDownloadProgress(null), 1500);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download the video. Try again or right-click and save the video directly.", { id: toastId });
      setDownloadProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!video || !transcriptData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Video or transcript not found</h3>
          <p className="text-muted-foreground">
            The video or its transcript could not be loaded. Please try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full max-w-none px-4 md:px-6 lg:px-8 py-4 space-y-4">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-xl border bg-white/80 backdrop-blur-sm shadow-lg">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/20 to-transparent rounded-full -translate-y-32 translate-x-32" />
          
          <div className="relative p-4 md:p-6">
            {/* Top Row - Title and Status */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                    <Film className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 truncate">{video.title}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={video.status === 'complete' ? 'default' : video.status === 'failed' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {video.status === 'complete' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {video.status === 'processing' && <Clock className="h-3 w-3 mr-1 animate-spin" />}
                        {video.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                      </Badge>
                      {transcriptData.language && (
                        <Badge variant="outline" className="text-xs">
                          {transcriptData.language.toUpperCase()}
                          {isRTLLanguage(transcriptData.language) && ' (RTL)'}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/60 border border-slate-200/60">
                {getSaveStatusIcon()}
                <span className="text-sm font-medium text-slate-700">{getSaveStatusText()}</span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Video Source Toggle */}
              {video.final_video_url && (
                <div className="flex rounded-lg border bg-white/60 backdrop-blur-sm shadow-sm">
                  <Button
                    variant={showFinalVideo ? "ghost" : "default"}
                    size="sm"
                    onClick={() => setShowFinalVideo(false)}
                    className={`h-9 border-0 transition-all ${!showFinalVideo ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-white/80'}`}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Original
                  </Button>
                  <Button
                    variant={showFinalVideo ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setShowFinalVideo(true)}
                    className={`h-9 border-0 transition-all ${showFinalVideo ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-white/80'}`}
                  >
                    <Film className="h-4 w-4 mr-2" />
                    With Captions
                  </Button>
                </div>
              )}

              {/* Download Button */}
              {video.final_video_url && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 text-emerald-700 border-emerald-200 shadow-sm relative group overflow-hidden transition-all"
                  onClick={handleVideoDownload}
                  disabled={video.status !== "complete" || downloadProgress !== null}
                >
                  {downloadProgress !== null && (
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-green-300 transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  )}
                  <div className="relative flex items-center">
                    {downloadProgress !== null ? (
                      <>
                        <Timer className="h-4 w-4 mr-2 animate-pulse" />
                        {downloadProgress}% Downloaded
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                        Download Video
                      </>
                    )}
                  </div>
                  {video.status !== "complete" && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full animate-pulse" />
                  )}
                </Button>
              )}
              
              {/* Burn In Button */}
              <Button
                onClick={handleBurnIn}
                disabled={burningIn}
                className="h-9 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md transition-all"
                size="sm"
              >
                {burningIn ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Flame className="h-4 w-4 mr-2" />
                    Burn Captions
                  </>
                )}
              </Button>

              {/* Stats Cards */}
              <div className="flex items-center gap-3 ml-auto">
                <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/60 border border-slate-200/60">
                  <List className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">{transcriptData.segments?.length || 0}</span>
                  <span className="text-xs text-slate-500">segments</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/60 border border-slate-200/60">
                  <Type className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">{transcriptData.words?.length || 0}</span>
                  <span className="text-xs text-slate-500">words</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Film className="h-4 w-4" />
                  Video Player
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Video Element */}
                <div className="relative bg-black rounded-lg overflow-hidden shadow-xl">
                  <video
                    ref={videoRef}
                    className="w-full aspect-video"
                    src={showFinalVideo && video.final_video_url ? video.final_video_url : video.original_video_url}
                    onVolumeChange={(e) => {
                      const target = e.target as HTMLVideoElement
                      setVolume(target.volume)
                      setIsMuted(target.muted)
                    }}
                  />
                </div>

                {/* Player Controls */}
                <div className="space-y-3">
                  {/* Play/Pause and Skip Controls */}
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" size="sm" onClick={skipBackward} className="h-10 w-10 p-0">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button onClick={togglePlayPause} size="lg" className="h-12 w-12 p-0 rounded-full">
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={skipForward} className="h-10 w-10 p-0">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <Slider
                      value={[currentTime]}
                      max={duration}
                      step={0.1}
                      onValueChange={([value]) => seekTo(value)}
                      className="w-full touch-pan-x"
                    />
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <Button variant="ghost" size="sm" onClick={toggleMute} className="h-8 w-8 p-0">
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.1}
                      onValueChange={handleVolumeChange}
                      className="w-20 sm:w-24 touch-pan-x"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transcript Editor */}
          <div className="lg:col-span-1">
            <Card className="h-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg">
                    <Edit3 className="h-4 w-4" />
                    Transcript Editor
                  </div>
                  {transcriptData.language && (
                    <Badge variant="outline" className="text-xs">
                      {transcriptData.language.toUpperCase()} 
                      {isRTLLanguage(transcriptData.language) && ' (RTL)'}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full pb-4">
                <Tabs value={editMode} onValueChange={(value) => setEditMode(value as EditMode)} className="flex flex-col h-full">
                  <TabsList className="grid w-full grid-cols-2 h-9 flex-shrink-0 mb-3">
                    <TabsTrigger value="segments" className="text-sm">
                      <List className="h-3 w-3 mr-1.5" />
                      Segments
                    </TabsTrigger>
                    <TabsTrigger value="words" className="text-sm">
                      <Type className="h-3 w-3 mr-1.5" />
                      Words
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="segments" className="flex-1 flex flex-col min-h-0 mt-0">
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {transcriptData.segments.map((segment) => (
                        <div
                          key={segment.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors touch-pan-y ${
                            activeSegmentId === segment.id
                              ? "border-primary bg-primary/10"
                              : "border-border hover:bg-muted active:bg-muted"
                          }`}
                          onClick={() => jumpToSegment(segment)}
                        >
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {formatTimeDetailed(segment.start)} - {formatTimeDetailed(segment.end)}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditingSegment(segment)
                              }}
                              className="h-6 w-6 p-0 flex-shrink-0"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>

                          {editingSegmentId === segment.id ? (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label htmlFor="start-time" className="text-xs">
                                    Start Time
                                  </Label>
                                  <Input
                                    id="start-time"
                                    type="number"
                                    step="0.1"
                                    value={editingStartTime}
                                    onChange={(e) => setEditingStartTime(parseFloat(e.target.value))}
                                    className="text-xs"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="end-time" className="text-xs">
                                    End Time
                                  </Label>
                                  <Input
                                    id="end-time"
                                    type="number"
                                    step="0.1"
                                    value={editingEndTime}
                                    onChange={(e) => setEditingEndTime(parseFloat(e.target.value))}
                                    className="text-xs"
                                  />
                                </div>
                              </div>
                              <Textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="min-h-[60px] text-sm resize-none"
                                placeholder="Edit segment text..."
                                style={{ 
                                  direction: getTextDirection(transcriptData.language),
                                  textAlign: isRTLLanguage(transcriptData.language) ? 'right' : 'left'
                                }}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={saveSegmentEdit} className="flex-1">
                                  <Save className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelSegmentEdit} className="flex-1">
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p 
                              className="text-sm leading-relaxed break-words" 
                              style={{ 
                                direction: getTextDirection(transcriptData.language),
                                textAlign: isRTLLanguage(transcriptData.language) ? 'right' : 'left'
                              }}
                            >
                              {segment.text}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="words" className="flex-1 flex flex-col min-h-0 mt-0">
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      <div 
                        className={`flex flex-wrap gap-1.5 ${
                          isRTLLanguage(transcriptData.language) ? 'justify-end' : 'justify-start'
                        }`}
                        style={{ 
                          direction: getTextDirection(transcriptData.language),
                          textAlign: isRTLLanguage(transcriptData.language) ? 'right' : 'left',
                          unicodeBidi: 'isolate'
                        }}
                      >
                        {transcriptData.words.map((word, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1.5 rounded text-sm cursor-pointer transition-colors touch-pan-y min-h-[32px] flex items-center break-words ${
                              activeWordIndex === index
                                ? "bg-primary text-primary-foreground"
                                : editingWordIndex === index
                                ? "bg-blue-100 text-blue-800"
                                : "bg-muted hover:bg-muted/80 active:bg-muted"
                            }`}
                            onClick={() => jumpToWord(word)}
                            onDoubleClick={() => startEditingWord(index)}
                            style={{ direction: getTextDirection(transcriptData.language) }}
                          >
                            {word.word}
                          </span>
                        ))}
                      </div>

                      {editingWordIndex !== null && (
                        <div className="mt-4 p-4 border rounded-lg space-y-3 bg-muted/50">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="word-start" className="text-xs">
                                Start Time
                              </Label>
                              <Input
                                id="word-start"
                                type="number"
                                step="0.01"
                                value={editingStartTime}
                                onChange={(e) => setEditingStartTime(parseFloat(e.target.value))}
                                className="text-xs"
                              />
                            </div>
                            <div>
                              <Label htmlFor="word-end" className="text-xs">
                                End Time
                              </Label>
                              <Input
                                id="word-end"
                                type="number"
                                step="0.01"
                                value={editingEndTime}
                                onChange={(e) => setEditingEndTime(parseFloat(e.target.value))}
                                className="text-xs"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="word-text" className="text-xs">
                              Word Text
                            </Label>
                            <Input
                              id="word-text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="text-sm"
                              placeholder="Edit word..."
                              style={{ 
                                direction: getTextDirection(transcriptData.language),
                                textAlign: isRTLLanguage(transcriptData.language) ? 'right' : 'left'
                              }}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={saveWordEdit} className="flex-1">
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelWordEdit} className="flex-1">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Keyboard Shortcuts Help - Hidden on Mobile */}
        <Card className="hidden md:block shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MousePointer className="h-4 w-4" />
              Keyboard Shortcuts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Space</Badge>
                <span>Play/Pause</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">←</Badge>
                <span>Skip Back 5s</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">→</Badge>
                <span>Skip Forward 5s</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">M</Badge>
                <span>Mute/Unmute</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}