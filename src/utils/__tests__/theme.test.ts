import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  detectSystemTheme,
  getInitialTheme,
  saveThemeToStorage,
  getSavedTheme,
  isValidTheme,
  toggleTheme,
  isDarkTheme,
  hasUserThemePreference,
  clearSavedTheme,
  createSystemThemeListener,
  type Theme
} from '../theme'

// Mock window.matchMedia
const mockMatchMedia = vi.fn()
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia
})

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('theme utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.clear()
  })

  describe('detectSystemTheme', () => {
    it('should return dark when system prefers dark', () => {
      mockMatchMedia.mockReturnValue({
        matches: true
      })

      expect(detectSystemTheme()).toBe('dark')
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
    })

    it('should return light when system prefers light', () => {
      mockMatchMedia.mockReturnValue({
        matches: false
      })

      expect(detectSystemTheme()).toBe('light')
    })

    it('should return light when matchMedia is not available', () => {
      // @ts-ignore - temporarily remove matchMedia
      delete window.matchMedia

      expect(detectSystemTheme()).toBe('light')

      // Restore matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia
      })
    })

    it('should return light in SSR environment', () => {
      // Mock SSR environment
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      expect(detectSystemTheme()).toBe('light')

      // Restore window
      global.window = originalWindow
    })
  })

  describe('getInitialTheme', () => {
    it('should return saved theme when valid theme exists in localStorage', () => {
      mockLocalStorage.setItem('theme', 'dark')
      
      expect(getInitialTheme()).toBe('dark')
    })

    it('should return system theme when no saved theme', () => {
      mockMatchMedia.mockReturnValue({ matches: true })
      
      expect(getInitialTheme()).toBe('dark')
    })

    it('should return system theme when saved theme is invalid', () => {
      mockLocalStorage.setItem('theme', 'invalid-theme')
      mockMatchMedia.mockReturnValue({ matches: false })
      
      expect(getInitialTheme()).toBe('light')
    })

    it('should return light in SSR environment', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      expect(getInitialTheme()).toBe('light')

      global.window = originalWindow
    })
  })

  describe('saveThemeToStorage', () => {
    it('should save valid theme to localStorage', () => {
      saveThemeToStorage('dark')
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    })

    it('should save light theme to localStorage', () => {
      saveThemeToStorage('light')
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light')
    })

    it('should not save invalid theme', () => {
      saveThemeToStorage('invalid' as Theme)
      
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })

    it('should handle SSR environment gracefully', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      expect(() => saveThemeToStorage('dark')).not.toThrow()

      global.window = originalWindow
    })
  })

  describe('getSavedTheme', () => {
    it('should return saved valid theme', () => {
      mockLocalStorage.setItem('theme', 'dark')
      
      expect(getSavedTheme()).toBe('dark')
    })

    it('should return null when no theme is saved', () => {
      expect(getSavedTheme()).toBeNull()
    })

    it('should return null when saved theme is invalid', () => {
      mockLocalStorage.setItem('theme', 'invalid-theme')
      
      expect(getSavedTheme()).toBeNull()
    })

    it('should return null in SSR environment', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      expect(getSavedTheme()).toBeNull()

      global.window = originalWindow
    })
  })

  describe('isValidTheme', () => {
    it('should return true for light theme', () => {
      expect(isValidTheme('light')).toBe(true)
    })

    it('should return true for dark theme', () => {
      expect(isValidTheme('dark')).toBe(true)
    })

    it('should return false for invalid theme', () => {
      expect(isValidTheme('invalid')).toBe(false)
      expect(isValidTheme('')).toBe(false)
      expect(isValidTheme('auto')).toBe(false)
    })
  })

  describe('toggleTheme', () => {
    it('should toggle light to dark', () => {
      expect(toggleTheme('light')).toBe('dark')
    })

    it('should toggle dark to light', () => {
      expect(toggleTheme('dark')).toBe('light')
    })
  })

  describe('isDarkTheme', () => {
    it('should return true for dark theme', () => {
      expect(isDarkTheme('dark')).toBe(true)
    })

    it('should return false for light theme', () => {
      expect(isDarkTheme('light')).toBe(false)
    })
  })

  describe('hasUserThemePreference', () => {
    it('should return true when theme is saved', () => {
      mockLocalStorage.setItem('theme', 'dark')
      
      expect(hasUserThemePreference()).toBe(true)
    })

    it('should return false when no theme is saved', () => {
      expect(hasUserThemePreference()).toBe(false)
    })

    it('should return false in SSR environment', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      expect(hasUserThemePreference()).toBe(false)

      global.window = originalWindow
    })
  })

  describe('clearSavedTheme', () => {
    it('should remove theme from localStorage', () => {
      mockLocalStorage.setItem('theme', 'dark')
      clearSavedTheme()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('theme')
    })

    it('should handle SSR environment gracefully', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      expect(() => clearSavedTheme()).not.toThrow()

      global.window = originalWindow
    })
  })

  describe('createSystemThemeListener', () => {
    let mockMediaQuery: any

    beforeEach(() => {
      mockMediaQuery = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        matches: false
      }
      mockMatchMedia.mockReturnValue(mockMediaQuery)
    })

    it('should create media query listener', () => {
      const callback = vi.fn()
      
      createSystemThemeListener(callback)
      
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('should return cleanup function', () => {
      const callback = vi.fn()
      
      const cleanup = createSystemThemeListener(callback)
      cleanup()
      
      expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('should call callback with dark theme when system changes to dark', () => {
      const callback = vi.fn()
      
      createSystemThemeListener(callback, false) // Don't respect user preference
      
      // Simulate media query change
      const changeHandler = mockMediaQuery.addEventListener.mock.calls[0][1]
      changeHandler({ matches: true })
      
      expect(callback).toHaveBeenCalledWith('dark')
    })

    it('should call callback with light theme when system changes to light', () => {
      const callback = vi.fn()
      
      createSystemThemeListener(callback, false)
      
      const changeHandler = mockMediaQuery.addEventListener.mock.calls[0][1]
      changeHandler({ matches: false })
      
      expect(callback).toHaveBeenCalledWith('light')
    })

    it('should not call callback when user preference exists and respectUserPreference is true', () => {
      const callback = vi.fn()
      mockLocalStorage.setItem('theme', 'light')
      
      createSystemThemeListener(callback, true)
      
      const changeHandler = mockMediaQuery.addEventListener.mock.calls[0][1]
      changeHandler({ matches: true })
      
      expect(callback).not.toHaveBeenCalled()
    })

    it('should call callback when user preference exists but respectUserPreference is false', () => {
      const callback = vi.fn()
      mockLocalStorage.setItem('theme', 'light')
      
      createSystemThemeListener(callback, false)
      
      const changeHandler = mockMediaQuery.addEventListener.mock.calls[0][1]
      changeHandler({ matches: true })
      
      expect(callback).toHaveBeenCalledWith('dark')
    })

    it('should call callback when no user preference exists', () => {
      const callback = vi.fn()
      
      createSystemThemeListener(callback, true)
      
      const changeHandler = mockMediaQuery.addEventListener.mock.calls[0][1]
      changeHandler({ matches: true })
      
      expect(callback).toHaveBeenCalledWith('dark')
    })

    it('should return no-op cleanup function in SSR environment', () => {
      // Mock SSR environment by removing window
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      const callback = vi.fn()
      const cleanup = createSystemThemeListener(callback)
      
      // Should return a function that does nothing
      expect(typeof cleanup).toBe('function')
      cleanup() // Should not throw

      // Restore window
      global.window = originalWindow
    })
  })
})