/**
 * Theme management utilities
 * Pure functions for theme detection, validation, and storage
 */

export type Theme = 'light' | 'dark'

/**
 * Detects system theme preference
 */
export const detectSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'
  
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  
  return 'light'
}

/**
 * Gets theme from localStorage with fallback to system preference
 */
export const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'
  
  const savedTheme = localStorage.getItem('theme') as Theme
  if (savedTheme && isValidTheme(savedTheme)) {
    return savedTheme
  }
  
  return detectSystemTheme()
}

/**
 * Saves theme to localStorage
 */
export const saveThemeToStorage = (theme: Theme): void => {
  if (typeof window === 'undefined') return
  
  if (isValidTheme(theme)) {
    localStorage.setItem('theme', theme)
  }
}

/**
 * Gets saved theme from localStorage
 */
export const getSavedTheme = (): Theme | null => {
  if (typeof window === 'undefined') return null
  
  const savedTheme = localStorage.getItem('theme') as Theme
  return savedTheme && isValidTheme(savedTheme) ? savedTheme : null
}

/**
 * Validates if a string is a valid theme
 */
export const isValidTheme = (theme: string): theme is Theme => {
  return theme === 'light' || theme === 'dark'
}

/**
 * Toggles between light and dark theme
 */
export const toggleTheme = (currentTheme: Theme): Theme => {
  return currentTheme === 'light' ? 'dark' : 'light'
}

/**
 * Checks if theme is dark
 */
export const isDarkTheme = (theme: Theme): boolean => {
  return theme === 'dark'
}

/**
 * Checks if user has manually set a theme preference
 */
export const hasUserThemePreference = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return localStorage.getItem('theme') !== null
}

/**
 * Clears saved theme preference (will fall back to system)
 */
export const clearSavedTheme = (): void => {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('theme')
}

/**
 * Creates a media query listener for system theme changes
 * Returns cleanup function
 */
export const createSystemThemeListener = (
  callback: (theme: Theme) => void,
  respectUserPreference: boolean = true
): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {} // No-op cleanup for SSR
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleChange = (e: MediaQueryListEvent) => {
    // Only auto-switch if no user preference is saved
    if (!respectUserPreference || !hasUserThemePreference()) {
      callback(e.matches ? 'dark' : 'light')
    }
  }

  mediaQuery.addEventListener('change', handleChange)
  
  // Return cleanup function
  return () => mediaQuery.removeEventListener('change', handleChange)
}