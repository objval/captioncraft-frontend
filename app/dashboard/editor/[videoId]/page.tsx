"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { api, type Video, type TranscriptData, type TranscriptWord, type TranscriptSegment } from "@/lib/api/api"
import { getUserVideo } from "@/lib/media/videos"
import { useDebounce } from "@/hooks/utils"
import { useSingleVideoSubscription, useTranscriptEditing, useVideoControls, useVideoCutting } from "@/hooks/video"
import type { SaveStatus, EditMode } from "@/lib/utils/types"
import { KeyboardShortcuts } from "@/components/dashboard/editor/KeyboardShortcuts"
import { VideoPlayer } from "@/components/dashboard/editor/VideoPlayer"
import { EditorHeader } from "@/components/dashboard/editor/EditorHeader"
import { TranscriptEditor } from "@/components/dashboard/editor/TranscriptEditor"
import { LoadingState } from "@/components/dashboard/editor/LoadingState"
import { ErrorState } from "@/components/dashboard/editor/ErrorState"
import { CutListPanel } from "@/components/dashboard/editor/VideoPlayer/CutListPanel"
import { CuttingDialog } from "@/components/dashboard/editor/CuttingDialog"
import { TimelineCuttingHelp } from "@/components/dashboard/editor/TimelineCuttingHelp"
import type { VideoSource } from "@/components/dashboard/editor/VideoSourceSelector"
import { convertCutMarksToKeepSegments, validateKeepSegments } from "@/lib/utils/cutting-helpers"
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
  const [enableCutting, setEnableCutting] = useState(false)
  const [videoSource, setVideoSource] = useState<VideoSource>('original')
  const [showCuttingDialog, setShowCuttingDialog] = useState(false)

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

  // Video cutting state
  const {
    cutMarks,
    activeCutId,
    isPreviewMode,
    showCutOverlay,
    cutMode,
    draft,
    stats,
    addCutMark,
    updateCutMark,
    removeCutMark,
    startDraft,
    updateDraft,
    completeDraft,
    cancelDraft,
    setActiveCut,
    togglePreviewMode,
    toggleCutOverlay,
    setCutMode,
    clearAllCuts,
    undo,
    redo,
    isTimeInCut,
    getNextValidTime,
    canUndo,
    canRedo,
  } = useVideoCutting({ videoDuration: duration })

  // Handle seek with preview mode consideration
  const handleSeek = useCallback((time: number) => {
    const validTime = getNextValidTime(time)
    seekTo(validTime)
  }, [seekTo, getNextValidTime])

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

        // Set appropriate video source based on available versions
        if (videoData.cut_burned_url) {
          setVideoSource('cut_burned')
        } else if (videoData.cut_original_url) {
          setVideoSource('cut_original')
        } else if ((videoData.final_video_url || videoData.final_video_cloudinary_id) && videoData.status === "complete") {
          setVideoSource('burned')
          setShowFinalVideo(true) // Keep for backwards compatibility
        } else {
          setVideoSource('original')
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
      
      const updated = {
        ...prev,
        ...updatedVideo,
        original_video_url: updatedVideo.original_video_url || prev.original_video_url,
        final_video_url: updatedVideo.final_video_url || prev.final_video_url,
        cut_original_url: updatedVideo.cut_original_url || prev.cut_original_url,
        cut_burned_url: updatedVideo.cut_burned_url || prev.cut_burned_url,
      }
      
      // Auto-switch to new cut version when available
      if (updatedVideo.cut_original_url && !prev.cut_original_url) {
        setVideoSource('cut_original')
        toast.success('Cut video ready! Switched to cut version.')
      } else if (updatedVideo.cut_burned_url && !prev.cut_burned_url) {
        setVideoSource('cut_burned')
        toast.success('Cut video with captions ready!')
      }
      
      return updated
    })
  }, [])

  const handleStatusChange = useCallback((status: string, finalVideoUrl: string | null) => {
    if (status === "complete" && finalVideoUrl) {
      // Only auto-switch if we're currently showing original
      if (videoSource === 'original') {
        setVideoSource('burned')
        setShowFinalVideo(true)
      }
    }
  }, [videoSource])

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

  // Get video URL based on current source
  const getVideoUrl = useCallback(() => {
    if (!video) return null
    
    switch (videoSource) {
      case 'original':
        return video.original_video_url
      case 'burned':
        return video.final_video_url || video.burned_video_url
      case 'cut_original':
        return video.cut_original_url
      case 'cut_burned':
        return video.cut_burned_url
      default:
        return video.original_video_url
    }
  }, [video, videoSource])

  // Handle video source switching
  useEffect(() => {
    if (videoRef.current && video) {
      const videoElement = videoRef.current
      const newUrl = getVideoUrl()
      
      // Only update if URL actually changed
      if (videoElement.src !== newUrl && newUrl) {
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
        
        // Update the source
        videoElement.src = newUrl
        videoElement.load()
      }
    }
  }, [videoSource, video, getVideoUrl])

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
      // The API will automatically use the appropriate source (original or cut)
      await api.burnInVideo(video.id)
      toast.success(`Caption burning started for ${videoSource.includes('cut') ? 'cut' : 'original'} video! Your video will be ready shortly.`)
    } catch (error) {
      console.error("Error burning in video:", error)
      toast.error("Failed to start caption burning")
    } finally {
      setBurningIn(false)
    }
  }, [video, videoSource])

  // Handle source change
  const handleSourceChange = useCallback((source: VideoSource) => {
    setVideoSource(source)
    // Update showFinalVideo for backwards compatibility
    setShowFinalVideo(source === 'burned' || source === 'cut_burned')
  }, [])

  // Handle cut complete - reload video data
  const handleCutComplete = useCallback(async () => {
    // The video will be updated via realtime subscription
    // Just close the dialog and wait for the update
    toast.info('Processing your video cut. It will appear shortly...')
  }, [])

  // Handle timeline cuts execution
  const handleExecuteTimelineCuts = useCallback(async () => {
    if (!video || !duration || cutMarks.length === 0) {
      toast.error('No cuts to apply')
      return
    }

    // Convert cut marks to segments to keep
    const keepSegments = convertCutMarksToKeepSegments(cutMarks, duration)
    
    // Validate segments
    const validation = validateKeepSegments(keepSegments)
    if (!validation.isValid) {
      toast.error(`Invalid cuts: ${validation.errors.join(', ')}`)
      return
    }

    // Confirm with user
    const totalCutDuration = cutMarks.reduce((sum, mark) => sum + (mark.endTime - mark.startTime), 0)
    const percentageRemoved = ((totalCutDuration / duration) * 100).toFixed(1)
    
    if (!confirm(`This will remove ${cutMarks.length} sections (${percentageRemoved}% of the video). Continue?`)) {
      return
    }

    try {
      // Determine source type based on current video source
      const sourceType = videoSource.includes('burned') ? 'burned' : 'original'
      
      await api.cutVideo(video.id, {
        sourceType,
        mode: 'manual',
        manualSegments: keepSegments
      })
      
      toast.success('Video cutting started! Your video will be ready shortly.')
      
      // Clear cuts after successful submission
      clearAllCuts()
      setEnableCutting(false)
    } catch (error: any) {
      console.error('Timeline cutting error:', error)
      if (error.message?.includes('credits')) {
        toast.error('Insufficient credits. You need at least 1 credit to cut a video.')
      } else {
        toast.error('Failed to cut video')
      }
    }
  }, [video, duration, cutMarks, videoSource, clearAllCuts])

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
        <div className="space-y-3">
          <EditorHeader
            video={video}
            transcriptData={transcriptData}
            duration={duration}
            saveStatus={saveStatus}
            showFinalVideo={showFinalVideo}
            onShowFinalVideoChange={setShowFinalVideo}
            onBurnIn={handleBurnIn}
            burningIn={burningIn}
            enableCutting={enableCutting}
            onToggleCutting={() => setEnableCutting(!enableCutting)}
            onCutVideo={() => {
              if (!transcriptData) {
                toast.error('Video must be transcribed before cutting')
                return
              }
              setShowCuttingDialog(true)
            }}
            onExecuteTimelineCuts={enableCutting && cutMarks.length > 0 ? handleExecuteTimelineCuts : undefined}
            cutMarksCount={cutMarks.length}
            videoSource={videoSource}
            onVideoSourceChange={handleSourceChange}
          />
        </div>

        {/* Timeline Cutting Help */}
        {enableCutting && (
          <TimelineCuttingHelp />
        )}

        {/* Main Content */}
        <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <VideoPlayer
                video={video}
                videoRef={videoRef}
                videoUrl={getVideoUrl()}
                showFinalVideo={showFinalVideo}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
                isMuted={isMuted}
                onTogglePlayPause={togglePlayPause}
                onSeek={enableCutting ? handleSeek : seekTo}
                onVolumeChange={handleVolumeChange}
                onToggleMute={toggleMute}
                onSkipBackward={skipBackward}
                onSkipForward={skipForward}
                onVideoVolumeChange={(vol, muted) => {
                  setVolume(vol)
                  setIsMuted(muted)
                }}
                // Cutting props
                enableCutting={enableCutting}
                cutMarks={cutMarks}
                activeCutId={activeCutId}
                draft={draft}
                showCutOverlay={showCutOverlay}
                isPreviewMode={isPreviewMode}
                cutMode={cutMode}
                canUndo={canUndo}
                canRedo={canRedo}
                onStartDraft={startDraft}
                onUpdateDraft={updateDraft}
                onCompleteDraft={completeDraft}
                onCancelDraft={cancelDraft}
                onSelectCut={setActiveCut}
                onUpdateCutMark={updateCutMark}
                onSetCutMode={setCutMode}
                onTogglePreviewMode={togglePreviewMode}
                onToggleCutOverlay={toggleCutOverlay}
                onClearAllCuts={clearAllCuts}
                onUndo={undo}
                onRedo={redo}
              />
              
              {/* Cut List Panel - Show only when cutting is enabled */}
              {enableCutting && (
                <CutListPanel
                  cutMarks={cutMarks}
                  activeCutId={activeCutId}
                  totalCutDuration={stats.totalCutDuration}
                  remainingDuration={stats.remainingDuration}
                  percentageCut={stats.percentageCut}
                  onSelectCut={setActiveCut}
                  onUpdateCutMark={updateCutMark}
                  onRemoveCutMark={removeCutMark}
                  onSeekToTime={handleSeek}
                />
              )}
            </div>
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

      {/* Cutting Dialog */}
      {video && (
        <CuttingDialog
          open={showCuttingDialog}
          onOpenChange={setShowCuttingDialog}
          video={video}
          onCutComplete={handleCutComplete}
        />
      )}
    </div>
  )
}