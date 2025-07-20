import { useState, useCallback, RefObject } from 'react'

export function useVideoControls(videoRef: RefObject<HTMLVideoElement | null>) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  const seekTo = useCallback((time: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = time
  }, [videoRef])

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error)
      })
    }
  }, [isPlaying, videoRef])

  const handleVolumeChange = useCallback((newVolume: number[]) => {
    const vol = newVolume[0]
    setVolume(vol)
    if (videoRef.current) {
      videoRef.current.volume = vol
    }
  }, [videoRef])

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return
    const newMuted = !isMuted
    setIsMuted(newMuted)
    videoRef.current.muted = newMuted
  }, [isMuted, videoRef])

  const skipBackward = useCallback(() => {
    seekTo(Math.max(0, currentTime - 5))
  }, [currentTime, seekTo])

  const skipForward = useCallback(() => {
    seekTo(Math.min(duration, currentTime + 5))
  }, [currentTime, duration, seekTo])

  return {
    // State
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    
    // Controls
    seekTo,
    togglePlayPause,
    handleVolumeChange,
    toggleMute,
    skipBackward,
    skipForward,
  }
}