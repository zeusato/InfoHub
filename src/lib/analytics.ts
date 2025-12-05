// src/lib/analytics.ts
import { supabase } from './supabase'

let lastTrackedPath: string | null = null
let trackingTimeout: ReturnType<typeof setTimeout> | null = null

/**
 * Track article view with 3-second debounce
 * Only tracks if user stays on article for at least 3 seconds
 */
export function trackArticleView(articlePath: string, articleId?: string) {
    // Cancel previous pending track
    if (trackingTimeout) {
        clearTimeout(trackingTimeout)
        trackingTimeout = null
    }

    // Skip if same path (already tracked in this session)
    if (lastTrackedPath === articlePath) {
        return
    }

    // Debounce: only track after 3 seconds
    trackingTimeout = setTimeout(async () => {
        try {
            const { error } = await supabase.from('article_views').insert({
                article_path: articlePath,
                article_id: articleId || null,
                user_agent: navigator.userAgent
            })

            if (error) {
                console.error('Failed to track view:', error)
            } else {
                lastTrackedPath = articlePath
            }
        } catch (err) {
            console.error('Analytics error:', err)
        }
    }, 3000) // 3 second debounce
}

/**
 * Get analytics data for CMS dashboard
 */
export async function getAnalyticsSummary() {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [todayRes, weekRes, monthRes] = await Promise.all([
        supabase.from('article_views').select('id', { count: 'exact', head: true }).gte('viewed_at', todayStart),
        supabase.from('article_views').select('id', { count: 'exact', head: true }).gte('viewed_at', weekAgo),
        supabase.from('article_views').select('id', { count: 'exact', head: true }).gte('viewed_at', monthAgo),
    ])

    return {
        today: todayRes.count || 0,
        week: weekRes.count || 0,
        month: monthRes.count || 0,
    }
}

/**
 * Get top articles by views
 */
export async function getTopArticles(limit = 10) {
    // Use raw SQL via RPC or just aggregate client-side
    const { data, error } = await supabase
        .from('article_views')
        .select('article_path')

    if (error || !data) return []

    // Count views per path
    const counts: Record<string, number> = {}
    for (const row of data) {
        counts[row.article_path] = (counts[row.article_path] || 0) + 1
    }

    // Sort and take top N
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([path, views]) => ({ path, views }))
}

/**
 * Get daily views for last N days
 */
export async function getDailyViews(days = 7) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
        .from('article_views')
        .select('viewed_at')
        .gte('viewed_at', startDate)

    if (error || !data) return []

    // Group by date
    const counts: Record<string, number> = {}
    for (const row of data) {
        const date = new Date(row.viewed_at).toISOString().split('T')[0]
        counts[date] = (counts[date] || 0) + 1
    }

    // Fill in missing days with 0
    const result: { date: string; views: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        result.push({ date, views: counts[date] || 0 })
    }

    return result
}
