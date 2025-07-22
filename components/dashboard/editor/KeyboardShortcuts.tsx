import { MousePointer } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function KeyboardShortcuts() {
  return (
    <Card className="hidden md:block shadow-lg border-0 bg-card/80 dark:bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <MousePointer className="h-4 w-4" />
          Keyboard Shortcuts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Space</Badge>
            <span>Play/Pause</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">←</Badge>
            <span>Skip Back 5s</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">→</Badge>
            <span>Skip Forward 5s</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">M</Badge>
            <span>Mute/Unmute</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}