import { CheckCircle, Clock, Edit3, AlertCircle } from "lucide-react"
import type { SaveStatus } from "../../../../app/dashboard/editor/[videoId]/utils/types"

interface SaveStatusIndicatorProps {
  status: SaveStatus
}

export function SaveStatusIndicator({ status }: SaveStatusIndicatorProps) {
  const getIcon = () => {
    switch (status) {
      case "saved":
        return <CheckCircle className="h-4 w-4 text-primary" />
      case "saving":
        return <Clock className="h-4 w-4 text-primary animate-spin" />
      case "editing":
        return <Edit3 className="h-4 w-4 text-primary" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />
    }
  }

  const getText = () => {
    switch (status) {
      case "saved":
        return "Saved"
      case "saving":
        return "Saving..."
      case "editing":
        return "Editing"
      case "error":
        return "Error"
    }
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/60 dark:bg-card/40 border border-border">
      {getIcon()}
      <span className="text-sm font-medium text-foreground">{getText()}</span>
    </div>
  )
}