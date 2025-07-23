import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Monitor, Film, Scissors, ChevronDown, Sparkles } from "lucide-react"
import type { Video } from "@/lib/api/api"

export type VideoSource = 'original' | 'burned' | 'cut_original' | 'cut_burned'

interface VideoSourceSelectorProps {
  video: Video
  currentSource: VideoSource
  onSourceChange: (source: VideoSource) => void
}

const sourceOptions = [
  {
    value: 'original' as const,
    label: 'Original',
    icon: Monitor,
    description: 'Original uploaded video',
    check: (video: Video) => !!video.original_video_url,
  },
  {
    value: 'burned' as const,
    label: 'With Captions',
    icon: Film,
    description: 'Video with burned-in captions',
    check: (video: Video) => !!video.final_video_url,
  },
  {
    value: 'cut_original' as const,
    label: 'Cut Original',
    icon: Scissors,
    description: 'Cut version of original video',
    check: (video: Video) => !!video.cut_original_url,
  },
  {
    value: 'cut_burned' as const,
    label: 'Cut with Captions',
    icon: Scissors,
    description: 'Cut version with captions',
    check: (video: Video) => !!video.cut_burned_url,
  },
]

export function VideoSourceSelector({ video, currentSource, onSourceChange }: VideoSourceSelectorProps) {
  const availableSources = sourceOptions.filter(option => option.check(video))
  const allSources = sourceOptions // Keep all sources for display
  
  const currentOption = sourceOptions.find(opt => opt.value === currentSource) || sourceOptions[0]
  const Icon = currentOption.icon
  
  // Check if there's a newer version available
  const hasNewerVersion = (
    (currentSource === 'original' && (video.final_video_url || video.cut_original_url)) ||
    (currentSource === 'burned' && video.cut_burned_url) ||
    (currentSource === 'cut_original' && video.cut_burned_url)
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 relative"
        >
          <Icon className="h-4 w-4" />
          {currentOption.label}
          {hasNewerVersion && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary">
              <Sparkles className="h-3 w-3" />
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Video Source</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allSources.map((option) => {
          const OptionIcon = option.icon
          const isActive = currentSource === option.value
          const isAvailable = option.check(video)
          
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => isAvailable && onSourceChange(option.value)}
              className={`${isActive ? "bg-secondary" : ""} ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={!isAvailable}
            >
              <OptionIcon className="h-4 w-4 mr-2" />
              <div className="flex-1">
                <div className="font-medium">
                  {option.label}
                  {!isAvailable && <span className="text-xs ml-2">(Not available)</span>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {option.description}
                </div>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}