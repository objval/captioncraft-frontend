import { Button } from "@/components/ui/button"
import { Trash2, CheckSquare, Square, Grid3X3, List } from "lucide-react"

interface GalleryHeaderProps {
  totalVideos: number
  isSelectionMode: boolean
  selectedCount: number
  filteredCount: number
  viewMode: "grid" | "list"
  onToggleSelectionMode: () => void
  onSelectAll: () => void
  onDeleteSelected: () => void
  onViewModeChange: (mode: "grid" | "list") => void
}

export function GalleryHeader({
  totalVideos,
  isSelectionMode,
  selectedCount,
  filteredCount,
  viewMode,
  onToggleSelectionMode,
  onSelectAll,
  onDeleteSelected,
  onViewModeChange,
}: GalleryHeaderProps) {
  const allSelected = selectedCount === filteredCount && filteredCount > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Video Gallery
          </h1>
          <p className="text-lg text-slate-600">Manage your video transcriptions and captions</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Selection Controls */}
          {isSelectionMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onSelectAll}
                className="bg-white/80 border-slate-300 hover:bg-slate-50"
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4 mr-2 text-blue-600" />
                ) : (
                  <Square className="h-4 w-4 mr-2" />
                )}
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
              
              {selectedCount > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDeleteSelected}
                  className="shadow-lg hover:shadow-xl"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {selectedCount} video{selectedCount > 1 ? 's' : ''}
                </Button>
              )}
            </>
          )}
          
          {/* Selection Mode Toggle */}
          <Button
            variant={isSelectionMode ? "default" : "outline"}
            size="sm"
            onClick={onToggleSelectionMode}
            className={isSelectionMode ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" : "bg-white/80 border-slate-300 hover:bg-slate-50"}
          >
            {isSelectionMode ? "Cancel" : "Select"}
          </Button>
          
          {/* View Mode Buttons */}
          <div className="flex bg-white/60 rounded-lg p-1 border border-slate-200">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className={viewMode === "grid" ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm" : "hover:bg-white/80"}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className={viewMode === "list" ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm" : "hover:bg-white/80"}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Selection Status */}
      {isSelectionMode && (
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
            {selectedCount} of {filteredCount} selected
          </div>
        </div>
      )}
    </div>
  )
}