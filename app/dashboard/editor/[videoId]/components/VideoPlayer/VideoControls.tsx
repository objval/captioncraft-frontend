import { Button } from "@/components/ui/button"
import { Play, Pause, SkipBack, SkipForward } from "lucide-react"

interface VideoControlsProps {
  isPlaying: boolean
  onTogglePlay: () => void
  onSkipBackward: () => void
  onSkipForward: () => void
}

export function VideoControls({ isPlaying, onTogglePlay, onSkipBackward, onSkipForward }: VideoControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Button variant="outline" size="sm" onClick={onSkipBackward} className="h-10 w-10 p-0">
        <SkipBack className="h-4 w-4" />
      </Button>
      <Button onClick={onTogglePlay} size="lg" className="h-12 w-12 p-0 rounded-full">
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
      </Button>
      <Button variant="outline" size="sm" onClick={onSkipForward} className="h-10 w-10 p-0">
        <SkipForward className="h-4 w-4" />
      </Button>
    </div>
  )
}