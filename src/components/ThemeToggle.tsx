/**
 * Theme Toggle Button Component
 * Animated sun/moon icon for switching between dark and light mode
 */

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

type Props = {
    className?: string
}

export default function ThemeToggle({ className = '' }: Props) {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <button
            onClick={toggleTheme}
            className={`
                relative w-10 h-10 rounded-lg
                bg-[var(--bg-glass)] hover:bg-[var(--bg-glass-hover)]
                border border-[var(--border-color)]
                flex items-center justify-center
                transition-all duration-300 ease-out
                group
                ${className}
            `}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
        >
            {/* Sun icon */}
            <Sun
                className={`
                    w-5 h-5 text-amber-400
                    absolute transition-all duration-300
                    ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
                `}
            />

            {/* Moon icon */}
            <Moon
                className={`
                    w-5 h-5 text-blue-300
                    absolute transition-all duration-300
                    ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
                `}
            />

            {/* Glow effect on hover */}
            <div className={`
                absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300
                ${isDark ? 'bg-blue-400/10' : 'bg-amber-400/10'}
            `} />
        </button>
    )
}
