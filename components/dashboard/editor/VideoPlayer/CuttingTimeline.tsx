import { useRef, useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils/general'
import { CutMark, CutMarkDraft, CUT_COLORS } from '@/lib/types/video-cutting'
import { formatTime } from '@/lib/utils/time-formatters'
import { Scissors, Lock, Unlock } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CuttingTimelineProps {
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

export function CuttingTimeline({
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
}: CuttingTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<'seek' | 'draft' | 'resize' | null>(null)
  const [resizeTarget, setResizeTarget] = useState<{ id: string; edge: 'start' | 'end' } | null>(null)

  const getTimeFromPosition = useCallback((clientX: number): number => {
    if (!timelineRef.current) return 0
    const rect = timelineRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    return percentage * duration
  }, [duration])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left click
    
    const time = getTimeFromPosition(e.clientX)
    
    // Check if clicking on an existing cut mark edge for resizing
    const clickedCut = cutMarks.find(mark => {
      const markStart = (mark.startTime / duration) * 100
      const markEnd = (mark.endTime / duration) * 100
      const mousePercent = (time / duration) * 100
      
      // 1% tolerance for edge detection
      const isNearStart = Math.abs(mousePercent - markStart) < 1
      const isNearEnd = Math.abs(mousePercent - markEnd) < 1
      
      return !mark.locked && (isNearStart || isNearEnd)
    })
    
    if (clickedCut) {
      const markStart = (clickedCut.startTime / duration) * 100
      const markEnd = (clickedCut.endTime / duration) * 100
      const mousePercent = (time / duration) * 100
      
      const edge = Math.abs(mousePercent - markStart) < Math.abs(mousePercent - markEnd) ? 'start' : 'end'
      
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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && draft) {
        onCancelDraft()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [draft, onCancelDraft])

  const renderCutMark = (mark: CutMark) => {
    const startPercent = (mark.startTime / duration) * 100
    const widthPercent = ((mark.endTime - mark.startTime) / duration) * 100
    const isActive = mark.id === activeCutId
    
    return (
      <TooltipProvider key={mark.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "absolute top-0 h-full cursor-pointer transition-all",
                "hover:z-10",
                isActive && "ring-2 ring-white z-20",
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
              
              {/* Lock icon */}
              {mark.locked && (
                <div className="absolute top-1 right-1">
                  <Lock className="h-3 w-3 text-white/80" />
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              <div className="font-semibold">{mark.label || `${mark.type} cut`}</div>
              <div>{formatTime(mark.startTime)} - {formatTime(mark.endTime)}</div>
              <div>Duration: {formatTime(mark.endTime - mark.startTime)}</div>
              {mark.locked && <div className="text-yellow-500">Locked</div>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Scissors className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {isPreviewMode ? 'Preview Mode' : 'Timeline'} • {cutMarks.length} cuts
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Hold Shift + Click to mark cuts
        </span>
      </div>
      
      <div 
        ref={timelineRef}
        className={cn(
          "relative h-12 bg-secondary rounded-lg overflow-hidden cursor-pointer",
          "border border-border",
          isDragging && "cursor-grabbing"
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Main timeline track */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-secondary" />
        
        {/* Cut marks */}
        {showCutOverlay && cutMarks.map(renderCutMark)}
        
        {/* Draft cut */}
        {showCutOverlay && renderDraft()}
        
        {/* Current time indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary pointer-events-none z-30"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full" />
        </div>
        
        {/* Preview mode overlay */}
        {isPreviewMode && (
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  )
}