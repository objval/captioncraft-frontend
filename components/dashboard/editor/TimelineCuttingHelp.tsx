import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, MousePointer, Scissors } from 'lucide-react'

export function TimelineCuttingHelp() {
  return (
    <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="text-blue-900 dark:text-blue-100">
        <div className="space-y-2">
          <p className="font-medium">Manual Cutting Mode</p>
          <ul className="text-sm space-y-1 ml-4">
            <li className="flex items-start gap-2">
              <MousePointer className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>Click and drag on the timeline to mark sections to remove</span>
            </li>
            <li className="flex items-start gap-2">
              <Scissors className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>Red areas will be cut out, keeping everything else</span>
            </li>
            <li className="flex items-start gap-2">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>Click "Apply Cuts" in the header when ready to process</span>
            </li>
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  )
}