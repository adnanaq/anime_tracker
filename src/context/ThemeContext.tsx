import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  getInitialTheme, 
  saveThemeToStorage, 
  toggleTheme as toggleThemeUtil,
  isDarkTheme,
  createSystemThemeListener,
  hasUserThemePreference,
  type Theme
} from '../utils/theme'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme())

  const toggleTheme = () => {
    setTheme(prevTheme => toggleThemeUtil(prevTheme))
  }

  const isDark = isDarkTheme(theme)

  useEffect(() => {
    // Save to localStorage
    saveThemeToStorage(theme)
    
    // Apply theme to document
    const root = document.documentElement
    
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme, isDark])

  // Listen for system theme changes
  useEffect(() => {
    const cleanup = createSystemThemeListener((newTheme) => {
      // Only auto-switch if no theme is saved in localStorage
      if (!hasUserThemePreference()) {
        setTheme(newTheme)
      }
    })

    return cleanup
  }, [])

  const value = {
    theme,
    toggleTheme,
    isDark,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}