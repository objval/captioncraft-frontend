import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, RefreshCcw } from "lucide-react"

interface AdminFiltersProps {
  searchQuery: string
  filterRole: "all" | "admin" | "user" | "banned"
  onSearchChange: (query: string) => void
  onFilterChange: (filter: "all" | "admin" | "user" | "banned") => void
}

export function AdminFilters({
  searchQuery,
  filterRole,
  onSearchChange,
  onFilterChange
}: AdminFiltersProps) {
  return (
    <div className="flex gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            {filterRole === "all" ? "All Users" : 
             filterRole === "admin" ? "Admins" : 
             filterRole === "banned" ? "Banned" : "Users"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onFilterChange("all")}>
            All Users
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("admin")}>
            Admins Only
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("user")}>
            Regular Users
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange("banned")}>
            Banned Users
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}