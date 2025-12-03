import { supabase } from '../lib/supabase'
import type { Article, Slide, MenuItem, FAQItem, WorkspaceCard } from '../lib/supabase'

/**
 * React Hook để fetch articles từ Supabase
 * Thay thế cho việc load từ local JSON
 */
export async function fetchArticles(): Promise & lt; Article[] & gt; {
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching articles:', error)
            return []
        }

        return data || []
    } catch (err) {
        console.error('Exception fetching articles:', err)
        return []
    }
}

/**
 * Fetch một article theo path
 */
export async function fetchArticleByPath(path: string): Promise & lt; Article | null & gt; {
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('path', path)
            .single()

        if (error) {
            console.error(`Error fetching article with path ${path}:`, error)
            return null
        }

        return data
    } catch (err) {
        console.error(`Exception fetching article with path ${path}:`, err)
        return null
    }
}

/**
 * Fetch slides cho carousel
 */
export async function fetchSlides(): Promise & lt; Slide[] & gt; {
    try {
        const { data, error } = await supabase
            .from('slides')
            .select('*')
            .eq('active', true)
            .order('slot_number', { ascending: true })

        if (error) {
            console.error('Error fetching slides:', error)
            return []
        }

        return data || []
    } catch (err) {
        console.error('Exception fetching slides:', err)
        return []
    }
}

/**
 * Fetch menu structure
 */
export async function fetchMenuItems(): Promise & lt; MenuItem[] & gt; {
    try {
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('active', true)
            .order('order_index', { ascending: true })

        if (error) {
            console.error('Error fetching menu items:', error)
            return []
        }

        return data || []
    } catch (err) {
        console.error('Exception fetching menu items:', err)
        return []
    }
}

/**
 * Fetch FAQs theo category
 */
export async function fetchFAQs(category: string): Promise & lt; FAQItem[] & gt; {
    try {
        const { data, error } = await supabase
            .from('faq_items')
            .select('*')
            .eq('category', category)
            .eq('active', true)
            .order('order_index', { ascending: true })

        if (error) {
            console.error(`Error fetching FAQs for category ${category}:`, error)
            return []
        }

        return data || []
    } catch (err) {
        console.error(`Exception fetching FAQs for category ${category}:`, err)
        return []
    }
}

/**
 * Fetch workspace cards
 */
export async function fetchWorkspaceCards(): Promise & lt; WorkspaceCard[] & gt; {
    try {
        const { data, error } = await supabase
            .from('workspace_cards')
            .select('*')
            .eq('active', true)

        if (error) {
            console.error('Error fetching workspace cards:', error)
            return []
        }

        return data || []
    } catch (err) {
        console.error('Exception fetching workspace cards:', err)
        return []
    }
}

/**
 * Utility để convert local image paths sang Supabase storage URLs
 */
export function convertToStorageUrl(
    path: string | null | undefined,
    bucket: 'article-images' | 'banner-images' | 'workspace-images' | 'faq-images' = 'article-images'
): string {
    if (!path) return ''

    // Nếu đã là full URL, return nguyên
    if (path.startsWith('http')) return path

    // Get Supabase URL from environment
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

    if (!supabaseUrl) {
        console.warn('VITE_SUPABASE_URL not configured, returning relative path')
        return path
    }

    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path

    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`
}

/**
 * Batch convert multiple paths to storage URLs
 */
export function convertGalleryToStorageUrls(
    gallery: string[] | null | undefined,
    bucket: 'article-images' | 'banner-images' | 'workspace-images' | 'faq-images' = 'article-images'
): string[] {
    if (!gallery || !Array.isArray(gallery)) return []

    return gallery.map(path =& gt; convertToStorageUrl(path, bucket))
}
