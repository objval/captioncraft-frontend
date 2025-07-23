import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash2, Play } from 'lucide-react'
import { formatTime } from '@/lib/utils/time-formatters'
import type { CutMark } from '@/lib/types/video-cutting'

interface MobileCutListProps {
  cutMarks: CutMark[]
  activeCutId: string | null
  totalCutDuration: number
  remainingDuration: number
  percentageCut: number
  onSelectCut: (id: string) => void
  onRemoveCutMark: (id: string) => void
  onSeekToTime: (time: number) => void
}

export function MobileCutList({
  cutMarks,
  activeCutId,
  totalCutDuration,
  remainingDuration,
  percentageCut,
  onSelectCut,
  onRemoveCutMark,
  onSeekToTime,
}: MobileCutListProps) {
  if (cutMarks.length === 0) return null

  return (
    <Card className="lg:hidden p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Cut List</h3>
          <Badge variant="secondary">
            {cutMarks.length} cut{cutMarks.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-center p-2 bg-secondary/50 rounded">
            <p className="text-muted-foreground text-xs">Total Cut</p>
            <p className="font-mono font-medium">{formatTime(totalCutDuration)}</p>
          </div>
          <div className="text-center p-2 bg-secondary/50 rounded">
            <p className="text-muted-foreground text-xs">Remaining</p>
            <p className="font-mono font-medium">{formatTime(remainingDuration)}</p>
          </div>
        </div>

        {/* Cut Marks */}
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {cutMarks.map((mark, index) => (
              <div
                key={mark.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  activeCutId === mark.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-secondary/50'
                }`}
                onClick={() => onSelectCut(mark.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      Cut {index + 1}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(mark.startTime)} → {formatTime(mark.endTime)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Duration: {formatTime(mark.endTime - mark.startTime)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSeekToTime(mark.startTime)
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveCutMark(mark.id)
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  )
}