import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  debounce,
  createDebouncedFunction,
  createTimeoutManager,
  createDebouncedValue,
  throttle,
  debounceLeadingTrailing
} from '../debounce'

// Mock timers
vi.useFakeTimers()

describe('debounce utilities', () => {
  beforeEach(() => {
    vi.clearAllTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.useFakeTimers()
  })

  describe('debounce', () => {
    it('should delay function execution', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('test')
      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledWith('test')
    })

    it('should cancel previous calls when called again', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('first')
      vi.advanceTimersByTime(50)
      debouncedFn('second')
      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('second')
    })

    it('should handle multiple arguments', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1', 'arg2', 'arg3')
      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
    })

    it('should handle zero delay', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 0)

      debouncedFn('test')
      vi.advanceTimersByTime(0)

      expect(mockFn).toHaveBeenCalledWith('test')
    })
  })

  describe('createDebouncedFunction', () => {
    it('should create debounced function with cleanup', () => {
      const mockFn = vi.fn()
      const { debouncedFn, cleanup, pending } = createDebouncedFunction(mockFn, 100)

      debouncedFn('test')
      expect(pending()).toBe(true)
      expect(mockFn).not.toHaveBeenCalled()

      cleanup()
      expect(pending()).toBe(false)
      vi.advanceTimersByTime(100)
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('should track pending state correctly', () => {
      const mockFn = vi.fn()
      const { debouncedFn, pending } = createDebouncedFunction(mockFn, 100)

      expect(pending()).toBe(false)
      
      debouncedFn('test')
      expect(pending()).toBe(true)
      
      vi.advanceTimersByTime(100)
      expect(pending()).toBe(false)
      expect(mockFn).toHaveBeenCalled()
    })

    it('should handle multiple calls before execution', () => {
      const mockFn = vi.fn()
      const { debouncedFn, pending } = createDebouncedFunction(mockFn, 100)

      debouncedFn('first')
      expect(pending()).toBe(true)
      
      debouncedFn('second')
      expect(pending()).toBe(true)
      
      vi.advanceTimersByTime(100)
      expect(pending()).toBe(false)
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('second')
    })
  })

  describe('createTimeoutManager', () => {
    it('should manage multiple timeouts', () => {
      const manager = createTimeoutManager()
      const mockFn1 = vi.fn()
      const mockFn2 = vi.fn()

      manager.setTimeout('timer1', mockFn1, 100)
      manager.setTimeout('timer2', mockFn2, 200)

      expect(manager.size()).toBe(2)
      expect(manager.pending()).toBe(true)
      expect(manager.has('timer1')).toBe(true)
      expect(manager.has('timer2')).toBe(true)

      vi.advanceTimersByTime(100)
      expect(mockFn1).toHaveBeenCalled()
      expect(manager.size()).toBe(1)
      expect(manager.has('timer1')).toBe(false)

      vi.advanceTimersByTime(100)
      expect(mockFn2).toHaveBeenCalled()
      expect(manager.size()).toBe(0)
      expect(manager.pending()).toBe(false)
    })

    it('should clear specific timeout', () => {
      const manager = createTimeoutManager()
      const mockFn = vi.fn()

      manager.setTimeout('timer1', mockFn, 100)
      expect(manager.has('timer1')).toBe(true)

      manager.clearTimeout('timer1')
      expect(manager.has('timer1')).toBe(false)
      expect(manager.size()).toBe(0)

      vi.advanceTimersByTime(100)
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('should clear all timeouts', () => {
      const manager = createTimeoutManager()
      const mockFn1 = vi.fn()
      const mockFn2 = vi.fn()

      manager.setTimeout('timer1', mockFn1, 100)
      manager.setTimeout('timer2', mockFn2, 200)
      expect(manager.size()).toBe(2)

      manager.clearAll()
      expect(manager.size()).toBe(0)
      expect(manager.pending()).toBe(false)

      vi.advanceTimersByTime(300)
      expect(mockFn1).not.toHaveBeenCalled()
      expect(mockFn2).not.toHaveBeenCalled()
    })

    it('should replace existing timeout with same key', () => {
      const manager = createTimeoutManager()
      const mockFn1 = vi.fn()
      const mockFn2 = vi.fn()

      manager.setTimeout('timer1', mockFn1, 100)
      manager.setTimeout('timer1', mockFn2, 200) // Replace previous

      expect(manager.size()).toBe(1)
      
      vi.advanceTimersByTime(100)
      expect(mockFn1).not.toHaveBeenCalled()
      expect(mockFn2).not.toHaveBeenCalled()
      
      vi.advanceTimersByTime(100)
      expect(mockFn1).not.toHaveBeenCalled()
      expect(mockFn2).toHaveBeenCalled()
    })
  })

  describe('createDebouncedValue', () => {
    it('should debounce value changes', () => {
      const onChange = vi.fn()
      const debouncedValue = createDebouncedValue('initial', 100, onChange)

      expect(debouncedValue.getValue()).toBe('initial')
      expect(debouncedValue.getDebouncedValue()).toBe('initial')

      debouncedValue.setValue('new value')
      expect(debouncedValue.getValue()).toBe('new value')
      expect(debouncedValue.getDebouncedValue()).toBe('initial') // Not debounced yet
      expect(onChange).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(debouncedValue.getDebouncedValue()).toBe('new value')
      expect(onChange).toHaveBeenCalledWith('new value')
    })

    it('should handle flush correctly', () => {
      const onChange = vi.fn()
      const debouncedValue = createDebouncedValue('initial', 100, onChange)

      debouncedValue.setValue('flushed')
      expect(debouncedValue.pending()).toBe(true)

      debouncedValue.flush()
      expect(debouncedValue.pending()).toBe(false)
      expect(debouncedValue.getDebouncedValue()).toBe('flushed')
      expect(onChange).toHaveBeenCalledWith('flushed')
    })

    it('should handle cleanup correctly', () => {
      const onChange = vi.fn()
      const debouncedValue = createDebouncedValue('initial', 100, onChange)

      debouncedValue.setValue('cleaned')
      expect(debouncedValue.pending()).toBe(true)

      debouncedValue.cleanup()
      expect(debouncedValue.pending()).toBe(false)

      vi.advanceTimersByTime(100)
      expect(onChange).not.toHaveBeenCalled()
      expect(debouncedValue.getDebouncedValue()).toBe('initial')
    })
  })

  describe('throttle', () => {
    it('should throttle function execution', () => {
      const mockFn = vi.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn('call1')
      expect(mockFn).toHaveBeenCalledWith('call1') // First call executes immediately

      throttledFn('call2')
      throttledFn('call3')
      expect(mockFn).toHaveBeenCalledTimes(1) // Subsequent calls are throttled

      vi.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(2) // One more call after throttle period
      expect(mockFn).toHaveBeenLastCalledWith('call2') // Second call scheduled, not last
    })

    it('should allow execution after throttle period', () => {
      const mockFn = vi.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn('call1')
      expect(mockFn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      throttledFn('call2')
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('call2')
    })
  })

  describe('debounceLeadingTrailing', () => {
    it('should execute immediately on first call', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounceLeadingTrailing(mockFn, 100)

      debouncedFn('first')
      expect(mockFn).toHaveBeenCalledWith('first') // Immediate execution (leading)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should debounce subsequent calls', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounceLeadingTrailing(mockFn, 100)

      debouncedFn('first')
      debouncedFn('second')
      debouncedFn('third')

      expect(mockFn).toHaveBeenCalledTimes(1) // Only leading call

      vi.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(2) // Trailing call
      expect(mockFn).toHaveBeenLastCalledWith('third')
    })

    it('should allow immediate execution after wait period', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounceLeadingTrailing(mockFn, 100)

      debouncedFn('first')
      expect(mockFn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(2) // Trailing call executes

      // Advance timer a bit more to ensure enough time passed since trailing execution
      vi.advanceTimersByTime(101) // Total 201ms, ensuring >=100ms since last execution
      debouncedFn('second')
      expect(mockFn).toHaveBeenCalledTimes(3) // Should execute immediately
      expect(mockFn).toHaveBeenLastCalledWith('second')
    })
  })
})