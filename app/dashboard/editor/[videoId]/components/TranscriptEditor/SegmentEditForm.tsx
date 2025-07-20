import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import { getTextDirection, isRTLLanguage } from "../../utils/rtl-helpers"

interface SegmentEditFormProps {
  text: string
  startTime: number
  endTime: number
  language?: string
  onTextChange: (text: string) => void
  onStartTimeChange: (time: number) => void
  onEndTimeChange: (time: number) => void
  onSave: () => void
  onCancel: () => void
}

export function SegmentEditForm({
  text,
  startTime,
  endTime,
  language,
  onTextChange,
  onStartTimeChange,
  onEndTimeChange,
  onSave,
  onCancel,
}: SegmentEditFormProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="start-time" className="text-xs">
            Start Time
          </Label>
          <Input
            id="start-time"
            type="number"
            step="0.1"
            value={startTime}
            onChange={(e) => onStartTimeChange(parseFloat(e.target.value))}
            className="text-xs"
          />
        </div>
        <div>
          <Label htmlFor="end-time" className="text-xs">
            End Time
          </Label>
          <Input
            id="end-time"
            type="number"
            step="0.1"
            value={endTime}
            onChange={(e) => onEndTimeChange(parseFloat(e.target.value))}
            className="text-xs"
          />
        </div>
      </div>
      <Textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        className="min-h-[60px] text-sm resize-none"
        placeholder="Edit segment text..."
        style={{ 
          direction: getTextDirection(language),
          textAlign: isRTLLanguage(language) ? 'right' : 'left'
        }}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} className="flex-1">
          <Save className="h-3 w-3 mr-1" />
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  )
}