import { useReducer, useCallback } from 'react'
import type { Video, TranscriptData, TranscriptSegment, TranscriptWord } from '@/lib/api/api'
import type { SaveStatus, EditMode } from '@/lib/utils/types'

// State shape
interface EditorState {
  // Video and transcript data
  video: Video | null
  transcriptData: TranscriptData | null
  
  // UI state
  loading: boolean
  saveStatus: SaveStatus
  burningIn: boolean
  editMode: EditMode
  showFinalVideo: boolean
  
  // Editing state
  editingSegmentId: number | null
  editingWordIndex: number | null
  editingText: string
  editingStartTime: number
  editingEndTime: number
  activeSegmentId: number | null
  activeWordIndex: number | null
}

// Action types
type EditorAction =
  | { type: 'SET_VIDEO'; payload: Video }
  | { type: 'SET_TRANSCRIPT'; payload: TranscriptData }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVE_STATUS'; payload: SaveStatus }
  | { type: 'SET_BURNING_IN'; payload: boolean }
  | { type: 'SET_EDIT_MODE'; payload: EditMode }
  | { type: 'SET_SHOW_FINAL_VIDEO'; payload: boolean }
  | { type: 'START_EDITING_SEGMENT'; payload: { segmentId: number; text: string; startTime: number; endTime: number } }
  | { type: 'START_EDITING_WORD'; payload: { wordIndex: number; text: string } }
  | { type: 'UPDATE_EDITING_TEXT'; payload: string }
  | { type: 'UPDATE_EDITING_TIME'; payload: { startTime?: number; endTime?: number } }
  | { type: 'SAVE_SEGMENT_EDIT'; payload: { segmentId: number; text: string } }
  | { type: 'SAVE_WORD_EDIT'; payload: { segmentId: number; wordIndex: number; text: string } }
  | { type: 'CANCEL_EDITING' }
  | { type: 'SET_ACTIVE_SEGMENT'; payload: number | null }
  | { type: 'SET_ACTIVE_WORD'; payload: { segmentId: number; wordIndex: number } | null }
  | { type: 'UPDATE_SEGMENT'; payload: { segmentId: number; segment: Partial<TranscriptSegment> } }
  | { type: 'UPDATE_WORD'; payload: { segmentId: number; wordIndex: number; word: Partial<TranscriptWord> } }
  | { type: 'RESET_STATE' }

// Initial state
const initialState: EditorState = {
  video: null,
  transcriptData: null,
  loading: true,
  saveStatus: 'saved',
  burningIn: false,
  editMode: 'segments',
  showFinalVideo: false,
  editingSegmentId: null,
  editingWordIndex: null,
  editingText: '',
  editingStartTime: 0,
  editingEndTime: 0,
  activeSegmentId: null,
  activeWordIndex: null,
}

// Reducer function
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_VIDEO':
      return { ...state, video: action.payload }
    
    case 'SET_TRANSCRIPT':
      return { ...state, transcriptData: action.payload }
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload }
    
    case 'SET_BURNING_IN':
      return { ...state, burningIn: action.payload }
    
    case 'SET_EDIT_MODE':
      return { ...state, editMode: action.payload }
    
    case 'SET_SHOW_FINAL_VIDEO':
      return { ...state, showFinalVideo: action.payload }
    
    case 'START_EDITING_SEGMENT':
      return {
        ...state,
        editingSegmentId: action.payload.segmentId,
        editingText: action.payload.text,
        editingStartTime: action.payload.startTime,
        editingEndTime: action.payload.endTime,
        editingWordIndex: null,
      }
    
    case 'START_EDITING_WORD':
      return {
        ...state,
        editingWordIndex: action.payload.wordIndex,
        editingText: action.payload.text,
        editingSegmentId: null,
      }
    
    case 'UPDATE_EDITING_TEXT':
      return { ...state, editingText: action.payload }
    
    case 'UPDATE_EDITING_TIME':
      return {
        ...state,
        ...(action.payload.startTime !== undefined && { editingStartTime: action.payload.startTime }),
        ...(action.payload.endTime !== undefined && { editingEndTime: action.payload.endTime }),
      }
    
    case 'SAVE_SEGMENT_EDIT':
      if (!state.transcriptData) return state
      return {
        ...state,
        transcriptData: {
          ...state.transcriptData,
          segments: state.transcriptData.segments.map(segment =>
            segment.id === action.payload.segmentId
              ? { ...segment, text: action.payload.text }
              : segment
          ),
        },
        editingSegmentId: null,
        editingText: '',
        saveStatus: 'saving',
      }
    
    case 'SAVE_WORD_EDIT':
      if (!state.transcriptData) return state
      return {
        ...state,
        transcriptData: {
          ...state.transcriptData,
          segments: state.transcriptData.segments.map(segment =>
            segment.id === action.payload.segmentId
              ? {
                  ...segment,
                  words: segment.words.map((word, index) =>
                    index === action.payload.wordIndex
                      ? { ...word, word: action.payload.text }
                      : word
                  ),
                }
              : segment
          ),
        },
        editingWordIndex: null,
        editingText: '',
        saveStatus: 'saving',
      }
    
    case 'CANCEL_EDITING':
      return {
        ...state,
        editingSegmentId: null,
        editingWordIndex: null,
        editingText: '',
        editingStartTime: 0,
        editingEndTime: 0,
      }
    
    case 'SET_ACTIVE_SEGMENT':
      return { ...state, activeSegmentId: action.payload }
    
    case 'SET_ACTIVE_WORD':
      return {
        ...state,
        activeSegmentId: action.payload?.segmentId || null,
        activeWordIndex: action.payload?.wordIndex || null,
      }
    
    case 'UPDATE_SEGMENT':
      if (!state.transcriptData) return state
      return {
        ...state,
        transcriptData: {
          ...state.transcriptData,
          segments: state.transcriptData.segments.map(segment =>
            segment.id === action.payload.segmentId
              ? { ...segment, ...action.payload.segment }
              : segment
          ),
        },
      }
    
    case 'UPDATE_WORD':
      if (!state.transcriptData) return state
      return {
        ...state,
        transcriptData: {
          ...state.transcriptData,
          segments: state.transcriptData.segments.map(segment =>
            segment.id === action.payload.segmentId
              ? {
                  ...segment,
                  words: segment.words.map((word, index) =>
                    index === action.payload.wordIndex
                      ? { ...word, ...action.payload.word }
                      : word
                  ),
                }
              : segment
          ),
        },
      }
    
    case 'RESET_STATE':
      return initialState
    
    default:
      return state
  }
}

