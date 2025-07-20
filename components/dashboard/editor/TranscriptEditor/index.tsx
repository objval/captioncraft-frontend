import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit3, Type, List } from "lucide-react"
import type { TranscriptData, TranscriptSegment, TranscriptWord } from "@/lib/api/api"
import type { EditMode } from "@/lib/utils/types"
import { isRTLLanguage } from "@/lib/utils/rtl-helpers"
import { SegmentsList } from "./SegmentsList"
import { WordsList } from "./WordsList"

interface TranscriptEditorProps {
  transcriptData: TranscriptData | null
  editMode: EditMode
  activeSegmentId: number | null
  activeWordIndex: number | null
  editingSegmentId: number | null
  editingWordIndex: number | null
  onEditModeChange: (mode: EditMode) => void
  onSegmentClick: (segment: TranscriptSegment) => void
  onWordClick: (word: TranscriptWord, index: number) => void
  onStartEditSegment: (segment: TranscriptSegment) => void
  onStartEditWord: (index: number) => void
  onSaveSegmentEdit: (segmentId: number, text: string, startTime: number, endTime: number) => void
  onSaveWordEdit: (index: number, word: string, startTime: number, endTime: number) => void
  onCancelSegmentEdit: () => void
  onCancelWordEdit: () => void
}

export function TranscriptEditor({
  transcriptData,
  editMode,
  activeSegmentId,
  activeWordIndex,
  editingSegmentId,
  editingWordIndex,
  onEditModeChange,
  onSegmentClick,
  onWordClick,
  onStartEditSegment,
  onStartEditWord,
  onSaveSegmentEdit,
  onSaveWordEdit,
  onCancelSegmentEdit,
  onCancelWordEdit,
}: TranscriptEditorProps) {
  if (!transcriptData) {
    return (
      <Card className="h-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Edit3 className="h-4 w-4" />
            Transcript Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No transcript data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full shadow-lg border-0 bg-white/80 backdrop-blur-sm flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0 border-b">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg">
            <Edit3 className="h-4 w-4" />
            Transcript Editor
          </div>
          {transcriptData.language && (
            <Badge variant="outline" className="text-xs">
              {transcriptData.language.toUpperCase()} 
              {isRTLLanguage(transcriptData.language) && ' (RTL)'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <Tabs 
        value={editMode} 
        onValueChange={(value) => onEditModeChange(value as EditMode)} 
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="border-b bg-slate-50/50 px-4 pt-2">
          <TabsList className="grid w-full grid-cols-2 h-10 bg-white/80">
            <TabsTrigger value="segments" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <List className="h-3 w-3 mr-1.5" />
              Segments ({transcriptData.segments?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="words" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Type className="h-3 w-3 mr-1.5" />
              Words ({transcriptData.words?.length || 0})
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="segments" className="h-full m-0 p-4">
            {transcriptData.segments && transcriptData.segments.length > 0 ? (
              <ScrollArea className="h-full">
                <SegmentsList
                  segments={transcriptData.segments}
                  activeSegmentId={activeSegmentId}
                  editingSegmentId={editingSegmentId}
                  language={transcriptData.language}
                  onSegmentClick={onSegmentClick}
                  onStartEdit={onStartEditSegment}
                  onSaveEdit={onSaveSegmentEdit}
                  onCancelEdit={onCancelSegmentEdit}
                />
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No segments available
              </div>
            )}
          </TabsContent>

          <TabsContent value="words" className="h-full m-0 p-4">
            {transcriptData.words && transcriptData.words.length > 0 ? (
              <ScrollArea className="h-full">
                <WordsList
                  words={transcriptData.words}
                  activeWordIndex={activeWordIndex}
                  editingWordIndex={editingWordIndex}
                  language={transcriptData.language}
                  onWordClick={onWordClick}
                  onStartEdit={onStartEditWord}
                  onSaveEdit={onSaveWordEdit}
                  onCancelEdit={onCancelWordEdit}
                />
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No words available
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  )
}