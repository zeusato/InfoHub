/**
 * Theme Context - Provides shared dark/light mode state
 * Persists preference to localStorage and applies to document
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'infohub_theme'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
    isDark: boolean
    isLight: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Check localStorage first
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored === 'light' || stored === 'dark') {
                return stored
            }
        }
        return 'dark' // Default
    })

    // Apply theme class to document
    useEffect(() => {
        const root = document.documentElement

        if (theme === 'light') {
            root.classList.add('light')
            root.classList.remove('dark')
        } else {
            root.classList.add('dark')
            root.classList.remove('light')
        }

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, theme)
    }, [theme])

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme)
    }, [])

    const toggleTheme = useCallback(() => {
        setThemeState(prev => prev === 'dark' ? 'light' : 'dark')
    }, [])

    const value = {
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light'
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        // Fallback for components outside provider (shouldn't happen)
        console.warn('useTheme must be used within ThemeProvider')
        return {
            theme: 'dark' as Theme,
            setTheme: () => { },
            toggleTheme: () => { },
            isDark: true,
            isLight: false
        }
    }
    return context
}
