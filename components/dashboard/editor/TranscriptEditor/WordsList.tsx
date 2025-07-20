import { useState } from "react"
import type { TranscriptWord } from "@/lib/api"
import { getTextDirection, isRTLLanguage } from "@/lib/utils/rtl-helpers"
import { WordEditForm } from "./WordEditForm"

interface WordsListProps {
  words: TranscriptWord[]
  activeWordIndex: number | null
  editingWordIndex: number | null
  language?: string
  onWordClick: (word: TranscriptWord, index: number) => void
  onStartEdit: (index: number) => void
  onSaveEdit: (index: number, word: string, startTime: number, endTime: number) => void
  onCancelEdit: () => void
}

export function WordsList({
  words,
  activeWordIndex,
  editingWordIndex,
  language,
  onWordClick,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
}: WordsListProps) {
  const [editingText, setEditingText] = useState("")
  const [editingStartTime, setEditingStartTime] = useState(0)
  const [editingEndTime, setEditingEndTime] = useState(0)

  const handleStartEdit = (index: number) => {
    const word = words[index]
    setEditingText(word.word)
    setEditingStartTime(word.start)
    setEditingEndTime(word.end)
    onStartEdit(index)
  }

  const handleSaveEdit = (index: number) => {
    onSaveEdit(index, editingText, editingStartTime, editingEndTime)
  }

  return (
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
      <div 
        className={`flex flex-wrap gap-1.5 ${
          isRTLLanguage(language) ? 'justify-end' : 'justify-start'
        }`}
        style={{ 
          direction: getTextDirection(language),
          textAlign: isRTLLanguage(language) ? 'right' : 'left',
          unicodeBidi: 'isolate'
        }}
      >
        {words.map((word, index) => (
          <span
            key={index}
            className={`px-2 py-1.5 rounded text-sm cursor-pointer transition-colors touch-pan-y min-h-[32px] flex items-center break-words ${
              activeWordIndex === index
                ? "bg-primary text-primary-foreground"
                : editingWordIndex === index
                ? "bg-blue-100 text-blue-800"
                : "bg-muted hover:bg-muted/80 active:bg-muted"
            }`}
            onClick={() => onWordClick(word, index)}
            onDoubleClick={() => handleStartEdit(index)}
            style={{ direction: getTextDirection(language) }}
          >
            {word.word}
          </span>
        ))}
      </div>

      {editingWordIndex !== null && (
        <WordEditForm
          word={editingText}
          startTime={editingStartTime}
          endTime={editingEndTime}
          language={language}
          onWordChange={setEditingText}
          onStartTimeChange={setEditingStartTime}
          onEndTimeChange={setEditingEndTime}
          onSave={() => handleSaveEdit(editingWordIndex)}
          onCancel={onCancelEdit}
        />
      )}
    </div>
  )
}