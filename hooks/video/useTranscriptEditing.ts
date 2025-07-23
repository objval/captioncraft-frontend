import { useCallback } from 'react'
import type { TranscriptData, TranscriptWord } from '@/lib/api/api'

interface UseTranscriptEditingProps {
  transcriptData: TranscriptData | null
  onSave: (transcript: TranscriptData) => void
}

export function useTranscriptEditing({ transcriptData, onSave }: UseTranscriptEditingProps) {
  /**
   * Updates segments based on the current words array
   * This ensures segments always reflect the actual word content
   */
  const updateSegmentsFromWords = useCallback((transcript: TranscriptData): TranscriptData => {
    const updatedSegments = transcript.segments.map(segment => {
      // Find all words that belong to this segment
      const segmentWords = transcript.words.filter(
        word => word.start >= segment.start && word.end <= segment.end
      )
      
      // Join the words to create the segment text
      const text = segmentWords.map(w => w.word).join(' ')
      
      return {
        ...segment,
        text
      }
    })
    
    return {
      ...transcript,
      segments: updatedSegments
    }
  }, [])

  /**
   * Handles segment text editing
   * When a segment is edited, we need to update the individual words
   */
  const handleSegmentEdit = useCallback(
    (segmentId: number, text: string, startTime: number, endTime: number) => {
      if (!transcriptData) return
      
      // Find the segment being edited
      const segment = transcriptData.segments.find(s => s.id === segmentId)
      if (!segment) return
      
      // Find all words in this segment
      const segmentWordIndices: number[] = []
      const segmentWords = transcriptData.words.filter((word, index) => {
        const inSegment = word.start >= segment.start && word.end <= segment.end
        if (inSegment) segmentWordIndices.push(index)
        return inSegment
      })
      
      // Split the new text into words
      const newWords = text.trim().split(/\s+/).filter(w => w.length > 0)
      
      // If we have the same number of words, update them in place
      if (newWords.length === segmentWords.length) {
        const updatedWords = [...transcriptData.words]
        segmentWords.forEach((word, i) => {
          const wordIndex = segmentWordIndices[i]
          updatedWords[wordIndex] = {
            ...word,
            word: newWords[i]
          }
        })
        
        // Update the segment
        const updatedSegments = transcriptData.segments.map(s =>
          s.id === segmentId
            ? { ...s, text, start: startTime, end: endTime }
            : s
        )
        
        onSave({
          ...transcriptData,
          words: updatedWords,
          segments: updatedSegments
        })
      } else {
        // Different number of words - need to redistribute timing
        const totalDuration = segment.end - segment.start
        const averageDuration = totalDuration / newWords.length
        
        // Create new word objects with distributed timing
        const newWordObjects: TranscriptWord[] = newWords.map((word, i) => ({
          word,
          start: segment.start + (i * averageDuration),
          end: segment.start + ((i + 1) * averageDuration)
        }))
        
        // Replace the old words with new ones
        const updatedWords = [
          ...transcriptData.words.slice(0, segmentWordIndices[0]),
          ...newWordObjects,
          ...transcriptData.words.slice(segmentWordIndices[segmentWordIndices.length - 1] + 1)
        ]
        
        // Update the segment
        const updatedSegments = transcriptData.segments.map(s =>
          s.id === segmentId
            ? { ...s, text, start: startTime, end: endTime }
            : s
        )
        
        onSave({
          ...transcriptData,
          words: updatedWords,
          segments: updatedSegments
        })
      }
    },
    [transcriptData, onSave]
  )

  /**
   * Handles individual word editing
   * When a word is edited, we need to update the parent segment
   */
  const handleWordEdit = useCallback(
    (index: number, word: string, startTime: number, endTime: number) => {
      if (!transcriptData) return
      
      // Update the word
      const updatedWords = transcriptData.words.map((w, i) =>
        i === index
          ? { ...w, word, start: startTime, end: endTime }
          : w
      )
      
      // Create updated transcript with new words
      let updatedTranscript = {
        ...transcriptData,
        words: updatedWords
      }
      
      // Update segments to reflect the word changes
      updatedTranscript = updateSegmentsFromWords(updatedTranscript)
      
      onSave(updatedTranscript)
    },
    [transcriptData, onSave, updateSegmentsFromWords]
  )

  /**
   * Bulk find and replace across all words
   */
  const handleFindReplace = useCallback(
    (find: string, replace: string, caseSensitive: boolean = false): number => {
      if (!transcriptData || !find) return 0
      
      let count = 0
      const regex = new RegExp(find, caseSensitive ? 'g' : 'gi')
      
      // Update all words
      const updatedWords = transcriptData.words.map(word => {
        if (regex.test(word.word)) {
          count++
          return {
            ...word,
            word: word.word.replace(regex, replace)
          }
        }
        return word
      })
      
      // Create updated transcript with new words
      let updatedTranscript = {
        ...transcriptData,
        words: updatedWords
      }
      
      // Update segments to reflect the word changes
      updatedTranscript = updateSegmentsFromWords(updatedTranscript)
      
      onSave(updatedTranscript)
      return count
    },
    [transcriptData, onSave, updateSegmentsFromWords]
  )

  /**
   * Smart punctuation fixer
   */
  const fixPunctuation = useCallback(() => {
    if (!transcriptData) return
    
    const updatedWords = transcriptData.words.map((word, i) => {
      let newWord = word.word
      
      // Capitalize first word and words after sentence endings
      if (i === 0 || (i > 0 && /[.!?]$/.test(transcriptData.words[i - 1].word))) {
        newWord = newWord.charAt(0).toUpperCase() + newWord.slice(1)
      }
      
      // Add period to last word if missing
      if (i === transcriptData.words.length - 1 && !/[.!?]$/.test(newWord)) {
        newWord += '.'
      }
      
      // Fix common issues
      newWord = newWord
        .replace(/\bi\b/g, 'I') // Capitalize 'i'
        .replace(/\s+([.,!?])/g, '$1') // Remove space before punctuation
        .replace(/([.,!?])([a-zA-Z])/g, '$1 $2') // Add space after punctuation
      
      return { ...word, word: newWord }
    })
    
    // Create updated transcript with new words
    let updatedTranscript = {
      ...transcriptData,
      words: updatedWords
    }
    
    // Update segments to reflect the word changes
    updatedTranscript = updateSegmentsFromWords(updatedTranscript)
    
    onSave(updatedTranscript)
  }, [transcriptData, onSave, updateSegmentsFromWords])

  return {
    handleSegmentEdit,
    handleWordEdit,
    handleFindReplace,
    fixPunctuation,
    updateSegmentsFromWords
  }
}