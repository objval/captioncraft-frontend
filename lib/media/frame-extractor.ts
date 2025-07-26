interface ExtractedFrame {
  timestamp: number
  dataUrl: string
  width: number
  height: number
}

interface FrameExtractionOptions {
  interval?: number // Interval between frames in seconds (default: 1)
  quality?: number // JPEG quality 0-1 (default: 0.8)
  maxWidth?: number // Maximum width for thumbnails (default: 320)
  maxHeight?: number // Maximum height for thumbnails (default: 180)
  onProgress?: (progress: number) => void
}

export class VideoFrameExtractor {
  private video: HTMLVideoElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private frames: Map<number, ExtractedFrame> = new Map()
  private isExtracting = false
  private abortController?: AbortController
  private corsEnabled = false

  constructor(videoElement: HTMLVideoElement) {
    this.video = videoElement
    this.canvas = document.createElement('canvas')
    const ctx = this.canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')
    this.ctx = ctx
    
    // Check if video has crossOrigin attribute set
    this.corsEnabled = this.video.crossOrigin === 'anonymous'
  }

  /**
   * Extract frames from the video at regular intervals
   */
  async extractFrames(options: FrameExtractionOptions = {}): Promise<ExtractedFrame[]> {
    const {
      interval = 1,
      quality = 0.8,
      maxWidth = 320,
      maxHeight = 180,
      onProgress
    } = options

    if (this.isExtracting) {
      throw new Error('Frame extraction already in progress')
    }

    this.isExtracting = true
    this.abortController = new AbortController()
    this.frames.clear()

    try {
      const duration = this.video.duration
      if (!duration || !isFinite(duration)) {
        throw new Error('Invalid video duration')
      }

      const frameCount = Math.ceil(duration / interval)
      const extractedFrames: ExtractedFrame[] = []

      // Calculate thumbnail dimensions maintaining aspect ratio
      const videoAspectRatio = this.video.videoWidth / this.video.videoHeight
      let thumbWidth = maxWidth
      let thumbHeight = maxHeight

      if (videoAspectRatio > maxWidth / maxHeight) {
        thumbHeight = Math.round(maxWidth / videoAspectRatio)
      } else {
        thumbWidth = Math.round(maxHeight * videoAspectRatio)
      }

      this.canvas.width = thumbWidth
      this.canvas.height = thumbHeight

      for (let i = 0; i < frameCount; i++) {
        if (this.abortController.signal.aborted) {
          throw new Error('Frame extraction aborted')
        }

        const timestamp = i * interval
        const frame = await this.extractFrameAtTime(timestamp, quality)
        
        if (frame) {
          this.frames.set(timestamp, frame)
          extractedFrames.push(frame)
        }

        if (onProgress) {
          onProgress((i + 1) / frameCount)
        }
      }

      return extractedFrames
    } finally {
      this.isExtracting = false
      this.abortController = undefined
    }
  }

  /**
   * Extract a single frame at a specific timestamp
   */
  async extractFrameAtTime(timestamp: number, quality = 0.8): Promise<ExtractedFrame | null> {
    return new Promise((resolve, reject) => {
      const seekHandler = () => {
        try {
          // Draw the current frame to canvas
          this.ctx.drawImage(
            this.video,
            0,
            0,
            this.video.videoWidth,
            this.video.videoHeight,
            0,
            0,
            this.canvas.width,
            this.canvas.height
          )

          // Try to convert to data URL
          let dataUrl: string
          try {
            dataUrl = this.canvas.toDataURL('image/jpeg', quality)
          } catch (securityError) {
            // If we get a security error, it's likely due to CORS
            console.warn('Cannot extract frame due to CORS policy. Video must have crossOrigin="anonymous" attribute.')
            // Return null to indicate failure
            resolve(null)
            return
          }

          resolve({
            timestamp,
            dataUrl,
            width: this.canvas.width,
            height: this.canvas.height
          })
        } catch (error) {
          reject(error)
        }

        // Clean up event listener
        this.video.removeEventListener('seeked', seekHandler)
      }

      const errorHandler = (error: Event) => {
        this.video.removeEventListener('seeked', seekHandler)
        this.video.removeEventListener('error', errorHandler)
        reject(new Error('Video seek error'))
      }

      // Set up event listeners
      this.video.addEventListener('seeked', seekHandler, { once: true })
      this.video.addEventListener('error', errorHandler, { once: true })

      // Seek to the desired timestamp
      this.video.currentTime = timestamp
    })
  }

  /**
   * Get a cached frame by timestamp
   */
  getFrame(timestamp: number): ExtractedFrame | undefined {
    return this.frames.get(timestamp)
  }

  /**
   * Get all extracted frames
   */
  getAllFrames(): ExtractedFrame[] {
    return Array.from(this.frames.values()).sort((a, b) => a.timestamp - b.timestamp)
  }

  /**
   * Get frames within a time range
   */
  getFramesInRange(startTime: number, endTime: number): ExtractedFrame[] {
    return this.getAllFrames().filter(
      frame => frame.timestamp >= startTime && frame.timestamp <= endTime
    )
  }

  /**
   * Clear all cached frames
   */
  clearCache(): void {
    this.frames.clear()
  }

  /**
   * Abort ongoing extraction
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort()
    }
  }

  /**
   * Get extraction progress
   */
  get progress(): number {
    if (!this.isExtracting || !this.video.duration) return 0
    const expectedFrames = Math.ceil(this.video.duration)
    return this.frames.size / expectedFrames
  }

  /**
   * Check if extraction is in progress
   */
  get extracting(): boolean {
    return this.isExtracting
  }
}

/**
 * Create a frame extractor instance for a video element
 */
export function createFrameExtractor(videoElement: HTMLVideoElement): VideoFrameExtractor {
  return new VideoFrameExtractor(videoElement)
}