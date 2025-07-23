import { useState, useCallback, useMemo } from 'react'
import {
  CutMark,
  CutType,
  CuttingState,
  CutMarkDraft,
  CuttingOptions,
  DEFAULT_CUTTING_OPTIONS,
  validateCutMark,
  sortCutMarks,
  calculateTotalCutDuration,
  calculateRemainingDuration,
  CUT_COLORS
} from '@/lib/types/video-cutting'
import toast from '@/lib/utils/toast'

interface UseVideoCuttingProps {
  videoDuration: number
  options?: Partial<CuttingOptions>
}

export function useVideoCutting({ videoDuration, options = {} }: UseVideoCuttingProps) {
  const cuttingOptions: CuttingOptions = { ...DEFAULT_CUTTING_OPTIONS, ...options }
  
  const [state, setState] = useState<CuttingState>({
    cutMarks: [],
    activeCutId: null,
    isPreviewMode: false,
    showCutOverlay: true,
    cutMode: 'marking'
  })

  const [draft, setDraft] = useState<CutMarkDraft | null>(null)
  const [history, setHistory] = useState<CuttingState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Add to history for undo/redo
  const addToHistory = useCallback((newState: CuttingState) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newState)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  // Generate a unique ID
  const generateId = () => {
    return `cut-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Add a new cut mark
  const addCutMark = useCallback((startTime: number, endTime: number, type: CutType = 'manual') => {
    const newMark: CutMark = {
      id: generateId(),
      startTime,
      endTime,
      type,
      color: CUT_COLORS[type],
      locked: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const validation = validateCutMark(newMark, state.cutMarks, cuttingOptions)
    if (!validation.isValid) {
      toast.error(validation.errors[0])
      return null
    }

    const newState = {
      ...state,
      cutMarks: sortCutMarks([...state.cutMarks, newMark])
    }
    
    setState(newState)
    addToHistory(newState)
    toast.success('Cut mark added')
    
    return newMark
  }, [state, cuttingOptions, addToHistory])

  // Update an existing cut mark
  const updateCutMark = useCallback((id: string, updates: Partial<CutMark>) => {
    const markIndex = state.cutMarks.findIndex(m => m.id === id)
    if (markIndex === -1) return

    const updatedMark = {
      ...state.cutMarks[markIndex],
      ...updates,
      updatedAt: new Date()
    }

    const validation = validateCutMark(updatedMark, state.cutMarks, cuttingOptions)
    if (!validation.isValid) {
      toast.error(validation.errors[0])
      return
    }

    const newMarks = [...state.cutMarks]
    newMarks[markIndex] = updatedMark

    const newState = {
      ...state,
      cutMarks: sortCutMarks(newMarks)
    }
    
    setState(newState)
    addToHistory(newState)
  }, [state, cuttingOptions, addToHistory])

  // Remove a cut mark
  const removeCutMark = useCallback((id: string) => {
    const newState = {
      ...state,
      cutMarks: state.cutMarks.filter(m => m.id !== id),
      activeCutId: state.activeCutId === id ? null : state.activeCutId
    }
    
    setState(newState)
    addToHistory(newState)
    toast.success('Cut mark removed')
  }, [state, addToHistory])

  // Start drafting a new cut
  const startDraft = useCallback((startTime: number, type: CutType = 'manual') => {
    setDraft({ startTime, type })
  }, [])

  // Update draft end time
  const updateDraft = useCallback((endTime: number) => {
    if (!draft) return
    setDraft({ ...draft, endTime })
  }, [draft])

  // Complete the draft and add as cut mark
  const completeDraft = useCallback(() => {
    if (!draft || draft.startTime === undefined || draft.endTime === undefined) return

    const result = addCutMark(
      Math.min(draft.startTime, draft.endTime),
      Math.max(draft.startTime, draft.endTime),
      draft.type
    )
    
    setDraft(null)
    return result
  }, [draft, addCutMark])

  // Cancel draft
  const cancelDraft = useCallback(() => {
    setDraft(null)
  }, [])

  // Set active cut for editing
  const setActiveCut = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, activeCutId: id }))
  }, [])

  // Toggle preview mode
  const togglePreviewMode = useCallback(() => {
    setState(prev => ({ ...prev, isPreviewMode: !prev.isPreviewMode }))
    toast.info(state.isPreviewMode ? 'Preview mode disabled' : 'Preview mode enabled')
  }, [state.isPreviewMode])

  // Toggle cut overlay visibility
  const toggleCutOverlay = useCallback(() => {
    setState(prev => ({ ...prev, showCutOverlay: !prev.showCutOverlay }))
  }, [])

  // Set cut mode
  const setCutMode = useCallback((mode: CuttingState['cutMode']) => {
    setState(prev => ({ ...prev, cutMode: mode }))
  }, [])

  // Clear all cuts
  const clearAllCuts = useCallback(() => {
    const newState = {
      ...state,
      cutMarks: [],
      activeCutId: null
    }
    
    setState(newState)
    addToHistory(newState)
    toast.success('All cuts cleared')
  }, [state, addToHistory])

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setState(history[newIndex])
      setHistoryIndex(newIndex)
    }
  }, [history, historyIndex])

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setState(history[newIndex])
      setHistoryIndex(newIndex)
    }
  }, [history, historyIndex])

  // Check if a time is within a cut
  const isTimeInCut = useCallback((time: number): boolean => {
    return state.cutMarks.some(mark => time >= mark.startTime && time <= mark.endTime)
  }, [state.cutMarks])

  // Get next valid time (skipping cuts in preview mode)
  const getNextValidTime = useCallback((time: number): number => {
    if (!state.isPreviewMode) return time

    const cut = state.cutMarks.find(mark => time >= mark.startTime && time < mark.endTime)
    return cut ? cut.endTime : time
  }, [state.cutMarks, state.isPreviewMode])

  // Calculate statistics
  const stats = useMemo(() => ({
    totalCuts: state.cutMarks.length,
    totalCutDuration: calculateTotalCutDuration(state.cutMarks),
    remainingDuration: calculateRemainingDuration(videoDuration, state.cutMarks),
    percentageCut: videoDuration > 0 
      ? (calculateTotalCutDuration(state.cutMarks) / videoDuration) * 100 
      : 0
  }), [state.cutMarks, videoDuration])

  return {
    // State
    cutMarks: state.cutMarks,
    activeCutId: state.activeCutId,
    isPreviewMode: state.isPreviewMode,
    showCutOverlay: state.showCutOverlay,
    cutMode: state.cutMode,
    draft,
    stats,
    
    // Actions
    addCutMark,
    updateCutMark,
    removeCutMark,
    startDraft,
    updateDraft,
    completeDraft,
    cancelDraft,
    setActiveCut,
    togglePreviewMode,
    toggleCutOverlay,
    setCutMode,
    clearAllCuts,
    undo,
    redo,
    isTimeInCut,
    getNextValidTime,
    
    // History
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  }
}