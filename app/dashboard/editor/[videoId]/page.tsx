"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { api, type Video, type TranscriptData, type TranscriptWord, type TranscriptSegment } from "@/lib/api/api"
import { getUserVideo } from "@/lib/media/videos"
import { useDebounce } from "@/hooks/utils"
import { useSingleVideoSubscription, useTranscriptEditing, useVideoControls } from "@/hooks/video"
import type { SaveStatus, EditMode } from "@/lib/utils/types"
import { KeyboardShortcuts } from "@/components/dashboard/editor/KeyboardShortcuts"
import { VideoPlayer } from "@/components/dashboard/editor/VideoPlayer"
import { EditorHeader } from "@/components/dashboard/editor/EditorHeader"
import { TranscriptEditor } from "@/components/dashboard/editor/TranscriptEditor"
import { LoadingState } from "@/components/dashboard/editor/LoadingState"
import { ErrorState } from "@/components/dashboard/editor/ErrorState"
import toast from "@/lib/utils/toast"


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

  // Video player controls
  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    seekTo,
    togglePlayPause,
    handleVolumeChange,
    toggleMute,
    skipBackward,
    skipForward,
  } = useVideoControls(videoRef)

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
        
        // Construct final_video_url if needed
        if (videoData.final_video_cloudinary_id && !videoData.final_video_url) {
          videoData.final_video_url = `https://res.cloudinary.com/dl32shhkk/video/upload/${videoData.final_video_cloudinary_id}`
        }
        
        setVideo(videoData)

        // If final video is available, default to showing it
        if ((videoData.final_video_url || videoData.final_video_cloudinary_id) && videoData.status === "complete") {
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
  const handleVideoUpdate = useCallback((updatedVideo: Video) => {
    setVideo(prev => {
      if (!prev) return prev
      return {
        ...prev,
        ...updatedVideo,
        original_video_url: updatedVideo.original_video_url || prev.original_video_url,
        final_video_url: updatedVideo.final_video_url || prev.final_video_url,
      }
    })
  }, [])

  const handleStatusChange = useCallback((status: string, finalVideoUrl: string | null) => {
    if (status === "complete" && finalVideoUrl) {
      setShowFinalVideo(true)
    }
  }, [])

  useSingleVideoSubscription(videoId, handleVideoUpdate, handleStatusChange)

  // Transcript editing handlers
  const { handleSegmentEdit, handleWordEdit } = useTranscriptEditing({
    transcriptData,
    onSave: (updatedTranscript) => {
      setTranscriptData(updatedTranscript)
      debouncedSave(updatedTranscript)
    },
  })

  const handleSegmentSave = useCallback(
    (segmentId: number, text: string, startTime: number, endTime: number) => {
      handleSegmentEdit(segmentId, text, startTime, endTime)
      setEditingSegmentId(null)
    },
    [handleSegmentEdit]
  )

  const handleWordSave = useCallback(
    (index: number, word: string, startTime: number, endTime: number) => {
      handleWordEdit(index, word, startTime, endTime)
      setEditingWordIndex(null)
    },
    [handleWordEdit]
  )

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
  }, [transcriptData, setCurrentTime, setDuration, setIsPlaying])

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
  }, [showFinalVideo, video?.final_video_url, video?.original_video_url, video])

  // Auto-save with debouncing
  const debouncedSave = useDebounce(async (updatedTranscript: TranscriptData) => {
    if (!video) return

    setSaveStatus("saving")
    try {
      await api.updateVideoTranscript(video.id, updatedTranscript)
      setSaveStatus("saved")
      toast.success("Changes saved")
    } catch (error) {
      setSaveStatus("error")
      toast.error("Failed to save changes")
    }
  }, 1000)


  // Editing functions
  const startEditingSegment = useCallback((segment: TranscriptSegment) => {
    setEditingSegmentId(segment.id)
    setEditingText(segment.text)
    setEditingStartTime(segment.start)
    setEditingEndTime(segment.end)
    setSaveStatus("editing")
  }, [])


  const cancelSegmentEdit = useCallback(() => {
    setEditingSegmentId(null)
    setEditingText("")
    setSaveStatus("saved")
  }, [])

  const startEditingWord = useCallback((wordIndex: number) => {
    if (!transcriptData?.words) return

    const word = transcriptData.words[wordIndex]
    setEditingWordIndex(wordIndex)
    setEditingText(word.word)
    setEditingStartTime(word.start)
    setEditingEndTime(word.end)
    setSaveStatus("editing")
  }, [transcriptData?.words])


  const cancelWordEdit = useCallback(() => {
    setEditingWordIndex(null)
    setEditingText("")
    setSaveStatus("saved")
  }, [])

  const jumpToSegment = useCallback((segment: TranscriptSegment) => {
    seekTo(segment.start)
  }, [seekTo])

  const jumpToWord = useCallback((word: TranscriptWord) => {
    seekTo(word.start)
  }, [seekTo])

  const handleBurnIn = useCallback(async () => {
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
  }, [video])


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const actions: Record<string, () => void> = {
        " ": togglePlayPause,
        "ArrowLeft": skipBackward,
        "ArrowRight": skipForward,
        "m": toggleMute,
      }

      if (actions[e.key]) {
        e.preventDefault()
        actions[e.key]()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [togglePlayPause, skipBackward, skipForward, toggleMute])


  if (loading) return <LoadingState />
  if (!video || !transcriptData) return <ErrorState />

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-none px-4 md:px-6 lg:px-8 py-4 space-y-4">
        {/* Enhanced Header */}
        <EditorHeader
          video={video}
          transcriptData={transcriptData}
          duration={duration}
          saveStatus={saveStatus}
          showFinalVideo={showFinalVideo}
          onShowFinalVideoChange={setShowFinalVideo}
          onBurnIn={handleBurnIn}
          burningIn={burningIn}
        />

        {/* Main Content */}
        <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <VideoPlayer
              video={video}
              videoRef={videoRef}
              showFinalVideo={showFinalVideo}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              onTogglePlayPause={togglePlayPause}
              onSeek={seekTo}
              onVolumeChange={handleVolumeChange}
              onToggleMute={toggleMute}
              onSkipBackward={skipBackward}
              onSkipForward={skipForward}
              onVideoVolumeChange={(vol, muted) => {
                setVolume(vol)
                setIsMuted(muted)
              }}
            />
          </div>

          {/* Transcript Editor */}
          <div className="lg:col-span-1 h-full">
            <TranscriptEditor
              transcriptData={transcriptData}
              editMode={editMode}
              activeSegmentId={activeSegmentId}
              activeWordIndex={activeWordIndex}
              editingSegmentId={editingSegmentId}
              editingWordIndex={editingWordIndex}
              onEditModeChange={setEditMode}
              onSegmentClick={jumpToSegment}
              onWordClick={(word, index) => jumpToWord(word)}
              onStartEditSegment={startEditingSegment}
              onStartEditWord={startEditingWord}
              onSaveSegmentEdit={handleSegmentSave}
              onSaveWordEdit={handleWordSave}
              onCancelSegmentEdit={cancelSegmentEdit}
              onCancelWordEdit={cancelWordEdit}
            />
          </div>
        </div>

        {/* Keyboard Shortcuts Help - Hidden on Mobile */}
        <KeyboardShortcuts />
      </div>

    </div>
  )
}