interface CachedFrame {
  videoId: string
  timestamp: number
  dataUrl: string
  width: number
  height: number
  createdAt: number
}

const DB_NAME = 'video-frame-cache'
const DB_VERSION = 1
const STORE_NAME = 'frames'
const CACHE_EXPIRY_HOURS = 24

export class FrameCache {
  private db: IDBDatabase | null = null
  private memoryCache: Map<string, CachedFrame> = new Map()
  private readonly maxMemoryItems = 100

  /**
   * Initialize the IndexedDB connection
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('videoId', 'videoId', { unique: false })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
        }
      }
    })
  }

  /**
   * Generate a unique cache key
   */
  private getCacheKey(videoId: string, timestamp: number): string {
    return `${videoId}_${timestamp}`
  }

  /**
   * Store a frame in the cache
   */
  async setFrame(
    videoId: string,
    timestamp: number,
    dataUrl: string,
    width: number,
    height: number
  ): Promise<void> {
    const key = this.getCacheKey(videoId, timestamp)
    const frame: CachedFrame = {
      videoId,
      timestamp,
      dataUrl,
      width,
      height,
      createdAt: Date.now()
    }

    // Store in memory cache
    this.memoryCache.set(key, frame)
    this.pruneMemoryCache()

    // Store in IndexedDB
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.put({ ...frame, id: key })

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    }
  }

  /**
   * Get a frame from the cache
   */
  async getFrame(videoId: string, timestamp: number): Promise<CachedFrame | null> {
    const key = this.getCacheKey(videoId, timestamp)

    // Check memory cache first
    const memoryFrame = this.memoryCache.get(key)
    if (memoryFrame) {
      return memoryFrame
    }

    // Check IndexedDB
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.get(key)

        request.onsuccess = () => {
          const frame = request.result
          if (frame && !this.isExpired(frame)) {
            // Add to memory cache
            this.memoryCache.set(key, frame)
            this.pruneMemoryCache()
            resolve(frame)
          } else {
            resolve(null)
          }
        }
        request.onerror = () => reject(request.error)
      })
    }

    return null
  }

  /**
   * Get all frames for a video
   */
  async getVideoFrames(videoId: string): Promise<CachedFrame[]> {
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('videoId')
      const request = index.getAll(videoId)

      request.onsuccess = () => {
        const frames = request.result.filter(frame => !this.isExpired(frame))
        resolve(frames.sort((a, b) => a.timestamp - b.timestamp))
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Clear all frames for a video
   */
  async clearVideoFrames(videoId: string): Promise<void> {
    // Clear from memory cache
    for (const [key, frame] of this.memoryCache.entries()) {
      if (frame.videoId === videoId) {
        this.memoryCache.delete(key)
      }
    }

    // Clear from IndexedDB
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        const index = store.index('videoId')
        const request = index.openCursor(videoId)

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result
          if (cursor) {
            cursor.delete()
            cursor.continue()
          } else {
            resolve()
          }
        }
        request.onerror = () => reject(request.error)
      })
    }
  }

  /**
   * Clear expired frames from the cache
   */
  async clearExpiredFrames(): Promise<void> {
    if (!this.db) return

    const expiryTime = Date.now() - (CACHE_EXPIRY_HOURS * 60 * 60 * 1000)

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('createdAt')
      const request = index.openCursor(IDBKeyRange.upperBound(expiryTime))

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Check if a frame has expired
   */
  private isExpired(frame: CachedFrame): boolean {
    const expiryTime = Date.now() - (CACHE_EXPIRY_HOURS * 60 * 60 * 1000)
    return frame.createdAt < expiryTime
  }

  /**
   * Prune memory cache to maintain size limit
   */
  private pruneMemoryCache(): void {
    if (this.memoryCache.size <= this.maxMemoryItems) return

    // Convert to array and sort by timestamp (oldest first)
    const entries = Array.from(this.memoryCache.entries())
      .sort((a, b) => a[1].createdAt - b[1].createdAt)

    // Remove oldest items
    const itemsToRemove = entries.slice(0, entries.length - this.maxMemoryItems)
    itemsToRemove.forEach(([key]) => this.memoryCache.delete(key))
  }

  /**
   * Clear all cached data
   */
  async clearAll(): Promise<void> {
    this.memoryCache.clear()

    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.clear()

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    }
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
    this.memoryCache.clear()
  }
}

// Singleton instance
let cacheInstance: FrameCache | null = null

/**
 * Get or create the frame cache instance
 */
export async function getFrameCache(): Promise<FrameCache> {
  if (!cacheInstance) {
    cacheInstance = new FrameCache()
    await cacheInstance.init()
  }
  return cacheInstance
}