/**
 * Notification Service for Article Push Notifications
 * Handles fetching notifiable articles and localStorage tracking
 */

import { supabase, Article } from './supabase'

const STORAGE_KEY = 'infohub_notified_articles'
const NOTIFICATION_DAYS = 7 // Only notify for articles within last 7 days

/**
 * Get list of article IDs that have already been notified
 */
export function getNotifiedArticleIds(): string[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

/**
 * Mark an article as notified (save to localStorage)
 */
export function markAsNotified(articleId: string): void {
    const notified = getNotifiedArticleIds()
    if (!notified.includes(articleId)) {
        notified.push(articleId)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notified))
    }
}

/**
 * Mark multiple articles as notified
 */
export function markMultipleAsNotified(articleIds: string[]): void {
    const notified = getNotifiedArticleIds()
    const newNotified = [...new Set([...notified, ...articleIds])]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotified))
}

/**
 * Get articles that need to be notified:
 * - notify_enabled = true
 * - created within last 7 days
 * - not already notified (not in localStorage)
 */
export async function getNotifiableArticles(): Promise<Article[]> {
    const notifiedIds = getNotifiedArticleIds()

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - NOTIFICATION_DAYS)

    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('notify_enabled', true)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching notifiable articles:', error)
        return []
    }

    // Filter out already notified articles
    const unnotified = (data || []).filter(article => !notifiedIds.includes(article.id))

    return unnotified
}
