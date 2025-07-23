import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Scissors,
  Wand2,
  AlertCircle,
  Loader2,
  CheckCircle,
  Volume2,
} from 'lucide-react'
import { api, type Video, type SilenceAnalysisResult, type CuttingConfig } from '@/lib/api/api'
import { formatTime } from '@/lib/utils/time-formatters'
import toast from '@/lib/utils/toast'

interface CuttingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  video: Video
  onCutComplete: () => void
}

const DEFAULT_CONFIG: CuttingConfig = {
  silenceThreshold: 0.5,
  offsetBefore: 0.3,
  offsetAfter: 0.3,
  minSegmentLength: 1.0,
}

export function CuttingDialog({ open, onOpenChange, video, onCutComplete }: CuttingDialogProps) {
  const [config, setConfig] = useState<CuttingConfig>(DEFAULT_CONFIG)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCutting, setIsCutting] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<SilenceAnalysisResult | null>(null)
  const [sourceType, setSourceType] = useState<'original' | 'burned'>('original')
  
  // Check if video is ready for cutting
  const canCutVideo = video.status === 'complete' || video.status === 'ready'

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setAnalysisResult(null)
      setIsAnalyzing(false)
      setIsCutting(false)
      // Determine available source types
      if (video.has_cut_original || video.has_cut_burned) {
        // Already has cuts, so we can only cut from what's available
        setSourceType(video.final_video_url ? 'burned' : 'original')
      } else {
        // Default to original if no cuts exist
        setSourceType('original')
      }
    }
  }, [open, video])

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const result = await api.analyzeSilence(video.id, config)
      setAnalysisResult(result)
      toast.success('Silence analysis complete')
    } catch (error: any) {
      console.error('Analysis error:', error)
      
      // Check for specific error cases
      if (error.message?.includes('Failed to fetch video')) {
        toast.error('Unable to access video. Please ensure the video has been uploaded and processed successfully.')
      } else if (error.message?.includes('Transcript data not found')) {
        toast.error('This video needs to be transcribed before it can be cut')
      } else if (error.message?.includes('500')) {
        toast.error('Server error: Please try again later or contact support')
      } else {
        toast.error(error.message || 'Failed to analyze silence')
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCut = async () => {
    // Double-check state values
    const currentSourceType = sourceType || 'original'
    
    console.log('Current state - sourceType:', currentSourceType)
    
    // Validate we have the required data
    if (!currentSourceType) {
      toast.error('Invalid cutting options. Please try again.')
      return
    }
    
    if (!analysisResult) {
      toast.error('Please analyze the video first')
      return
    }
    
    setIsCutting(true)
    try {
      const cutOptions = {
        sourceType: currentSourceType,
        mode: 'automatic' as const,
        config: config
      }
      
      console.log('Cutting with options:', cutOptions)
      
      await api.cutVideo(video.id, cutOptions)
      toast.success('Video cutting started! Your video will be ready shortly.')
      onCutComplete()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Cutting error:', error)
      if (error.message?.includes('credits')) {
        toast.error('Insufficient credits. You need at least 1 credit to cut a video.')
      } else {
        toast.error('Failed to cut video')
      }
    } finally {
      setIsCutting(false)
    }
  }

  const canCut = analysisResult !== null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Auto Cut
          </DialogTitle>
          <DialogDescription>
            Automatically remove silence from your video based on configurable thresholds
          </DialogDescription>
        </DialogHeader>

        {!canCutVideo ? (
          <Alert className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This video is still being processed. Please wait until processing is complete before cutting.
              Current status: <Badge variant="outline" className="ml-1">{video.status}</Badge>
            </AlertDescription>
          </Alert>
        ) : !video.original_video_url && !video.final_video_url ? (
          <Alert className="my-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No video file found. Please ensure the video has been uploaded successfully.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Wand2 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Automatic Silence Removal</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Silence Threshold ({config.silenceThreshold}s)</Label>
                <Slider
                  value={[config.silenceThreshold]}
                  onValueChange={([v]) => setConfig({ ...config, silenceThreshold: v })}
                  min={0.3}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum gap duration to consider as silence
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Offset Before ({config.offsetBefore}s)</Label>
                  <Slider
                    value={[config.offsetBefore]}
                    onValueChange={([v]) => setConfig({ ...config, offsetBefore: v })}
                    min={0}
                    max={1.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Offset After ({config.offsetAfter}s)</Label>
                  <Slider
                    value={[config.offsetAfter]}
                    onValueChange={([v]) => setConfig({ ...config, offsetAfter: v })}
                    min={0}
                    max={1.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || isCutting}
                className="w-full"
                variant="outline"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Analyze Silence (Free)
                  </>
                )}
              </Button>

              {analysisResult && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">Analysis Complete</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Original:</span>{' '}
                            {formatTime(analysisResult.summary.originalDuration)}
                          </div>
                          <div>
                            <span className="text-muted-foreground">After Cut:</span>{' '}
                            {formatTime(analysisResult.summary.cutDuration)}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Removed:</span>{' '}
                            {formatTime(analysisResult.summary.removedDuration)} ({analysisResult.summary.removedPercentage.toFixed(1)}%)
                          </div>
                          <div>
                            <span className="text-muted-foreground">Segments:</span>{' '}
                            {analysisResult.summary.segmentCount}
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label>Silence Gaps Found</Label>
                    <div className="max-h-32 overflow-y-auto space-y-1 p-2 border rounded">
                      {analysisResult.silenceGaps.map((gap, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {formatTime(gap.start)} - {formatTime(gap.end)}
                          </span>
                          <Badge variant="secondary">
                            {gap.duration.toFixed(1)}s
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCut}
            disabled={!canCut || isCutting || !canCutVideo}
            className="gap-2"
          >
            {isCutting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cutting...
              </>
            ) : (
              <>
                <Scissors className="h-4 w-4" />
                Cut Video (1 Credit)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}