import type { CutMark } from '@/lib/types/video-cutting'
import type { CutSegment } from '@/lib/api/api'

/**
 * Converts cut marks (sections to remove) into segments to keep for the API
 * @param cutMarks - Array of cut marks representing sections to remove
 * @param videoDuration - Total duration of the video in seconds
 * @returns Array of segments to keep
 */
export function convertCutMarksToKeepSegments(
  cutMarks: CutMark[],
  videoDuration: number
): CutSegment[] {
  if (!cutMarks.length) {
    // No cuts, keep entire video
    return [{
      start: 0,
      end: videoDuration,
      duration: videoDuration,
      words: 0,
      reason: 'No cuts applied'
    }]
  }

  // Sort cut marks by start time
  const sortedCuts = [...cutMarks].sort((a, b) => a.startTime - b.startTime)
  const keepSegments: CutSegment[] = []
  
  // If the first cut doesn't start at 0, keep the beginning
  if (sortedCuts[0].startTime > 0) {
    keepSegments.push({
      start: 0,
      end: sortedCuts[0].startTime,
      duration: sortedCuts[0].startTime,
      words: 0,
      reason: 'Content before first cut'
    })
  }

  // Add segments between cuts
  for (let i = 0; i < sortedCuts.length - 1; i++) {
    const currentCut = sortedCuts[i]
    const nextCut = sortedCuts[i + 1]
    
    // If there's a gap between cuts, keep that segment
    if (currentCut.endTime < nextCut.startTime) {
      keepSegments.push({
        start: currentCut.endTime,
        end: nextCut.startTime,
        duration: nextCut.startTime - currentCut.endTime,
        words: 0,
        reason: `Content between cuts ${i + 1} and ${i + 2}`
      })
    }
  }

  // If the last cut doesn't end at video duration, keep the ending
  const lastCut = sortedCuts[sortedCuts.length - 1]
  if (lastCut.endTime < videoDuration) {
    keepSegments.push({
      start: lastCut.endTime,
      end: videoDuration,
      duration: videoDuration - lastCut.endTime,
      words: 0,
      reason: 'Content after last cut'
    })
  }

  return keepSegments
}

/**
 * Validates that the segments to keep are valid
 * @param segments - Array of segments to keep
 * @returns Validation result
 */
export function validateKeepSegments(segments: CutSegment[]): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!segments.length) {
    errors.push('At least one segment must be kept')
    return { isValid: false, errors }
  }

  // Check for chronological order
  for (let i = 0; i < segments.length - 1; i++) {
    if (segments[i].end > segments[i + 1].start) {
      errors.push(`Segments ${i + 1} and ${i + 2} overlap`)
    }
    if (segments[i].start >= segments[i].end) {
      errors.push(`Segment ${i + 1} has invalid time range`)
    }
  }

  // Check last segment
  const lastSegment = segments[segments.length - 1]
  if (lastSegment.start >= lastSegment.end) {
    errors.push(`Last segment has invalid time range`)
  }

  return { isValid: errors.length === 0, errors }
}

/**
 * Calculates the total duration of segments to keep
 * @param segments - Array of segments to keep
 * @returns Total duration in seconds
 */
export function calculateKeepDuration(segments: CutSegment[]): number {
  return segments.reduce((total, segment) => total + segment.duration, 0)
}

/**
 * Formats cut summary for display
 * @param cutMarks - Array of cut marks
 * @param videoDuration - Total video duration
 * @returns Formatted summary
 */
export function formatCutSummary(cutMarks: CutMark[], videoDuration: number): {
  totalCuts: number
  totalCutDuration: number
  totalKeepDuration: number
  percentageRemoved: number
  percentageKept: number
} {
  const keepSegments = convertCutMarksToKeepSegments(cutMarks, videoDuration)
  const totalKeepDuration = calculateKeepDuration(keepSegments)
  const totalCutDuration = videoDuration - totalKeepDuration

  return {
    totalCuts: cutMarks.length,
    totalCutDuration,
    totalKeepDuration,
    percentageRemoved: (totalCutDuration / videoDuration) * 100,
    percentageKept: (totalKeepDuration / videoDuration) * 100
  }
}