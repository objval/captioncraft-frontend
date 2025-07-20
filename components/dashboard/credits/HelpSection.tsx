import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, ChevronRight } from "lucide-react"

export function HelpSection() {
  return (
    <Card className="bg-gradient-to-r from-blue-50/20 to-purple-50/20 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-card shadow-sm">
              <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Need more credits?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Purchase credits in bulk for better value. Each credit allows you to process one video.
              </p>
            </div>
          </div>
          <Button variant="outline" className="hidden sm:flex items-center gap-2">
            View Plans
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}