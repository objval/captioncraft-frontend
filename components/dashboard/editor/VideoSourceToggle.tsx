import { Button } from "@/components/ui/button"
import { Monitor, Film } from "lucide-react"

interface VideoSourceToggleProps {
  showFinalVideo: boolean
  hasFinalVideo: boolean
  onToggle: (showFinal: boolean) => void
}

export function VideoSourceToggle({ showFinalVideo, hasFinalVideo, onToggle }: VideoSourceToggleProps) {
  if (!hasFinalVideo) return null

  return (
    <div className="flex rounded-lg border bg-card/60 dark:bg-card/40 backdrop-blur-sm shadow-sm">
      <Button
        variant={showFinalVideo ? "ghost" : "default"}
        size="sm"
        onClick={() => onToggle(false)}
        className={`h-9 border-0 transition-all ${!showFinalVideo ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-card/80 dark:hover:bg-card/60'}`}
      >
        <Monitor className="h-4 w-4 mr-2" />
        Original
      </Button>
      <Button
        variant={showFinalVideo ? "default" : "ghost"}
        size="sm"
        onClick={() => onToggle(true)}
        className={`h-9 border-0 transition-all ${showFinalVideo ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-card/80 dark:hover:bg-card/60'}`}
      >
        <Film className="h-4 w-4 mr-2" />
        With Captions
      </Button>
    </div>
  )
}