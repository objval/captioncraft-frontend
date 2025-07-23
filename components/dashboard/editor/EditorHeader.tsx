import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Flame,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Timer,
  List,
  Type,
  Film,
  Scissors,
  Wand2,
} from "lucide-react"
import type { Video, TranscriptData } from "@/lib/api/api"
import type { SaveStatus } from "@/lib/utils/types"
import { SaveStatusIndicator } from "./SaveStatusIndicator"
import { VideoSourceToggle } from "./VideoSourceToggle"
import { VideoSourceSelector, type VideoSource } from "./VideoSourceSelector"
import { downloadVideo } from "@/lib/utils/video-download"
import { formatTime } from "@/lib/utils/time-formatters"
import { isRTLLanguage } from "@/lib/utils/rtl-helpers"

interface EditorHeaderProps {
  video: Video
  transcriptData: TranscriptData | null
  duration: number
  saveStatus: SaveStatus
  showFinalVideo: boolean
  onShowFinalVideoChange: (show: boolean) => void
  onBurnIn: () => void
  burningIn: boolean
  enableCutting?: boolean
  onToggleCutting?: () => void
  onCutVideo?: () => void
  onExecuteTimelineCuts?: () => void
  cutMarksCount?: number
  videoSource?: VideoSource
  onVideoSourceChange?: (source: VideoSource) => void
}

export function EditorHeader({
  video,
  transcriptData,
  duration,
  saveStatus,
  showFinalVideo,
  onShowFinalVideoChange,
  onBurnIn,
  burningIn,
  enableCutting = false,
  onToggleCutting,
  onCutVideo,
  onExecuteTimelineCuts,
  cutMarksCount = 0,
  videoSource = 'original',
  onVideoSourceChange,
}: EditorHeaderProps) {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)

  const handleVideoDownload = async () => {
    await downloadVideo(video, setDownloadProgress)
  }

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card/80 dark:bg-card/60 backdrop-blur-sm shadow-lg">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/5 to-primary/5" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 dark:from-primary/5 to-transparent rounded-full -translate-y-32 translate-x-32" />
      
      <div className="relative p-4 md:p-6">
        {/* Top Row - Title and Status */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                <Film className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{video.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={video.status === 'complete' ? 'default' : video.status === 'failed' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {video.status === 'complete' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {video.status === 'processing' && <Clock className="h-3 w-3 mr-1 animate-spin" />}
                    {video.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                  </Badge>
                  {transcriptData?.language && (
                    <Badge variant="outline" className="text-xs">
                      {transcriptData.language.toUpperCase()}
                      {isRTLLanguage(transcriptData.language) && ' (RTL)'}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Status Indicator */}
          <SaveStatusIndicator status={saveStatus} />
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Video Source Selector */}
          {onVideoSourceChange && (
            <VideoSourceSelector
              video={video}
              currentSource={videoSource}
              onSourceChange={onVideoSourceChange}
            />
          )}

          {/* Auto Cut Button */}
          {onCutVideo && (
            <Button
              size="sm"
              variant="outline"
              className="h-9"
              onClick={onCutVideo}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Auto Cut
            </Button>
          )}

          {/* Cutting Mode Toggle Button - For manual cutting interface */}
          {onToggleCutting && (
            <Button
              size="sm"
              variant={enableCutting ? "default" : "ghost"}
              className="h-9"
              onClick={onToggleCutting}
            >
              <Scissors className="h-4 w-4 mr-2" />
              {enableCutting ? "Exit Manual Cut" : "Manual Cut"}
            </Button>
          )}

          {/* Execute Timeline Cuts Button */}
          {onExecuteTimelineCuts && (
            <Button
              size="sm"
              variant="destructive"
              className="h-9"
              onClick={onExecuteTimelineCuts}
            >
              <Scissors className="h-4 w-4 mr-2" />
              Apply {cutMarksCount} Cut{cutMarksCount !== 1 ? 's' : ''}
            </Button>
          )}

          {/* Download Button */}
          {video.final_video_url && (
            <Button
              size="sm"
              variant="outline"
              className="h-9 bg-gradient-to-r from-emerald-500/10 to-green-500/10 hover:from-emerald-500/20 hover:to-green-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 shadow-sm relative group overflow-hidden transition-all"
              onClick={handleVideoDownload}
              disabled={video.status !== "complete" || downloadProgress !== null}
            >
              {downloadProgress !== null && (
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-green-500/30 transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              )}
              <div className="relative flex items-center">
                {downloadProgress !== null ? (
                  <>
                    <Timer className="h-4 w-4 mr-2 animate-pulse" />
                    {downloadProgress}% Downloaded
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                    Download Video
                  </>
                )}
              </div>
              {video.status !== "complete" && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full animate-pulse" />
              )}
            </Button>
          )}
          
          {/* Burn In Button */}
          <Button
            onClick={onBurnIn}
            disabled={burningIn}
            className="h-9 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md transition-all"
            size="sm"
          >
            {burningIn ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Flame className="h-4 w-4 mr-2" />
                Burn Captions
              </>
            )}
          </Button>

          {/* Stats Cards */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-card/60 dark:bg-card/40 border border-border">
              <List className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{transcriptData?.segments?.length || 0}</span>
              <span className="text-xs text-muted-foreground">segments</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-card/60 dark:bg-card/40 border border-border">
              <Type className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{transcriptData?.words?.length || 0}</span>
              <span className="text-xs text-muted-foreground">words</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}