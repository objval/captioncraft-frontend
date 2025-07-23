import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  Scissors, 
  Eye, 
  EyeOff, 
  Trash2, 
  RotateCcw, 
  RotateCw,
  ChevronDown,
  Wand2,
  Volume2,
  Film,
  Zap
} from 'lucide-react'
import { CutType, CuttingState } from '@/lib/types/video-cutting'
import { cn } from '@/lib/utils/general'

interface CutMarkControlsProps {
  cutMode: CuttingState['cutMode']
  isPreviewMode: boolean
  showCutOverlay: boolean
  canUndo: boolean
  canRedo: boolean
  totalCuts: number
  onSetCutMode: (mode: CuttingState['cutMode']) => void
  onTogglePreviewMode: () => void
  onToggleCutOverlay: () => void
  onClearAllCuts: () => void
  onUndo: () => void
  onRedo: () => void
  onAddAutoCut?: (type: CutType) => void
}

const cutModeOptions = [
  { value: 'marking' as const, label: 'Mark Cuts', icon: Scissors },
  { value: 'editing' as const, label: 'Edit Cuts', icon: Wand2 },
  { value: 'preview' as const, label: 'Preview', icon: Eye },
]

const autoCutOptions = [
  { type: 'scene-change' as CutType, label: 'Scene Changes', icon: Film, description: 'Detect scene transitions' },
  { type: 'silence' as CutType, label: 'Silence Detection', icon: Volume2, description: 'Find silent sections' },
  { type: 'auto' as CutType, label: 'Smart Cut', icon: Zap, description: 'AI-powered suggestions' },
]

export function CutMarkControls({
  cutMode,
  isPreviewMode,
  showCutOverlay,
  canUndo,
  canRedo,
  totalCuts,
  onSetCutMode,
  onTogglePreviewMode,
  onToggleCutOverlay,
  onClearAllCuts,
  onUndo,
  onRedo,
  onAddAutoCut,
}: CutMarkControlsProps) {
  const currentModeOption = cutModeOptions.find(opt => opt.value === cutMode)
  const ModeIcon = currentModeOption?.icon || Scissors

  return (
    <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
      <div className="flex items-center gap-2">
        {/* Cut Mode Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <ModeIcon className="h-4 w-4" />
              {currentModeOption?.label}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Cut Mode</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {cutModeOptions.map((option) => {
              const Icon = option.icon
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onSetCutMode(option.value)}
                  className={cn(
                    "gap-2",
                    cutMode === option.value && "bg-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Auto Cut Options */}
        {onAddAutoCut && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Zap className="h-4 w-4" />
                Auto Cut
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Automatic Detection</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {autoCutOptions.map((option) => {
                const Icon = option.icon
                return (
                  <DropdownMenuItem
                    key={option.type}
                    onClick={() => onAddAutoCut(option.type)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Separator */}
        <div className="h-4 w-px bg-border" />

        {/* Preview Mode Toggle */}
        <Button
          variant={isPreviewMode ? "default" : "outline"}
          size="sm"
          onClick={onTogglePreviewMode}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          Preview
        </Button>

        {/* Show/Hide Overlay */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCutOverlay}
          className="gap-2"
        >
          {showCutOverlay ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>

        {/* Undo/Redo */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="rounded-r-none"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="rounded-l-none border-l"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Cut Count */}
        {totalCuts > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Scissors className="h-3 w-3" />
            {totalCuts} {totalCuts === 1 ? 'cut' : 'cuts'}
          </Badge>
        )}

        {/* Clear All */}
        {totalCuts > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to clear all cuts?')) {
                onClearAllCuts()
              }
            }}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>
    </div>
  )
}