import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fadeIn,
  slideInFromLeft,
  scaleIn,
  bounceIn,
  hoverScale,
  resetHover,
  staggerChildren,
  slideInFromTop
} from '../animations'

// Mock timers
vi.useFakeTimers()

describe('animation utilities', () => {
  let mockElement: HTMLElement

  beforeEach(() => {
    // Create a mock DOM element
    mockElement = {
      style: {} as CSSStyleDeclaration
    } as HTMLElement

    // Mock setTimeout to track calls
    vi.clearAllTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.useFakeTimers()
  })

  describe('fadeIn', () => {
    it('should animate element fade in with default values', () => {
      fadeIn(mockElement)

      // Initial state
      expect(mockElement.style.opacity).toBe('0')
      expect(mockElement.style.transform).toBe('translateY(20px)')
      expect(mockElement.style.transition).toBe('opacity 300ms ease-out 0ms, transform 300ms ease-out 0ms')

      // After animation trigger
      vi.advanceTimersByTime(50)
      expect(mockElement.style.opacity).toBe('1')
      expect(mockElement.style.transform).toBe('translateY(0)')
    })

    it('should handle custom duration and delay', () => {
      fadeIn(mockElement, 500, 100)

      expect(mockElement.style.transition).toBe('opacity 500ms ease-out 100ms, transform 500ms ease-out 100ms')
    })

    it('should handle null element gracefully', () => {
      expect(() => fadeIn(null as any)).not.toThrow()
    })

    it('should handle undefined element gracefully', () => {
      expect(() => fadeIn(undefined as any)).not.toThrow()
    })
  })

  describe('slideInFromLeft', () => {
    it('should animate element slide in from left', () => {
      slideInFromLeft(mockElement)

      expect(mockElement.style.opacity).toBe('0')
      expect(mockElement.style.transform).toBe('translateX(-50px)')
      expect(mockElement.style.transition).toBe('opacity 400ms ease-out 0ms, transform 400ms ease-out 0ms')

      vi.advanceTimersByTime(50)
      expect(mockElement.style.opacity).toBe('1')
      expect(mockElement.style.transform).toBe('translateX(0)')
    })

    it('should handle custom parameters', () => {
      slideInFromLeft(mockElement, 600, 200)

      expect(mockElement.style.transition).toBe('opacity 600ms ease-out 200ms, transform 600ms ease-out 200ms')
    })

    it('should handle null element gracefully', () => {
      expect(() => slideInFromLeft(null as any)).not.toThrow()
    })
  })

  describe('scaleIn', () => {
    it('should animate element scale in', () => {
      scaleIn(mockElement)

      expect(mockElement.style.opacity).toBe('0')
      expect(mockElement.style.transform).toBe('scale(0.8)')
      expect(mockElement.style.transition).toBe('opacity 500ms ease-out 0ms, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 0ms')

      vi.advanceTimersByTime(50)
      expect(mockElement.style.opacity).toBe('1')
      expect(mockElement.style.transform).toBe('scale(1)')
    })

    it('should handle null element gracefully', () => {
      expect(() => scaleIn(null as any)).not.toThrow()
    })
  })

  describe('bounceIn', () => {
    it('should animate element bounce in', () => {
      bounceIn(mockElement)

      expect(mockElement.style.opacity).toBe('0')
      expect(mockElement.style.transform).toBe('scale(0)')
      expect(mockElement.style.transition).toBe('opacity 600ms ease-out 0ms, transform 600ms cubic-bezier(0.68, -0.55, 0.265, 1.55) 0ms')

      vi.advanceTimersByTime(50)
      expect(mockElement.style.opacity).toBe('1')
      expect(mockElement.style.transform).toBe('scale(1)')
    })

    it('should handle null element gracefully', () => {
      expect(() => bounceIn(null as any)).not.toThrow()
    })
  })

  describe('hoverScale', () => {
    it('should apply hover scale effect', () => {
      hoverScale(mockElement)

      expect(mockElement.style.transition).toBe('transform 300ms ease-out, box-shadow 300ms ease-out')
      expect(mockElement.style.transform).toBe('scale(1.05) translateY(-8px)')
      expect(mockElement.style.boxShadow).toBe('0 20px 40px rgba(0,0,0,0.2)')
    })

    it('should handle custom scale value', () => {
      hoverScale(mockElement, 1.1)

      expect(mockElement.style.transform).toBe('scale(1.1) translateY(-8px)')
    })

    it('should handle null element gracefully', () => {
      expect(() => hoverScale(null as any)).not.toThrow()
    })
  })

  describe('resetHover', () => {
    it('should reset hover effect', () => {
      resetHover(mockElement)

      expect(mockElement.style.transform).toBe('scale(1) translateY(0)')
      expect(mockElement.style.boxShadow).toBe('0 4px 6px rgba(0,0,0,0.1)')
    })

    it('should handle null element gracefully', () => {
      expect(() => resetHover(null as any)).not.toThrow()
    })
  })

  describe('slideInFromTop', () => {
    it('should animate element slide in from top', () => {
      slideInFromTop(mockElement)

      expect(mockElement.style.opacity).toBe('0')
      expect(mockElement.style.transform).toBe('translateY(-30px)')
      expect(mockElement.style.transition).toBe('opacity 600ms ease-out 0ms, transform 600ms ease-out 0ms')

      vi.advanceTimersByTime(50)
      expect(mockElement.style.opacity).toBe('1')
      expect(mockElement.style.transform).toBe('translateY(0)')
    })

    it('should handle null element gracefully', () => {
      expect(() => slideInFromTop(null as any)).not.toThrow()
    })
  })

  describe('staggerChildren', () => {
    it('should animate children with stagger effect', () => {
      const mockChild1 = { style: {} } as HTMLElement
      const mockChild2 = { style: {} } as HTMLElement
      
      // Mock container with children
      const mockContainer = {
        children: [mockChild1, mockChild2]
      } as HTMLElement

      staggerChildren(mockContainer)

      // Check initial state of children
      expect(mockChild1.style.opacity).toBe('0')
      expect(mockChild1.style.transform).toBe('translateY(30px)')
      expect(mockChild1.style.transition).toBe('opacity 400ms ease-out, transform 400ms ease-out')
      
      expect(mockChild2.style.opacity).toBe('0')
      expect(mockChild2.style.transform).toBe('translateY(30px)')
      expect(mockChild2.style.transition).toBe('opacity 400ms ease-out, transform 400ms ease-out')

      // Check first child animation
      vi.advanceTimersByTime(50)
      expect(mockChild1.style.opacity).toBe('1')
      expect(mockChild1.style.transform).toBe('translateY(0)')

      // Check second child animation (after stagger delay)
      vi.advanceTimersByTime(100)
      expect(mockChild2.style.opacity).toBe('1')
      expect(mockChild2.style.transform).toBe('translateY(0)')
    })

    it('should handle null element gracefully', () => {
      expect(() => staggerChildren(null as any)).not.toThrow()
    })
  })
})