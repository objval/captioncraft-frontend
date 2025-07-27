import { useRef, useEffect, useState, useCallback, RefObject } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils/general'
import { CutMark, CutMarkDraft, CUT_COLORS } from '@/lib/types/video-cutting'
import { formatTime } from '@/lib/utils/time-formatters'
import { Loader2 } from 'lucide-react'
import { VideoFrameExtractor } from '@/lib/media/frame-extractor'
import { getFrameCache } from '@/lib/media/frame-cache'

interface MobileFrameTimelineProps {
  videoId: string
  videoRef: RefObject<HTMLVideoElement>
  currentTime: number
  duration: number
  cutMarks: CutMark[]
  activeCutId: string | null
  draft: CutMarkDraft | null
  onSeek?: (time: number) => void
  onStartDraft?: (startTime: number) => void
  onUpdateDraft?: (endTime: number) => void
  onCompleteDraft?: () => void
  onCancelDraft?: () => void
}

interface Frame {
  timestamp: number
  dataUrl: string
  width: number
  height: number
}

export function MobileFrameTimeline({
  videoId,
  videoRef,
  currentTime,
  duration,
  cutMarks,
  activeCutId,
  draft,
  onSeek,
  onStartDraft,
  onUpdateDraft,
  onCompleteDraft,
  onCancelDraft,
}: MobileFrameTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [frames, setFrames] = useState<Frame[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchStartTime, setTouchStartTime] = useState<number | null>(null)
  
  // Fixed dimensions for mobile
  const frameWidth = 80
  const frameHeight = 45
  
  // Larger intervals for mobile (5 seconds)
  const frameInterval = 5

  // Load frames
  useEffect(() => {
    if (!videoRef.current || !duration) return

    let isMounted = true
    let extractorInstance: VideoFrameExtractor | null = null
    let extractionInProgress = false

    const loadFrames = async () => {
      if (extractionInProgress || !isMounted) return
      extractionInProgress = true

      try {
        setIsLoading(true)
        setLoadingProgress(0)
        setExtractionError(null)

        // Check cache first
        const cache = await getFrameCache()
        const cachedKey = `${videoId}-mobile`
        const cachedFrames = await cache.getVideoFrames(cachedKey)
        
        if (cachedFrames.length > 0 && isMounted) {
          setFrames(cachedFrames.map(f => ({
            timestamp: f.timestamp,
            dataUrl: f.dataUrl,
            width: f.width,
            height: f.height
          })))
          setIsLoading(false)
          extractionInProgress = false
          return
        }

        // Create extractor instance
        if (!isMounted || !videoRef.current) return
        extractorInstance = new VideoFrameExtractor(videoRef.current)

        // Extract frames with mobile-optimized settings
        const extractedFrames = await extractorInstance.extractFrames({
          interval: frameInterval,
          quality: 0.7, // Lower quality for faster loading on mobile
          maxWidth: 160, // Smaller size for mobile
          maxHeight: 90,
          onProgress: (progress) => {
            if (isMounted) setLoadingProgress(progress)
          }
        })

        // Filter out null frames
        const validFrames = extractedFrames.filter(f => f !== null)
        
        if (validFrames.length === 0 && isMounted) {
          setExtractionError('Unable to extract video frames')
          setIsLoading(false)
          extractionInProgress = false
          return
        }

        if (isMounted) {
          setFrames(validFrames)
          
          // Cache the frames with mobile key
          for (const frame of validFrames) {
            await cache.setFrame(
              cachedKey,
              frame.timestamp,
              frame.dataUrl,
              frame.width,
              frame.height
            ).catch(console.error)
          }
        }
      } catch (error: any) {
        if (isMounted && error.message !== 'Frame extraction aborted') {
          console.error('Failed to extract frames:', error)
          setExtractionError('Unable to extract video frames')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
          extractionInProgress = false
        }
      }
    }

    loadFrames()

    return () => {
      isMounted = false
      if (extractorInstance) {
        extractorInstance.abort()
      }
    }
  }, [videoId, duration])

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
    
    // Find which frame was touched
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
  }, [frames, frameWidth])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    const time = getTimeFromPosition(touch.clientX)
    
    setTouchStartX(touch.clientX)
    setTouchStartTime(time)
    
    // Start draft if not already drafting
    if (!draft && onStartDraft) {
      onStartDraft(time)
    }
  }, [draft, getTimeFromPosition, onStartDraft])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX === null || !draft) return
    
    const touch = e.touches[0]
    const time = getTimeFromPosition(touch.clientX)
    
    // Update draft
    if (onUpdateDraft) {
      onUpdateDraft(time)
    }
  }, [touchStartX, draft, getTimeFromPosition, onUpdateDraft])

  const handleTouchEnd = useCallback(() => {
    if (draft && onCompleteDraft) {
      onCompleteDraft()
    }
    
    setTouchStartX(null)
    setTouchStartTime(null)
  }, [draft, onCompleteDraft])

  const renderCutMark = (mark: CutMark) => {
    const startPercent = (mark.startTime / duration) * 100
    const widthPercent = ((mark.endTime - mark.startTime) / duration) * 100
    
    return (
      <div
        key={mark.id}
        className="absolute top-0 h-full"
        style={{
          left: `${startPercent}%`,
          width: `${widthPercent}%`,
          backgroundColor: mark.color || CUT_COLORS[mark.type],
          opacity: 0.6,
        }}
      />
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
        className="absolute top-0 h-full pointer-events-none animate-pulse"
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
    <div className="space-y-2">
      {/* Timeline */}
      <div 
        ref={scrollContainerRef}
        className="relative overflow-x-auto overflow-y-hidden rounded-lg border border-border bg-secondary/50"
        style={{ height: frameHeight + 20 }}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/80">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs text-muted-foreground">
                Loading... {Math.round(loadingProgress * 100)}%
              </span>
            </div>
          </div>
        ) : extractionError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/80">
            <p className="text-xs text-muted-foreground px-4 text-center">{extractionError}</p>
          </div>
        ) : (
          <div
            ref={timelineRef}
            className="relative flex"
            style={{ 
              height: frameHeight + 20,
              width: frames.length * frameWidth 
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Frame strip */}
            {frames.map((frame, index) => (
              <div
                key={frame.timestamp}
                className="relative flex-shrink-0 border-r border-border/50"
                style={{ 
                  width: frameWidth, 
                  height: frameHeight + 20,
                  userSelect: 'none',
                  WebkitUserSelect: 'none'
                }}
              >
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ pointerEvents: 'none' }}
                >
                  <Image
                    src={frame.dataUrl}
                    alt={`Frame at ${formatTime(frame.timestamp)}`}
                    fill
                    className="object-cover"
                    draggable={false}
                    unoptimized
                    style={{ 
                      userSelect: 'none',
                      WebkitUserDrag: 'none',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
                
                {/* Time label on every frame for mobile */}
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5"
                  style={{ pointerEvents: 'none' }}
                >
                  {formatTime(frame.timestamp)}
                </div>
              </div>
            ))}
            
            {/* Cut marks overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {cutMarks.map(renderCutMark)}
              {renderDraft()}
            </div>
            
            {/* Current time indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary pointer-events-none z-40"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
            </div>
          </div>
        )}
      </div>
      
      <div className="text-[10px] text-muted-foreground text-center">
        Touch and drag to mark cuts
      </div>
    </div>
  )
}