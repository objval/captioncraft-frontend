import { AlertCircle } from "lucide-react"

export function ErrorState() {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Video or transcript not found</h3>
        <p className="text-muted-foreground">
          The video or its transcript could not be loaded. Please try again.
        </p>
      </div>
    </div>
  )
}