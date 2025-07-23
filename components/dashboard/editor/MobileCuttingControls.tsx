import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Scissors, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight,
  Smartphone,
  MousePointer2,
  Check
} from 'lucide-react'
import { formatTime } from '@/lib/utils/time-formatters'
import { cn } from '@/lib/utils/general'

interface MobileCuttingControlsProps {
  currentTime: number
  duration: number
  isPlaying: boolean
  onTogglePlay: () => void
  onSeek: (time: number) => void
  onStartCut: () => void
  onEndCut: () => void
  isDrafting: boolean
  className?: string
}

export function MobileCuttingControls({
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  onSeek,
  onStartCut,
  onEndCut,
  isDrafting,
  className
}: MobileCuttingControlsProps) {
  const skipAmount = 1 // Skip 1 second for mobile precision

  const handleSkipBackward = () => {
    onSeek(Math.max(0, currentTime - skipAmount))
  }

  const handleSkipForward = () => {
    onSeek(Math.min(duration, currentTime + skipAmount))
  }

  const handleFrameBackward = () => {
    onSeek(Math.max(0, currentTime - 0.1)) // 0.1 second for frame-level precision
  }

  const handleFrameForward = () => {
    onSeek(Math.min(duration, currentTime + 0.1))
  }

  return (
    <div className={cn("lg:hidden", className)}>
      <Card className="p-4 space-y-4 bg-secondary/50">
        {/* Mobile Instructions */}
        <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-sm">
            <p className="font-medium mb-1">Mobile Cutting Mode</p>
            <p>Use the controls below to navigate and mark cuts precisely</p>
          </AlertDescription>
        </Alert>

        {/* Current Time Display */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Current Position</p>
          <p className="text-2xl font-mono font-bold">{formatTime(currentTime)}</p>
          <p className="text-xs text-muted-foreground">of {formatTime(duration)}</p>
        </div>

        {/* Navigation Controls */}
        <div className="space-y-3">
          {/* Main Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              size="lg"
              variant="outline"
              onClick={handleSkipBackward}
              className="h-12 w-12"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              size="lg"
              variant="default"
              onClick={onTogglePlay}
              className="h-14 w-14"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={handleSkipForward}
              className="h-12 w-12"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Fine Control */}
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleFrameBackward}
              className="text-xs"
            >
              -0.1s
            </Button>
            <span className="text-xs text-muted-foreground px-2">Fine Adjust</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleFrameForward}
              className="text-xs"
            >
              +0.1s
            </Button>
          </div>
        </div>

        {/* Cut Marking Buttons */}
        <div className="space-y-2">
          {!isDrafting ? (
            <Button
              size="lg"
              variant="destructive"
              onClick={onStartCut}
              className="w-full h-14 text-base"
            >
              <Scissors className="h-5 w-5 mr-2" />
              Start Cut Here
            </Button>
          ) : (
            <>
              <Alert className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                <AlertDescription className="text-sm">
                  Navigate to where you want the cut to end
                </AlertDescription>
              </Alert>
              <Button
                size="lg"
                variant="destructive"
                onClick={onEndCut}
                className="w-full h-14 text-base"
              >
                <Check className="h-5 w-5 mr-2" />
                End Cut Here
              </Button>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t space-y-2">
          <p className="text-xs text-muted-foreground text-center mb-2">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSeek(0)}
              className="text-xs"
            >
              Jump to Start
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSeek(duration)}
              className="text-xs"
            >
              Jump to End
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}