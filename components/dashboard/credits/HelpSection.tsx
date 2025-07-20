import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, ChevronRight } from "lucide-react"

export function HelpSection() {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-white shadow-sm">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Need more credits?</h3>
              <p className="text-sm text-slate-600 mt-1">
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