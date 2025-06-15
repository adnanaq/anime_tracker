/**
 * Debounce utilities
 * Functions for debouncing user input and API calls
 */

/**
 * Creates a debounced function that delays execution until after wait milliseconds
 * have elapsed since the last time it was invoked
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, wait)
  }
}

/**
 * Creates a debounced function with cleanup capability
 * Returns both the debounced function and a cleanup function
 */
export const createDebouncedFunction = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): {
  debouncedFn: (...args: Parameters<T>) => void
  cleanup: () => void
  pending: () => boolean
} => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, wait)
  }
  
  const cleanup = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
  
  const pending = () => timeoutId !== null
  
  return { debouncedFn, cleanup, pending }
}

/**
 * Creates a timeout manager for handling multiple timeouts
 */
export const createTimeoutManager = () => {
  const timeouts = new Map<string, ReturnType<typeof setTimeout>>()
  
  const setTimeoutForKey = (key: string, callback: () => void, delay: number) => {
    // Clear existing timeout for this key
    clearTimeoutForKey(key)
    
    // Set new timeout
    const timeoutId = window.setTimeout(() => {
      callback()
      timeouts.delete(key)
    }, delay)
    
    timeouts.set(key, timeoutId)
  }
  
  const clearTimeoutForKey = (key: string) => {
    const timeoutId = timeouts.get(key)
    if (timeoutId) {
      window.clearTimeout(timeoutId)
      timeouts.delete(key)
    }
  }
  
  const clearAll = () => {
    timeouts.forEach(timeoutId => window.clearTimeout(timeoutId))
    timeouts.clear()
  }
  
  const has = (key: string) => timeouts.has(key)
  
  const pending = () => timeouts.size > 0
  
  return {
    setTimeout: setTimeoutForKey,
    clearTimeout: clearTimeoutForKey,
    clearAll,
    has,
    pending,
    size: () => timeouts.size
  }
}

/**
 * Creates a debounced value hook-like function
 * Useful for debouncing state updates
 */
export const createDebouncedValue = <T>(
  initialValue: T,
  delay: number,
  onChange?: (value: T) => void
) => {
  let currentValue = initialValue
  let debouncedValue = initialValue
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  const setValue = (newValue: T) => {
    currentValue = newValue
    
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      debouncedValue = currentValue
      onChange?.(debouncedValue)
      timeoutId = null
    }, delay)
  }
  
  const getValue = () => currentValue
  const getDebouncedValue = () => debouncedValue
  
  const cleanup = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
  
  const flush = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      debouncedValue = currentValue
      onChange?.(debouncedValue)
      timeoutId = null
    }
  }
  
  const pending = () => timeoutId !== null
  
  return {
    setValue,
    getValue,
    getDebouncedValue,
    cleanup,
    flush,
    pending
  }
}

/**
 * Throttles function execution to at most once per specified time period
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let lastExecuted = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastExecuted >= wait) {
      // Execute immediately
      func(...args)
      lastExecuted = now
    } else if (timeoutId === null) {
      // Schedule execution
      const remaining = wait - (now - lastExecuted)
      timeoutId = setTimeout(() => {
        func(...args)
        lastExecuted = Date.now()
        timeoutId = null
      }, remaining)
    }
  }
}

/**
 * Creates a leading and trailing debounce
 * Executes immediately on first call, then debounces subsequent calls
 */
export const debounceLeadingTrailing = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastExecuted = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    
    // Execute immediately if enough time has passed
    if (now - lastExecuted >= wait) {
      func(...args)
      lastExecuted = now
    }
    
    // Clear existing timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    
    // Set trailing timeout
    timeoutId = setTimeout(() => {
      func(...args)
      lastExecuted = Date.now()
      timeoutId = null
    }, wait)
  }
}