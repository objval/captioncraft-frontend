import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Replace } from 'lucide-react'
import toast from '@/lib/utils/toast'

interface FindReplaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFindReplace: (find: string, replace: string, caseSensitive: boolean) => number
}

export function FindReplaceDialog({
  open,
  onOpenChange,
  onFindReplace
}: FindReplaceDialogProps) {
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)

  const handleReplace = () => {
    if (!findText) {
      toast.error('Please enter text to find')
      return
    }

    const count = onFindReplace(findText, replaceText, caseSensitive)
    
    if (count > 0) {
      toast.success(`Replaced ${count} occurrence${count !== 1 ? 's' : ''}`)
      onOpenChange(false)
      setFindText('')
      setReplaceText('')
    } else {
      toast.error('No matches found')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find & Replace
          </DialogTitle>
          <DialogDescription>
            Search and replace text across all transcript words
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="find">Find</Label>
            <Input
              id="find"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Text to find..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && findText) {
                  handleReplace()
                }
              }}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="replace">Replace with</Label>
            <Input
              id="replace"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replacement text..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && findText) {
                  handleReplace()
                }
              }}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="case-sensitive"
              checked={caseSensitive}
              onCheckedChange={(checked) => setCaseSensitive(checked as boolean)}
            />
            <Label
              htmlFor="case-sensitive"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Case sensitive
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleReplace} disabled={!findText} className="gap-2">
            <Replace className="h-4 w-4" />
            Replace All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}