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
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            Video Gallery
          </h1>
          <p className="text-lg text-muted-foreground">Manage your video transcriptions and captions</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Selection Controls */}
          {isSelectionMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onSelectAll}
                className="bg-card/80 dark:bg-card/60 border-border hover:bg-card/90 dark:hover:bg-card/70 backdrop-blur-sm"
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
            className={isSelectionMode ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" : "bg-card/80 dark:bg-card/60 border-border hover:bg-card/90 dark:hover:bg-card/70 backdrop-blur-sm"}
          >
            {isSelectionMode ? "Cancel" : "Select"}
          </Button>
          
          {/* View Mode Buttons */}
          <div className="flex bg-card/60 dark:bg-card/40 rounded-lg p-1 border border-border backdrop-blur-sm">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className={viewMode === "grid" ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm" : "hover:bg-card/80 dark:hover:bg-card/60"}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className={viewMode === "list" ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm" : "hover:bg-card/80 dark:hover:bg-card/60"}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Selection Status */}
      {isSelectionMode && (
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
            {selectedCount} of {filteredCount} selected
          </div>
        </div>
      )}
    </div>
  )
}