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
} from "lucide-react"
import type { Video, TranscriptData } from "@/lib/api"
import type { SaveStatus } from "../utils/types"
import { SaveStatusIndicator } from "./SaveStatusIndicator"
import { VideoSourceToggle } from "./VideoSourceToggle"
import { downloadVideo } from "../utils/video-download"
import { formatTime } from "../utils/time-formatters"
import { isRTLLanguage } from "../utils/rtl-helpers"

interface EditorHeaderProps {
  video: Video
  transcriptData: TranscriptData | null
  duration: number
  saveStatus: SaveStatus
  showFinalVideo: boolean
  onShowFinalVideoChange: (show: boolean) => void
  onBurnIn: () => void
  burningIn: boolean
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
}: EditorHeaderProps) {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)

  const handleVideoDownload = async () => {
    await downloadVideo(video, setDownloadProgress)
  }

  return (
    <div className="relative overflow-hidden rounded-xl border bg-white/80 backdrop-blur-sm shadow-lg">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/20 to-transparent rounded-full -translate-y-32 translate-x-32" />
      
      <div className="relative p-4 md:p-6">
        {/* Top Row - Title and Status */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                <Film className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 truncate">{video.title}</h1>
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
                  <div className="flex items-center gap-1 text-xs text-slate-600">
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
          {/* Video Source Toggle */}
          <VideoSourceToggle
            showFinalVideo={showFinalVideo}
            hasFinalVideo={!!video.final_video_url}
            onToggle={onShowFinalVideoChange}
          />

          {/* Download Button */}
          {video.final_video_url && (
            <Button
              size="sm"
              variant="outline"
              className="h-9 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 text-emerald-700 border-emerald-200 shadow-sm relative group overflow-hidden transition-all"
              onClick={handleVideoDownload}
              disabled={video.status !== "complete" || downloadProgress !== null}
            >
              {downloadProgress !== null && (
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-green-300 transition-all duration-300"
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
            <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/60 border border-slate-200/60">
              <List className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">{transcriptData?.segments?.length || 0}</span>
              <span className="text-xs text-slate-500">segments</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/60 border border-slate-200/60">
              <Type className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">{transcriptData?.words?.length || 0}</span>
              <span className="text-xs text-slate-500">words</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}