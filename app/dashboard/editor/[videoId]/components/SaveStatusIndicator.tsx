import { CheckCircle, Clock, Edit3, AlertCircle } from "lucide-react"
import type { SaveStatus } from "../utils/types"

interface SaveStatusIndicatorProps {
  status: SaveStatus
}

export function SaveStatusIndicator({ status }: SaveStatusIndicatorProps) {
  const getIcon = () => {
    switch (status) {
      case "saved":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "saving":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case "editing":
        return <Edit3 className="h-4 w-4 text-blue-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
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
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/60 border border-slate-200/60">
      {getIcon()}
      <span className="text-sm font-medium text-slate-700">{getText()}</span>
    </div>
  )
}