export type CutType = 'manual' | 'auto' | 'scene-change' | 'silence'

export interface CutMark {
  id: string
  startTime: number
  endTime: number
  type: CutType
  label?: string
  color?: string
  locked?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CuttingState {
  cutMarks: CutMark[]
  activeCutId: string | null
  isPreviewMode: boolean
  showCutOverlay: boolean
  cutMode: 'marking' | 'editing' | 'preview'
}

export interface CutMarkDraft {
  startTime?: number
  endTime?: number
  type: CutType
}

export interface CuttingOptions {
  allowOverlapping: boolean
  snapToFrames: boolean
  minCutDuration: number // in seconds
  maxCutDuration?: number // in seconds
}

export const DEFAULT_CUTTING_OPTIONS: CuttingOptions = {
  allowOverlapping: false,
  snapToFrames: true,
  minCutDuration: 0.1,
  maxCutDuration: undefined
}

export const CUT_COLORS: Record<CutType, string> = {
  manual: '#ef4444', // red
  auto: '#3b82f6', // blue
  'scene-change': '#10b981', // green
  silence: '#f59e0b', // amber
}

export interface CutMarkValidation {
  isValid: boolean
  errors: string[]
}

export function validateCutMark(
  cutMark: Partial<CutMark>, 
  existingMarks: CutMark[], 
  options: CuttingOptions
): CutMarkValidation {
  const errors: string[] = []

  if (cutMark.startTime === undefined || cutMark.endTime === undefined) {
    errors.push('Cut mark must have both start and end times')
    return { isValid: false, errors }
  }

  if (cutMark.startTime >= cutMark.endTime) {
    errors.push('Start time must be before end time')
  }

  const duration = cutMark.endTime - cutMark.startTime
  if (duration < options.minCutDuration) {
    errors.push(`Cut duration must be at least ${options.minCutDuration} seconds`)
  }

  if (options.maxCutDuration && duration > options.maxCutDuration) {
    errors.push(`Cut duration cannot exceed ${options.maxCutDuration} seconds`)
  }

  if (!options.allowOverlapping) {
    const overlapping = existingMarks.find(mark => 
      mark.id !== cutMark.id && (
        (cutMark.startTime >= mark.startTime && cutMark.startTime < mark.endTime) ||
        (cutMark.endTime > mark.startTime && cutMark.endTime <= mark.endTime) ||
        (cutMark.startTime <= mark.startTime && cutMark.endTime >= mark.endTime)
      )
    )
    
    if (overlapping) {
      errors.push('Cut marks cannot overlap')
    }
  }

  return { isValid: errors.length === 0, errors }
}

export function sortCutMarks(marks: CutMark[]): CutMark[] {
  return [...marks].sort((a, b) => a.startTime - b.startTime)
}

export function mergeCutMarks(marks: CutMark[]): CutMark[] {
  if (marks.length <= 1) return marks

  const sorted = sortCutMarks(marks)
  const merged: CutMark[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]
    const last = merged[merged.length - 1]

    if (current.startTime <= last.endTime) {
      // Merge overlapping cuts
      last.endTime = Math.max(last.endTime, current.endTime)
      last.updatedAt = new Date()
    } else {
      merged.push(current)
    }
  }

  return merged
}

export function calculateTotalCutDuration(marks: CutMark[]): number {
  const merged = mergeCutMarks(marks)
  return merged.reduce((total, mark) => total + (mark.endTime - mark.startTime), 0)
}

export function calculateRemainingDuration(videoDuration: number, marks: CutMark[]): number {
  return videoDuration - calculateTotalCutDuration(marks)
}