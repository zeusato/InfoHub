/**
 * Hook to handle article push notifications
 * Fetches notifiable articles and manages toast state
 */

import { useEffect, useState, useCallback } from 'react'
import { Article } from '@/lib/supabase'
import { getNotifiableArticles, markAsNotified } from '@/lib/notificationService'
import { ToastNotification } from '@/components/NotificationToast'

export function useArticleNotifications() {
    const [notifications, setNotifications] = useState<ToastNotification[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Fetch notifiable articles on mount
    useEffect(() => {
        const checkNotifications = async () => {
            setIsLoading(true)
            try {
                const articles = await getNotifiableArticles()

                if (articles.length > 0) {
                    const toasts: ToastNotification[] = articles.map(article => ({
                        id: article.id,
                        article
                    }))
                    setNotifications(toasts)
                }
            } catch (error) {
                console.error('Error checking notifications:', error)
            } finally {
                setIsLoading(false)
            }
        }

        checkNotifications()
    }, [])

    /**
     * Dismiss a notification and mark as notified
     */
    const dismissNotification = useCallback((id: string) => {
        markAsNotified(id)
        setNotifications(prev => prev.filter(n => n.id !== id))
    }, [])

    /**
     * Navigate to article (called when user clicks notification)
     */
    const handleNavigate = useCallback((path: string, setActiveLeaf: (leaf: any) => void) => {
        setActiveLeaf({ id: path, label: path, path })
    }, [])

    return {
        notifications,
        isLoading,
        dismissNotification,
        handleNavigate
    }
}
