import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get storage URL
export function getStorageUrl(path: string | null | undefined): string {
    if (!path) return ''
    // Already full URL
    if (path.startsWith('http')) return path
    // Relative path - convert to full URL
    return `${supabaseUrl}/storage/v1/object/public/infohub-images/${path}`
}

// Types
export interface Article {
    id: string
    path: string
    title: string
    subtitle?: string
    render_type: string
    template_key: string
    banner_img?: string
    content?: any
    content_html?: string
    ending_note?: string
    gallery?: string[]
    faq_json_path?: string
    video_url?: string
    created_at: string
    updated_at: string
}

export interface Slide {
    id: string
    slot_number: number
    title: string
    image_url: string
    link_url?: string
    active: boolean
    created_at: string
    updated_at: string
}

export interface MenuItem {
    id: string
    label: string
    icon?: string
    path?: string
    parent_id?: string
    order_index: number
    level: number
    active: boolean
    created_at: string
}

export interface FAQItem {
    id: string
    category: string
    question: string
    answer: string
    order_index: number
    active: boolean
    created_at: string
}

export interface WorkspaceCard {
    id: string
    card_key: 'sh_smart' | 'sh_advisor'
    title: string
    button_text: string
    button_url: string
    qr_image_url: string
    gradient_from: string
    gradient_to: string
    active: boolean
    created_at: string
    updated_at: string
}

// Article operations
export async function getArticleByPath(path: string): Promise<Article | null> {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('path', path)
        .single()

    if (error) {
        console.error('Error fetching article:', error)
        return null
    }

    return data
}

export async function getAllArticles(): Promise<Article[]> {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching articles:', error)
        return []
    }

    return data || []
}

// Slides operations
export async function getActiveSlides(): Promise<Slide[]> {
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
}

// Menu operations
export async function getMenuStructure(): Promise<MenuItem[]> {
    const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('active', true)
        .order('order_index', { ascending: true })

    if (error) {
        console.error('Error fetching menu:', error)
        return []
    }

    return data || []
}

// FAQ operations
export async function getFAQsByCategory(category: string): Promise<FAQItem[]> {
    const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .eq('category', category)
        .eq('active', true)
        .order('order_index', { ascending: true })

    if (error) {
        console.error('Error fetching FAQs:', error)
        return []
    }

    return data || []
}

export async function getFAQCategories(): Promise<string[]> {
    const { data, error } = await supabase
        .from('faq_items')
        .select('category')
        .eq('active', true)

    if (error) {
        console.error('Error fetching FAQ categories:', error)
        return []
    }

    // Get distinct categories
    const categories = Array.from(new Set(data?.map(item => item.category) || []))
    return categories.sort()
}

// Workspace cards operations
export async function getWorkspaceCards(): Promise<WorkspaceCard[]> {
    const { data, error } = await supabase
        .from('workspace_cards')
        .select('*')
        .eq('active', true)

    if (error) {
        console.error('Error fetching workspace cards:', error)
        return []
    }

    return data || []
}
