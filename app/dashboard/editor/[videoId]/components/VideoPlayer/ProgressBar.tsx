import { Slider } from "@/components/ui/slider"
import { formatTime } from "../../utils/time-formatters"

interface ProgressBarProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
}

export function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-medium">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <Slider
        value={[currentTime]}
        max={duration}
        step={0.1}
        onValueChange={([value]) => onSeek(value)}
        className="w-full touch-pan-x"
      />
    </div>
  )
}