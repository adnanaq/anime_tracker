import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createDebouncedFunction } from '../../../utils/debounce'

describe('AnimeCard Debounce Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should create debounced function for mouse leave animation with 100ms delay', () => {
    const mockAnimationFn = vi.fn()
    const { debouncedFn } = createDebouncedFunction(mockAnimationFn, 100)

    // Call the debounced function (simulating mouse leave)
    debouncedFn()
    
    // Should not be called immediately
    expect(mockAnimationFn).not.toHaveBeenCalled()
    
    // Fast-forward time by 99ms (just under the delay)
    vi.advanceTimersByTime(99)
    expect(mockAnimationFn).not.toHaveBeenCalled()
    
    // Fast-forward by 1ms more (completing the 100ms delay)
    vi.advanceTimersByTime(1)
    expect(mockAnimationFn).toHaveBeenCalledTimes(1)
  })

  it('should cancel animation when mouse re-enters quickly', () => {
    const mockAnimationFn = vi.fn()
    const { debouncedFn, cleanup } = createDebouncedFunction(mockAnimationFn, 100)

    // Mouse leaves (start debounce)
    debouncedFn()
    
    // Fast-forward 50ms
    vi.advanceTimersByTime(50)
    expect(mockAnimationFn).not.toHaveBeenCalled()
    
    // Mouse enters again (should cancel the pending animation)
    cleanup()
    
    // Fast-forward the remaining time
    vi.advanceTimersByTime(50)
    
    // Animation should not have been called
    expect(mockAnimationFn).not.toHaveBeenCalled()
  })

  it('should handle rapid mouse enter/leave cycles', () => {
    const mockAnimationFn = vi.fn()
    const { debouncedFn, cleanup } = createDebouncedFunction(mockAnimationFn, 100)

    // Simulate rapid mouse movements
    debouncedFn() // Mouse leave
    vi.advanceTimersByTime(30)
    
    cleanup() // Mouse enter (cancel)
    debouncedFn() // Mouse leave again
    vi.advanceTimersByTime(30)
    
    cleanup() // Mouse enter (cancel)
    debouncedFn() // Mouse leave again
    vi.advanceTimersByTime(30)
    
    // No animation should have been called yet
    expect(mockAnimationFn).not.toHaveBeenCalled()
    
    // Fast-forward the full delay
    vi.advanceTimersByTime(100)
    
    // Only the last mouse leave should trigger animation
    expect(mockAnimationFn).toHaveBeenCalledTimes(1)
  })

  it('should simulate AnimeCard hover behavior', () => {
    const mockMouseLeaveAnimation = vi.fn()
    
    // Create debounced function like AnimeCard does
    const { debouncedFn: debouncedMouseLeave, cleanup: cleanupHoverDebounce } = createDebouncedFunction(
      mockMouseLeaveAnimation,
      100
    )

    // Simulate mouse enter (should cancel any pending leave animation)
    cleanupHoverDebounce()
    
    // Simulate mouse leave
    debouncedMouseLeave()
    
    // Should not animate immediately
    expect(mockMouseLeaveAnimation).not.toHaveBeenCalled()
    
    // Fast-forward time
    vi.advanceTimersByTime(100)
    
    // Should trigger leave animation
    expect(mockMouseLeaveAnimation).toHaveBeenCalledTimes(1)
  })

  it('should cleanup properly on component unmount', () => {
    const mockAnimationFn = vi.fn()
    const { debouncedFn, cleanup } = createDebouncedFunction(mockAnimationFn, 100)

    // Start a debounce
    debouncedFn()
    
    // Simulate component unmount
    cleanup()
    
    // Fast-forward time
    vi.advanceTimersByTime(100)
    
    // Function should not have been called
    expect(mockAnimationFn).not.toHaveBeenCalled()
  })

  it('should handle multiple sequential mouse leaves correctly', () => {
    const mockAnimationFn = vi.fn()
    const { debouncedFn } = createDebouncedFunction(mockAnimationFn, 100)

    // First mouse leave
    debouncedFn()
    vi.advanceTimersByTime(100)
    expect(mockAnimationFn).toHaveBeenCalledTimes(1)
    
    // Second mouse leave (after animation completed)
    debouncedFn()
    vi.advanceTimersByTime(100)
    expect(mockAnimationFn).toHaveBeenCalledTimes(2)
    
    // Third mouse leave
    debouncedFn()
    vi.advanceTimersByTime(100)
    expect(mockAnimationFn).toHaveBeenCalledTimes(3)
  })
})