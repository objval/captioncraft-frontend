import { useRef, useEffect, useState, useCallback, useMemo, RefObject } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils/general'
import { CutMark, CutMarkDraft, CUT_COLORS } from '@/lib/types/video-cutting'
import { formatTime } from '@/lib/utils/time-formatters'
import { Scissors, ZoomIn, ZoomOut, Loader2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { VideoFrameExtractor } from '@/lib/media/frame-extractor'
import { getFrameCache } from '@/lib/media/frame-cache'

interface VideoFrameTimelineProps {
  videoId: string
  videoRef: RefObject<HTMLVideoElement>
  currentTime: number
  duration: number
  cutMarks: CutMark[]
  activeCutId: string | null
  draft: CutMarkDraft | null
  showCutOverlay: boolean
  isPreviewMode: boolean
  onSeek: (time: number) => void
  onStartDraft: (startTime: number) => void
  onUpdateDraft: (endTime: number) => void
  onCompleteDraft: () => void
  onCancelDraft: () => void
  onSelectCut: (id: string) => void
  onUpdateCutMark: (id: string, updates: Partial<CutMark>) => void
}

interface Frame {
  timestamp: number
  dataUrl: string
  width: number
  height: number
}

export function VideoFrameTimeline({
  videoId,
  videoRef,
  currentTime,
  duration,
  cutMarks,
  activeCutId,
  draft,
  showCutOverlay,
  isPreviewMode,
  onSeek,
  onStartDraft,
  onUpdateDraft,
  onCompleteDraft,
  onCancelDraft,
  onSelectCut,
  onUpdateCutMark,
}: VideoFrameTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [frames, setFrames] = useState<Frame[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1) // 0.5x to 3x zoom
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<'seek' | 'draft' | 'resize' | null>(null)
  const [resizeTarget, setResizeTarget] = useState<{ id: string; edge: 'start' | 'end' } | null>(null)
  const [extractor, setExtractor] = useState<VideoFrameExtractor | null>(null)

  // Calculate frame dimensions based on zoom level
  const frameWidth = useMemo(() => Math.round(160 * zoomLevel), [zoomLevel])
  const frameHeight = useMemo(() => Math.round(90 * zoomLevel), [zoomLevel])
  
  // Calculate frame interval based on zoom (more frames when zoomed in)
  const frameInterval = useMemo(() => {
    if (zoomLevel >= 2) return 0.5
    if (zoomLevel >= 1.5) return 1
    if (zoomLevel >= 1) return 2
    return 3
  }, [zoomLevel])

  // Initialize frame extractor
  useEffect(() => {
    if (videoRef.current && !extractor) {
      const frameExtractor = new VideoFrameExtractor(videoRef.current)
      setExtractor(frameExtractor)
    }
  }, [videoRef, extractor])

  // Load frames
  useEffect(() => {
    if (!extractor || !videoRef.current || !duration) return

    const loadFrames = async () => {
      setIsLoading(true)
      setLoadingProgress(0)
      setExtractionError(null)

      try {
        // Check cache first
        const cache = await getFrameCache()
        const cachedFrames = await cache.getVideoFrames(videoId)
        
        // Check if cached frames are the old low-quality ones
        const needsReExtraction = cachedFrames.length > 0 && 
          (cachedFrames[0].width < 320 || cachedFrames[0].height < 180)
        
        if (needsReExtraction) {
          // Clear old low-quality frames
          await cache.clearVideoFrames(videoId)
        } else if (cachedFrames.length > 0) {
          setFrames(cachedFrames.map(f => ({
            timestamp: f.timestamp,
            dataUrl: f.dataUrl,
            width: f.width,
            height: f.height
          })))
          setIsLoading(false)
          return
        }

        // Extract new frames
        const extractedFrames = await extractor.extractFrames({
          interval: frameInterval,
          quality: 0.9, // Increased from 0.6 to 0.9 for better quality
          maxWidth: 320, // Doubled from 160 for sharper images
          maxHeight: 180, // Doubled from 90 for sharper images
          onProgress: setLoadingProgress
        })

        // Filter out null frames (failed extractions due to CORS)
        const validFrames = extractedFrames.filter(f => f !== null)
        
        if (validFrames.length === 0) {
          console.error('No frames could be extracted. This may be due to CORS restrictions.')
          setExtractionError('Unable to extract video frames. This may be due to cross-origin restrictions. Please ensure the video source allows frame extraction.')
          setIsLoading(false)
          return
        }

        setFrames(validFrames)

        // Cache the frames
        for (const frame of validFrames) {
          await cache.setFrame(
            videoId,
            frame.timestamp,
            frame.dataUrl,
            frame.width,
            frame.height
          )
        }
      } catch (error) {
        console.error('Failed to extract frames:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFrames()
  }, [extractor, videoId, duration, frameInterval])

  // Auto-scroll to keep current time in view
  useEffect(() => {
    if (!scrollContainerRef.current || !frames.length) return

    const currentFrameIndex = frames.findIndex(f => f.timestamp >= currentTime)
    if (currentFrameIndex === -1) return

    const scrollContainer = scrollContainerRef.current
    const frameElement = scrollContainer.children[0]?.children[currentFrameIndex] as HTMLElement
    
    if (frameElement) {
      const containerWidth = scrollContainer.clientWidth
      const frameLeft = frameElement.offsetLeft
      const frameWidth = frameElement.offsetWidth
      const scrollLeft = scrollContainer.scrollLeft
      
      // Check if frame is out of view
      if (frameLeft < scrollLeft || frameLeft + frameWidth > scrollLeft + containerWidth) {
        // Center the frame in the container
        scrollContainer.scrollTo({
          left: frameLeft - containerWidth / 2 + frameWidth / 2,
          behavior: 'smooth'
        })
      }
    }
  }, [currentTime, frames])

  const getTimeFromPosition = useCallback((clientX: number): number => {
    if (!timelineRef.current || !frames.length) return 0
    
    const rect = timelineRef.current.getBoundingClientRect()
    const scrollLeft = scrollContainerRef.current?.scrollLeft || 0
    const x = clientX - rect.left + scrollLeft
    
    // Find which frame was clicked
    const frameIndex = Math.floor(x / frameWidth)
    if (frameIndex >= 0 && frameIndex < frames.length) {
      const frame = frames[frameIndex]
      const frameX = x - (frameIndex * frameWidth)
      const frameProgress = frameX / frameWidth
      
      // Calculate time within the frame
      const nextFrame = frames[frameIndex + 1]
      const frameDuration = nextFrame ? nextFrame.timestamp - frame.timestamp : frameInterval
      return frame.timestamp + (frameDuration * frameProgress)
    }
    
    return 0
  }, [frames, frameWidth, frameInterval])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left click
    
    const time = getTimeFromPosition(e.clientX)
    
    // Check if clicking on an existing cut mark edge for resizing
    const clickedCut = cutMarks.find(mark => {
      const tolerance = 2 / duration * 100 // 2 second tolerance
      const markStartPercent = (mark.startTime / duration) * 100
      const markEndPercent = (mark.endTime / duration) * 100
      const timePercent = (time / duration) * 100
      
      const isNearStart = Math.abs(timePercent - markStartPercent) < tolerance
      const isNearEnd = Math.abs(timePercent - markEndPercent) < tolerance
      
      return !mark.locked && (isNearStart || isNearEnd)
    })
    
    if (clickedCut) {
      const markStartPercent = (clickedCut.startTime / duration) * 100
      const markEndPercent = (clickedCut.endTime / duration) * 100
      const timePercent = (time / duration) * 100
      
      const edge = Math.abs(timePercent - markStartPercent) < Math.abs(timePercent - markEndPercent) ? 'start' : 'end'
      
      setIsDragging(true)
      setDragType('resize')
      setResizeTarget({ id: clickedCut.id, edge })
      onSelectCut(clickedCut.id)
    } else if (e.shiftKey && !draft) {
      // Start new draft with shift+click
      setIsDragging(true)
      setDragType('draft')
      onStartDraft(time)
    } else {
      // Regular seek
      setIsDragging(true)
      setDragType('seek')
      onSeek(time)
    }
  }, [cutMarks, duration, draft, getTimeFromPosition, onSeek, onStartDraft, onSelectCut])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    const time = getTimeFromPosition(e.clientX)
    
    if (dragType === 'seek') {
      onSeek(time)
    } else if (dragType === 'draft') {
      onUpdateDraft(time)
    } else if (dragType === 'resize' && resizeTarget) {
      const cutMark = cutMarks.find(m => m.id === resizeTarget.id)
      if (!cutMark) return
      
      if (resizeTarget.edge === 'start') {
        onUpdateCutMark(resizeTarget.id, { startTime: Math.min(time, cutMark.endTime - 0.1) })
      } else {
        onUpdateCutMark(resizeTarget.id, { endTime: Math.max(time, cutMark.startTime + 0.1) })
      }
    }
  }, [isDragging, dragType, resizeTarget, cutMarks, getTimeFromPosition, onSeek, onUpdateDraft, onUpdateCutMark])

  const handleMouseUp = useCallback(() => {
    if (dragType === 'draft') {
      onCompleteDraft()
    }
    
    setIsDragging(false)
    setDragType(null)
    setResizeTarget(null)
  }, [dragType, onCompleteDraft])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const renderCutMark = (mark: CutMark) => {
    const startPercent = (mark.startTime / duration) * 100
    const widthPercent = ((mark.endTime - mark.startTime) / duration) * 100
    const isActive = mark.id === activeCutId
    
    return (
      <div
        key={mark.id}
        className={cn(
          "absolute top-0 h-full cursor-pointer transition-all z-10",
          "hover:z-20",
          isActive && "ring-2 ring-white z-30",
          mark.locked && "cursor-not-allowed"
        )}
        style={{
          left: `${startPercent}%`,
          width: `${widthPercent}%`,
          backgroundColor: mark.color || CUT_COLORS[mark.type],
          opacity: showCutOverlay ? (isActive ? 0.8 : 0.6) : 0.3,
        }}
        onClick={(e) => {
          e.stopPropagation()
          onSelectCut(mark.id)
        }}
      >
        {/* Resize handles */}
        {!mark.locked && isActive && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize" />
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize" />
          </>
        )}
      </div>
    )
  }

  const renderDraft = () => {
    if (!draft || draft.startTime === undefined) return null
    
    const startTime = draft.startTime
    const endTime = draft.endTime ?? currentTime
    
    const left = Math.min(startTime, endTime)
    const right = Math.max(startTime, endTime)
    
    const startPercent = (left / duration) * 100
    const widthPercent = ((right - left) / duration) * 100
    
    return (
      <div
        className="absolute top-0 h-full pointer-events-none animate-pulse z-10"
        style={{
          left: `${startPercent}%`,
          width: `${widthPercent}%`,
          backgroundColor: CUT_COLORS[draft.type],
          opacity: 0.4,
          border: '2px dashed white',
        }}
      />
    )
  }

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {isPreviewMode ? 'Preview Mode' : 'Frame Timeline'} • {cutMarks.length} cuts
          </span>
        </div>
        
        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.5))}
            disabled={zoomLevel <= 0.5}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          
          <div className="w-24">
            <Slider
              value={[zoomLevel]}
              onValueChange={([value]) => setZoomLevel(value)}
              min={0.5}
              max={3}
              step={0.1}
              className="cursor-pointer"
            />
          </div>
          
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.5))}
            disabled={zoomLevel >= 3}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
          
          <span className="text-xs text-muted-foreground w-10 text-right">
            {zoomLevel.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div 
        ref={scrollContainerRef}
        className="relative overflow-x-auto overflow-y-hidden rounded-lg border border-border bg-secondary/50"
        style={{ height: frameHeight + 40 }}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/80">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Loading frames... {Math.round(loadingProgress * 100)}%
              </span>
            </div>
          </div>
        ) : extractionError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/80">
            <div className="flex flex-col items-center gap-2 max-w-md text-center px-4">
              <div className="text-destructive">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">{extractionError}</p>
              <p className="text-xs text-muted-foreground">You can still use the simple timeline view instead.</p>
            </div>
          </div>
        ) : (
          <div
            ref={timelineRef}
            className="relative flex"
            style={{ 
              height: frameHeight + 40,
              width: frames.length * frameWidth 
            }}
            onMouseDown={handleMouseDown}
          >
            {/* Frame strip */}
            {frames.map((frame, index) => (
              <div
                key={frame.timestamp}
                className="relative flex-shrink-0 border-r border-border/50"
                style={{ width: frameWidth, height: frameHeight + 40 }}
              >
                <Image
                  src={frame.dataUrl}
                  alt={`Frame at ${formatTime(frame.timestamp)}`}
                  fill
                  className="object-cover"
                  draggable={false}
                  unoptimized
                />
                
                {/* Time label */}
                {index % Math.ceil(5 / zoomLevel) === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1">
                    {formatTime(frame.timestamp)}
                  </div>
                )}
              </div>
            ))}
            
            {/* Cut marks overlay */}
            {showCutOverlay && (
              <div className="absolute inset-0 pointer-events-none">
                {cutMarks.map(renderCutMark)}
                {renderDraft()}
              </div>
            )}
            
            {/* Current time indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary pointer-events-none z-40"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full" />
            </div>
            
            {/* Preview mode overlay */}
            {isPreviewMode && (
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
            )}
          </div>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        Hold Shift + Click to mark cuts • Scroll to navigate timeline
      </div>
    </div>
  )
}