import { useCallback, useState } from 'react'

// Debounce hook
export function useDebounce(callback: Function, delay: number) {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>()

  const debouncedCallback = useCallback(
    (...args: any[]) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      const newTimer = setTimeout(() => {
        callback(...args)
      }, delay)

      setDebounceTimer(newTimer)
    },
    [callback, delay, debounceTimer],
  )

  return debouncedCallback
}