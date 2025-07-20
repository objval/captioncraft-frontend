import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit3 } from "lucide-react"
import type { TranscriptSegment } from "@/lib/api/api"
import { formatTimeDetailed } from "@/lib/utils/time-formatters"
import { getTextDirection, isRTLLanguage } from "@/lib/utils/rtl-helpers"
import { SegmentEditForm } from "./SegmentEditForm"

interface SegmentsListProps {
  segments: TranscriptSegment[]
  activeSegmentId: number | null
  editingSegmentId: number | null
  language?: string
  onSegmentClick: (segment: TranscriptSegment) => void
  onStartEdit: (segment: TranscriptSegment) => void
  onSaveEdit: (segmentId: number, text: string, startTime: number, endTime: number) => void
  onCancelEdit: () => void
}

export function SegmentsList({
  segments,
  activeSegmentId,
  editingSegmentId,
  language,
  onSegmentClick,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
}: SegmentsListProps) {
  const [editingText, setEditingText] = useState("")
  const [editingStartTime, setEditingStartTime] = useState(0)
  const [editingEndTime, setEditingEndTime] = useState(0)

  const handleStartEdit = (segment: TranscriptSegment) => {
    setEditingText(segment.text)
    setEditingStartTime(segment.start)
    setEditingEndTime(segment.end)
    onStartEdit(segment)
  }

  const handleSaveEdit = (segmentId: number) => {
    onSaveEdit(segmentId, editingText, editingStartTime, editingEndTime)
  }

  return (
    <div className="space-y-2">
      {segments.map((segment) => (
        <div
          key={segment.id}
          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
            activeSegmentId === segment.id
              ? "border-primary bg-primary/10 shadow-sm"
              : "border-border hover:bg-muted/50 hover:border-slate-300"
          }`}
          onClick={() => onSegmentClick(segment)}
        >
          <div className="flex items-start justify-between mb-2 gap-2">
            <Badge variant="secondary" className="text-xs flex-shrink-0 font-mono">
              {formatTimeDetailed(segment.start)} - {formatTimeDetailed(segment.end)}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleStartEdit(segment)
              }}
              className="h-6 w-6 p-0 flex-shrink-0 opacity-60 hover:opacity-100"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>

          {editingSegmentId === segment.id ? (
            <SegmentEditForm
              text={editingText}
              startTime={editingStartTime}
              endTime={editingEndTime}
              language={language}
              onTextChange={setEditingText}
              onStartTimeChange={setEditingStartTime}
              onEndTimeChange={setEditingEndTime}
              onSave={() => handleSaveEdit(segment.id)}
              onCancel={onCancelEdit}
            />
          ) : (
            <p 
              className="text-sm leading-relaxed break-words" 
              style={{ 
                direction: getTextDirection(language),
                textAlign: isRTLLanguage(language) ? 'right' : 'left'
              }}
            >
              {segment.text}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}