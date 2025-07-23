import { RefObject } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Film } from "lucide-react"
import { VideoControls } from "./VideoControls"
import { ProgressBar } from "./ProgressBar"
import { VolumeControl } from "./VolumeControl"
import { CuttingTimeline } from "./CuttingTimeline"
import { CutMarkControls } from "./CutMarkControls"
import type { Video } from "@/lib/api/api"
import type { CutMark, CutMarkDraft, CuttingState } from "@/lib/types/video-cutting"

interface VideoPlayerProps {
  video: Video
  videoRef: RefObject<HTMLVideoElement | null>
  videoUrl?: string | null
  showFinalVideo: boolean
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  onTogglePlayPause: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number[]) => void
  onToggleMute: () => void
  onSkipBackward: () => void
  onSkipForward: () => void
  onVideoVolumeChange?: (volume: number, muted: boolean) => void
  // Cutting props
  enableCutting?: boolean
  cutMarks?: CutMark[]
  activeCutId?: string | null
  draft?: CutMarkDraft | null
  showCutOverlay?: boolean
  isPreviewMode?: boolean
  cutMode?: CuttingState['cutMode']
  canUndo?: boolean
  canRedo?: boolean
  onStartDraft?: (startTime: number) => void
  onUpdateDraft?: (endTime: number) => void
  onCompleteDraft?: () => void
  onCancelDraft?: () => void
  onSelectCut?: (id: string) => void
  onUpdateCutMark?: (id: string, updates: Partial<CutMark>) => void
  onSetCutMode?: (mode: CuttingState['cutMode']) => void
  onTogglePreviewMode?: () => void
  onToggleCutOverlay?: () => void
  onClearAllCuts?: () => void
  onUndo?: () => void
  onRedo?: () => void
}

export function VideoPlayer({
  video,
  videoRef,
  videoUrl,
  showFinalVideo,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onTogglePlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onSkipBackward,
  onSkipForward,
  onVideoVolumeChange,
  // Cutting props
  enableCutting = false,
  cutMarks = [],
  activeCutId = null,
  draft = null,
  showCutOverlay = true,
  isPreviewMode = false,
  cutMode = 'marking',
  canUndo = false,
  canRedo = false,
  onStartDraft,
  onUpdateDraft,
  onCompleteDraft,
  onCancelDraft,
  onSelectCut,
  onUpdateCutMark,
  onSetCutMode,
  onTogglePreviewMode,
  onToggleCutOverlay,
  onClearAllCuts,
  onUndo,
  onRedo,
}: VideoPlayerProps) {
  return (
    <Card className="shadow-lg border-0 bg-card/80 dark:bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
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
            src={videoUrl}
            onVolumeChange={(e) => {
              const target = e.target as HTMLVideoElement
              onVideoVolumeChange?.(target.volume, target.muted)
            }}
          />
        </div>

        {/* Player Controls */}
        <div className="space-y-3">
          {/* Cutting Controls */}
          {enableCutting && (
            <CutMarkControls
              cutMode={cutMode}
              isPreviewMode={isPreviewMode}
              showCutOverlay={showCutOverlay}
              canUndo={canUndo}
              canRedo={canRedo}
              totalCuts={cutMarks.length}
              onSetCutMode={onSetCutMode!}
              onTogglePreviewMode={onTogglePreviewMode!}
              onToggleCutOverlay={onToggleCutOverlay!}
              onClearAllCuts={onClearAllCuts!}
              onUndo={onUndo!}
              onRedo={onRedo!}
            />
          )}

          {/* Play/Pause and Skip Controls */}
          <VideoControls
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlayPause}
            onSkipBackward={onSkipBackward}
            onSkipForward={onSkipForward}
          />

          {/* Progress Bar or Cutting Timeline */}
          {enableCutting ? (
            <CuttingTimeline
              currentTime={currentTime}
              duration={duration}
              cutMarks={cutMarks}
              activeCutId={activeCutId}
              draft={draft}
              showCutOverlay={showCutOverlay}
              isPreviewMode={isPreviewMode}
              onSeek={onSeek}
              onStartDraft={onStartDraft!}
              onUpdateDraft={onUpdateDraft!}
              onCompleteDraft={onCompleteDraft!}
              onCancelDraft={onCancelDraft!}
              onSelectCut={onSelectCut!}
              onUpdateCutMark={onUpdateCutMark!}
            />
          ) : (
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={onSeek}
            />
          )}

          {/* Volume Control */}
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={onVolumeChange}
            onToggleMute={onToggleMute}
          />
        </div>
      </CardContent>
    </Card>
  )
}