import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import { getTextDirection, isRTLLanguage } from "@/lib/utils/rtl-helpers"

interface WordEditFormProps {
  word: string
  startTime: number
  endTime: number
  language?: string
  onWordChange: (word: string) => void
  onStartTimeChange: (time: number) => void
  onEndTimeChange: (time: number) => void
  onSave: () => void
  onCancel: () => void
}

export function WordEditForm({
  word,
  startTime,
  endTime,
  language,
  onWordChange,
  onStartTimeChange,
  onEndTimeChange,
  onSave,
  onCancel,
}: WordEditFormProps) {
  return (
    <div className="mt-4 p-4 border rounded-lg space-y-3 bg-muted/50">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="word-start" className="text-xs">
            Start Time
          </Label>
          <Input
            id="word-start"
            type="number"
            step="0.01"
            value={startTime}
            onChange={(e) => onStartTimeChange(parseFloat(e.target.value))}
            className="text-xs"
          />
        </div>
        <div>
          <Label htmlFor="word-end" className="text-xs">
            End Time
          </Label>
          <Input
            id="word-end"
            type="number"
            step="0.01"
            value={endTime}
            onChange={(e) => onEndTimeChange(parseFloat(e.target.value))}
            className="text-xs"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="word-text" className="text-xs">
          Word Text
        </Label>
        <Input
          id="word-text"
          value={word}
          onChange={(e) => onWordChange(e.target.value)}
          className="text-sm"
          placeholder="Edit word..."
          style={{ 
            direction: getTextDirection(language),
            textAlign: isRTLLanguage(language) ? 'right' : 'left'
          }}
        />
      </div>
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