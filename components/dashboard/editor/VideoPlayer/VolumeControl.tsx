import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX } from "lucide-react"

interface VolumeControlProps {
  volume: number
  isMuted: boolean
  onVolumeChange: (volume: number[]) => void
  onToggleMute: () => void
}

export function VolumeControl({ volume, isMuted, onVolumeChange, onToggleMute }: VolumeControlProps) {
  return (
    <div className="flex items-center gap-3 justify-center sm:justify-start">
      <Button variant="ghost" size="sm" onClick={onToggleMute} className="h-8 w-8 p-0">
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
      <Slider
        value={[isMuted ? 0 : volume]}
        max={1}
        step={0.1}
        onValueChange={onVolumeChange}
        className="w-20 sm:w-24 touch-pan-x"
      />
    </div>
  )
}