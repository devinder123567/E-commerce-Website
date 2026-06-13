import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<Theme>('dark')

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.add('dark')
    root.classList.remove('light')
    try {
      localStorage.setItem('theme', 'dark')
    } catch (e) {
      console.warn('[Theme] localStorage write failed:', e)
    }
  }, [])

  const toggleTheme = () => {
    // Disabled - theme is permanently dark mode
  }

  const setTheme = (newTheme: Theme) => {
    // Disabled - theme is permanently dark mode
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
