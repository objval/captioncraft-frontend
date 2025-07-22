import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface StatusCounts {
  all: number
  processing: number
  ready: number
  complete: number
  failed: number
}

interface GalleryFiltersProps {
  searchQuery: string
  statusFilter: string
  statusCounts: StatusCounts
  onSearchChange: (query: string) => void
  onStatusFilterChange: (status: string) => void
}

export function GalleryFilters({
  searchQuery,
  statusFilter,
  statusCounts,
  onSearchChange,
  onStatusFilterChange,
}: GalleryFiltersProps) {
  return (
    <>
      {/* Enhanced Status Filter Pills */}
      <div className="flex flex-wrap gap-3">
        <div
          className={`cursor-pointer px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
            statusFilter === "all" 
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25" 
              : "bg-card/80 text-card-foreground border border-border hover:bg-card hover:shadow-sm dark:bg-card/60"
          }`}
          onClick={() => onStatusFilterChange("all")}
        >
          All ({statusCounts.all})
        </div>
        <div
          className={`cursor-pointer px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
            statusFilter === "processing" 
              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25" 
              : "bg-card/80 text-card-foreground border border-border hover:bg-card hover:shadow-sm dark:bg-card/60"
          }`}
          onClick={() => onStatusFilterChange("processing")}
        >
          Processing ({statusCounts.processing})
        </div>
        <div
          className={`cursor-pointer px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
            statusFilter === "ready" 
              ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25" 
              : "bg-card/80 text-card-foreground border border-border hover:bg-card hover:shadow-sm dark:bg-card/60"
          }`}
          onClick={() => onStatusFilterChange("ready")}
        >
          Ready ({statusCounts.ready})
        </div>
        <div
          className={`cursor-pointer px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
            statusFilter === "complete" 
              ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25" 
              : "bg-card/80 text-card-foreground border border-border hover:bg-card hover:shadow-sm dark:bg-card/60"
          }`}
          onClick={() => onStatusFilterChange("complete")}
        >
          Complete ({statusCounts.complete})
        </div>
        <div
          className={`cursor-pointer px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
            statusFilter === "failed" 
              ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25" 
              : "bg-card/80 text-card-foreground border border-border hover:bg-card hover:shadow-sm dark:bg-card/60"
          }`}
          onClick={() => onStatusFilterChange("failed")}
        >
          Failed ({statusCounts.failed})
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 bg-card/80 dark:bg-card/60 border-border shadow-sm hover:shadow-md focus:shadow-lg transition-all duration-200 rounded-xl backdrop-blur-sm"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-56 h-12 bg-card/80 dark:bg-card/60 border-border shadow-sm hover:shadow-md rounded-xl backdrop-blur-sm">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-card/95 dark:bg-card/90 backdrop-blur-xl border-border shadow-xl rounded-xl">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )
}