// Global event emitter for upload events
class UploadEventEmitter extends EventTarget {
  emitUploadComplete(videoId: string) {
    this.dispatchEvent(new CustomEvent('uploadComplete', { detail: { videoId } }))
  }

  onUploadComplete(callback: (videoId: string) => void) {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ videoId: string }>
      callback(customEvent.detail.videoId)
    }
    this.addEventListener('uploadComplete', handler)
    
    // Return cleanup function
    return () => {
      this.removeEventListener('uploadComplete', handler)
    }
  }
}

export const uploadEvents = new UploadEventEmitter()