// Custom hook
export function useEditorState() {
  const [state, dispatch] = useReducer(editorReducer, initialState)
  
  // Action creators
  const actions = {
    setVideo: useCallback((video: Video) => {
      dispatch({ type: 'SET_VIDEO', payload: video })
    }, []),
    
    setTranscript: useCallback((transcript: TranscriptData) => {
      dispatch({ type: 'SET_TRANSCRIPT', payload: transcript })
    }, []),
    
    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading })
    }, []),
    
    setSaveStatus: useCallback((status: SaveStatus) => {
      dispatch({ type: 'SET_SAVE_STATUS', payload: status })
    }, []),
    
    setBurningIn: useCallback((burning: boolean) => {
      dispatch({ type: 'SET_BURNING_IN', payload: burning })
    }, []),
    
    setEditMode: useCallback((mode: EditMode) => {
      dispatch({ type: 'SET_EDIT_MODE', payload: mode })
    }, []),
    
    setShowFinalVideo: useCallback((show: boolean) => {
      dispatch({ type: 'SET_SHOW_FINAL_VIDEO', payload: show })
    }, []),
    
    startEditingSegment: useCallback((segmentId: number, text: string, startTime: number, endTime: number) => {
      dispatch({ 
        type: 'START_EDITING_SEGMENT', 
        payload: { segmentId, text, startTime, endTime } 
      })
    }, []),
    
    startEditingWord: useCallback((wordIndex: number, text: string) => {
      dispatch({ 
        type: 'START_EDITING_WORD', 
        payload: { wordIndex, text } 
      })
    }, []),
    
    updateEditingText: useCallback((text: string) => {
      dispatch({ type: 'UPDATE_EDITING_TEXT', payload: text })
    }, []),
    
    updateEditingTime: useCallback((startTime?: number, endTime?: number) => {
      dispatch({ 
        type: 'UPDATE_EDITING_TIME', 
        payload: { startTime, endTime } 
      })
    }, []),
    
    saveSegmentEdit: useCallback((segmentId: number, text: string) => {
      dispatch({ 
        type: 'SAVE_SEGMENT_EDIT', 
        payload: { segmentId, text } 
      })
    }, []),
    
    saveWordEdit: useCallback((segmentId: number, wordIndex: number, text: string) => {
      dispatch({ 
        type: 'SAVE_WORD_EDIT', 
        payload: { segmentId, wordIndex, text } 
      })
    }, []),
    
    cancelEditing: useCallback(() => {
      dispatch({ type: 'CANCEL_EDITING' })
    }, []),
    
    setActiveSegment: useCallback((segmentId: number | null) => {
      dispatch({ type: 'SET_ACTIVE_SEGMENT', payload: segmentId })
    }, []),
    
    setActiveWord: useCallback((segmentId: number | null, wordIndex: number | null) => {
      dispatch({ 
        type: 'SET_ACTIVE_WORD', 
        payload: segmentId !== null && wordIndex !== null 
          ? { segmentId, wordIndex } 
          : null 
      })
    }, []),
    
    updateSegment: useCallback((segmentId: number, segment: Partial<TranscriptSegment>) => {
      dispatch({ 
        type: 'UPDATE_SEGMENT', 
        payload: { segmentId, segment } 
      })
    }, []),
    
    updateWord: useCallback((segmentId: number, wordIndex: number, word: Partial<TranscriptWord>) => {
      dispatch({ 
        type: 'UPDATE_WORD', 
        payload: { segmentId, wordIndex, word } 
      })
    }, []),
    
    resetState: useCallback(() => {
      dispatch({ type: 'RESET_STATE' })
    }, []),
  }
  
  return {
    state,
    actions,
  }
}