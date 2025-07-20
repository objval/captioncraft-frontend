import { RefObject } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Film } from "lucide-react"
import { VideoControls } from "./VideoControls"
import { ProgressBar } from "./ProgressBar"
import { VolumeControl } from "./VolumeControl"
import type { Video } from "@/lib/api"

interface VideoPlayerProps {
  video: Video
  videoRef: RefObject<HTMLVideoElement>
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
}

export function VideoPlayer({
  video,
  videoRef,
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
}: VideoPlayerProps) {
  return (
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
              onVideoVolumeChange?.(target.volume, target.muted)
            }}
          />
        </div>

        {/* Player Controls */}
        <div className="space-y-3">
          {/* Play/Pause and Skip Controls */}
          <VideoControls
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlayPause}
            onSkipBackward={onSkipBackward}
            onSkipForward={onSkipForward}
          />

          {/* Progress Bar */}
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={onSeek}
          />

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