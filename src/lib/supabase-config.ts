/**
 * Supabase Configuration Constants
 * Chứa các constants và helpers cho Supabase
 */

// Storage bucket names
export const STORAGE_BUCKETS = {
    ARTICLE_IMAGES: 'article-images',
    BANNER_IMAGES: 'banner-images',
    WORKSPACE_IMAGES: 'workspace-images',
    FAQ_IMAGES: 'faq-images',
} as const

// Table names
export const TABLES = {
    ARTICLES: 'articles',
    SLIDES: 'slides',
    MENU_ITEMS: 'menu_items',
    FAQ_ITEMS: 'faq_items',
    WORKSPACE_CARDS: 'workspace_cards',
    BANNER_LINKS: 'banner_links',
} as const

// Render types cho articles
export const RENDER_TYPES = {
    FEATURE_GUIDE: 'feature-guide',
    HTML: 'html',
    MARKDOWN: 'markdown',
    CUSTOM: 'custom',
} as const

// Template keys
export const TEMPLATE_KEYS = {
    ICON_STEPS: 'icon-steps',
    SIMPLE_GUIDE: 'simple-guide',
    FAQ: 'faq',
    CUSTOM: 'custom',
} as const

/**
 * Helper để validate environment variables
 */
export function validateSupabaseConfig(): { valid: boolean; missing: string[] } {
    const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
    const missing: string[] = []

    for (const key of required) {
        if (!import.meta.env[key]) {
            missing.push(key)
        }
    }

    return {
        valid: missing.length === 0,
        missing,
    }
}

/**
 * Helper để get Supabase URL
 */
export function getSupabaseUrl(): string {
    return import.meta.env.VITE_SUPABASE_URL || ''
}

/**
 * Helper để get Supabase Anon Key
 */
export function getSupabaseAnonKey(): string {
    return import.meta.env.VITE_SUPABASE_ANON_KEY || ''
}

/**
 * Check xem Supabase có được configured hay không
 */
export function isSupabaseConfigured(): boolean {
    return validateSupabaseConfig().valid
}

/**
 * Development mode check
 */
export function isDevMode(): boolean {
    return import.meta.env.DEV
}

/**
 * Get full storage URL cho một bucket và path
 */
export function getStorageUrlForBucket(
    bucket: keyof typeof STORAGE_BUCKETS,
    path: string
): string {
    const bucketName = STORAGE_BUCKETS[bucket]
    const supabaseUrl = getSupabaseUrl()

    if (!supabaseUrl) {
        console.warn('Supabase URL not configured')
        return path
    }

    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path

    return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${cleanPath}`
}
