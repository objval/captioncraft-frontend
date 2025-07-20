import { useCallback } from 'react'
import type { TranscriptData } from '@/lib/api'

interface UseTranscriptEditingProps {
  transcriptData: TranscriptData | null
  onSave: (transcript: TranscriptData) => void
}

export function useTranscriptEditing({ transcriptData, onSave }: UseTranscriptEditingProps) {
  const handleSegmentEdit = useCallback(
    (segmentId: number, text: string, startTime: number, endTime: number) => {
      if (!transcriptData) return
      
      const updatedSegments = transcriptData.segments.map((segment) =>
        segment.id === segmentId
          ? { ...segment, text, start: startTime, end: endTime }
          : segment
      )
      
      const updatedTranscript = { ...transcriptData, segments: updatedSegments }
      onSave(updatedTranscript)
    },
    [transcriptData, onSave]
  )

  const handleWordEdit = useCallback(
    (index: number, word: string, startTime: number, endTime: number) => {
      if (!transcriptData) return
      
      const updatedWords = transcriptData.words.map((w, i) =>
        i === index
          ? { ...w, word, start: startTime, end: endTime }
          : w
      )
      
      const updatedTranscript = { ...transcriptData, words: updatedWords }
      onSave(updatedTranscript)
    },
    [transcriptData, onSave]
  )

  return {
    handleSegmentEdit,
    handleWordEdit,
  }
}