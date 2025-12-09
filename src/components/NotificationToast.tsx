/**
 * Custom Toast Notification Component
 * Beautiful animated toast that appears at top-right corner
 */

import { useState, useEffect } from 'react'
import { X, Bell, ChevronRight } from 'lucide-react'
import { Article } from '@/lib/supabase'

export type ToastNotification = {
    id: string
    article: Article
}

type Props = {
    notifications: ToastNotification[]
    onDismiss: (id: string) => void
    onNavigate: (path: string) => void
}

export default function NotificationToast({ notifications, onDismiss, onNavigate }: Props) {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
            {notifications.map((notification, index) => (
                <ToastItem
                    key={notification.id}
                    notification={notification}
                    onDismiss={onDismiss}
                    onNavigate={onNavigate}
                    delay={index * 200}
                />
            ))}
        </div>
    )
}

function ToastItem({
    notification,
    onDismiss,
    onNavigate,
    delay
}: {
    notification: ToastNotification
    onDismiss: (id: string) => void
    onNavigate: (path: string) => void
    delay: number
}) {
    const [isVisible, setIsVisible] = useState(false)
    const [isLeaving, setIsLeaving] = useState(false)

    useEffect(() => {
        // Delay before showing (stagger effect)
        const showTimer = setTimeout(() => {
            setIsVisible(true)
        }, delay)

        // Auto dismiss after 8 seconds
        const dismissTimer = setTimeout(() => {
            handleDismiss()
        }, 8000 + delay)

        return () => {
            clearTimeout(showTimer)
            clearTimeout(dismissTimer)
        }
    }, [delay])

    const handleDismiss = () => {
        setIsLeaving(true)
        setTimeout(() => {
            onDismiss(notification.id)
        }, 300) // Wait for animation
    }

    const handleClick = () => {
        onNavigate(notification.article.path)
        handleDismiss()
    }

    return (
        <div
            className={`
                pointer-events-auto
                w-80 max-w-[calc(100vw-2rem)]
                bg-gradient-to-br from-[#1a1b1e] to-[#0e0f12]
                border border-white/10
                rounded-xl
                shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_-10px_rgba(251,146,60,0.3)]
                overflow-hidden
                cursor-pointer
                transition-all duration-300 ease-out
                ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
                hover:scale-[1.02] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_60px_-10px_rgba(251,146,60,0.5)]
                group
            `}
            onClick={handleClick}
        >
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Top accent line */}
            <div className="h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500" />

            <div className="relative p-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-orange-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-orange-400 uppercase tracking-wider">
                                Bài viết mới
                            </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white line-clamp-2 leading-snug">
                            {notification.article.title}
                        </h4>
                        {notification.article.subtitle && (
                            <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                                {notification.article.subtitle}
                            </p>
                        )}
                    </div>

                    {/* Close button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            handleDismiss()
                        }}
                        className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* CTA */}
                <div className="mt-3 flex items-center justify-end text-xs text-orange-400 group-hover:text-orange-300 transition-colors">
                    <span>Xem ngay</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>

            {/* Progress bar for auto-dismiss */}
            <div className="h-0.5 bg-white/5">
                <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 animate-shrink-width"
                    style={{
                        animationDuration: '8s',
                        animationDelay: `${delay}ms`
                    }}
                />
            </div>
        </div>
    )
}
