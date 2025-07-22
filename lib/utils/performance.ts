/**
 * Performance optimization utilities and hooks
 */

import { useCallback, useMemo, useRef, useEffect } from "react"

/**
 * Throttle hook for limiting function calls
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0)
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall.current >= delay) {
      lastCall.current = now
      return callback(...args)
    }
  }, [callback, delay]) as T
}

/**
 * Memoized expensive computation hook
 */
export function useExpensiveMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(() => {
    const start = performance.now()
    const result = factory()
    const end = performance.now()
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Expensive computation took ${end - start}ms`)
    }
    
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const isIntersecting = useRef(false)
  const observer = useRef<IntersectionObserver | null>(null)
  
  useEffect(() => {
    if (!elementRef.current) return
    
    observer.current = new IntersectionObserver(([entry]) => {
      isIntersecting.current = entry.isIntersecting
    }, options)
    
    observer.current.observe(elementRef.current)
    
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [elementRef, options])
  
  return isIntersecting.current
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map()
  
  static mark(name: string): void {
    this.marks.set(name, performance.now())
  }
  
  static measure(name: string, startMark: string): number {
    const start = this.marks.get(startMark)
    if (!start) {
      console.warn(`Start mark "${startMark}" not found`)
      return 0
    }
    
    const duration = performance.now() - start
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name}: ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }
  
  static clear(): void {
    this.marks.clear()
  }
}

/**
 * Image optimization utilities
 */
export const ImageOptimizer = {
  getCloudinaryUrl(publicId: string, options: {
    width?: number
    height?: number
    quality?: 'auto' | number
    format?: 'auto' | 'webp' | 'avif'
    crop?: 'fill' | 'fit' | 'scale'
  } = {}): string {
    const {
      width,
      height,
      quality = 'auto',
      format = 'auto',
      crop = 'fill'
    } = options
    
    const transformations = []
    
    if (width || height) {
      transformations.push(`c_${crop}`)
      if (width) transformations.push(`w_${width}`)
      if (height) transformations.push(`h_${height}`)
    }
    
    transformations.push(`f_${format}`)
    transformations.push(`q_${quality}`)
    
    return `https://res.cloudinary.com/your-cloud/image/upload/${transformations.join(',')}/${publicId}`
  },
  
  getVideoUrl(publicId: string, options: {
    width?: number
    height?: number
    quality?: 'auto' | number
    format?: 'auto' | 'mp4' | 'webm'
  } = {}): string {
    const {
      width,
      height,
      quality = 'auto',
      format = 'auto'
    } = options
    
    const transformations = []
    
    if (width || height) {
      transformations.push('c_scale')
      if (width) transformations.push(`w_${width}`)
      if (height) transformations.push(`h_${height}`)
    }
    
    transformations.push(`f_${format}`)
    transformations.push(`q_${quality}`)
    
    return `https://res.cloudinary.com/your-cloud/video/upload/${transformations.join(',')}/${publicId}`
  }
}

/**
 * Bundle optimization utilities
 */
export const BundleOptimizer = {
  /**
   * Dynamic import with loading state
   */
  async loadComponent<T>(
    importFn: () => Promise<{ default: T }>,
    onLoading?: (loading: boolean) => void
  ): Promise<T> {
    try {
      onLoading?.(true)
      const importedModule = await importFn()
      return importedModule.default
    } finally {
      onLoading?.(false)
    }
  },
  
  /**
   * Preload critical resources
   */
  preloadResource(href: string, as: 'script' | 'style' | 'font' | 'image'): void {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    
    if (as === 'font') {
      link.crossOrigin = 'anonymous'
    }
    
    document.head.appendChild(link)
  }
}
