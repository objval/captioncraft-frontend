import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Trash2,
  Lock,
  Unlock,
  Edit2,
  Check,
  X,
  Scissors,
  Clock,
} from 'lucide-react'
import { CutMark, CUT_COLORS } from '@/lib/types/video-cutting'
import { formatTime, formatTimeDetailed } from '@/lib/utils/time-formatters'
import { cn } from '@/lib/utils/general'
import { useState } from 'react'

interface CutListPanelProps {
  cutMarks: CutMark[]
  activeCutId: string | null
  totalCutDuration: number
  remainingDuration: number
  percentageCut: number
  onSelectCut: (id: string) => void
  onUpdateCutMark: (id: string, updates: Partial<CutMark>) => void
  onRemoveCutMark: (id: string) => void
  onSeekToTime: (time: number) => void
}

export function CutListPanel({
  cutMarks,
  activeCutId,
  totalCutDuration,
  remainingDuration,
  percentageCut,
  onSelectCut,
  onUpdateCutMark,
  onRemoveCutMark,
  onSeekToTime,
}: CutListPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')

  const startEditingLabel = (cut: CutMark) => {
    setEditingId(cut.id)
    setEditingLabel(cut.label || '')
  }

  const saveLabel = (id: string) => {
    onUpdateCutMark(id, { label: editingLabel })
    setEditingId(null)
    setEditingLabel('')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingLabel('')
  }

  return (
    <Card className="shadow-lg border-0 bg-card/80 dark:bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scissors className="h-4 w-4" />
          Cut List
        </CardTitle>
        <CardDescription>
          Manage your video cuts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Total Cut</p>
            <p className="font-medium">{formatTime(totalCutDuration)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Remaining</p>
            <p className="font-medium">{formatTime(remainingDuration)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Cut %</p>
            <p className="font-medium">{percentageCut.toFixed(1)}%</p>
          </div>
        </div>

        {/* Cut List */}
        <ScrollArea className="h-[300px] pr-3">
          {cutMarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Scissors className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No cuts yet</p>
              <p className="text-xs">Hold Shift + Click on timeline to add cuts</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cutMarks.map((cut, index) => {
                const isActive = cut.id === activeCutId
                const isEditing = cut.id === editingId
                const duration = cut.endTime - cut.startTime

                return (
                  <div
                    key={cut.id}
                    className={cn(
                      "group relative p-3 rounded-lg border transition-all cursor-pointer",
                      "hover:bg-secondary/50",
                      isActive ? "border-primary bg-secondary" : "border-border"
                    )}
                    onClick={() => onSelectCut(cut.id)}
                  >
                    {/* Color indicator */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                      style={{ backgroundColor: cut.color || CUT_COLORS[cut.type] }}
                    />

                    <div className="pl-3 space-y-2">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={editingLabel}
                                onChange={(e) => setEditingLabel(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveLabel(cut.id)
                                  if (e.key === 'Escape') cancelEditing()
                                }}
                                placeholder="Cut label..."
                                className="h-6 text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  saveLabel(cut.id)
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  cancelEditing()
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {cut.label || `Cut ${index + 1}`}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {cut.type}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!isEditing && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditingLabel(cut)
                              }}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              onUpdateCutMark(cut.id, { locked: !cut.locked })
                            }}
                          >
                            {cut.locked ? (
                              <Lock className="h-3 w-3" />
                            ) : (
                              <Unlock className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              onRemoveCutMark(cut.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Time info */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <button
                          className="hover:text-foreground transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSeekToTime(cut.startTime)
                          }}
                        >
                          {formatTimeDetailed(cut.startTime)}
                        </button>
                        <span>→</span>
                        <button
                          className="hover:text-foreground transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSeekToTime(cut.endTime)
                          }}
                        >
                          {formatTimeDetailed(cut.endTime)}
                        </button>
                        <span className="ml-auto flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}