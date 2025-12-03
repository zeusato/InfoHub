import { useState, useEffect } from 'react'
import type { Article, Slide, MenuItem, FAQItem, WorkspaceCard } from '../lib/supabase'
import {
    fetchArticles,
    fetchArticleByPath,
    fetchSlides,
    fetchMenuItems,
    fetchFAQs,
    fetchWorkspaceCards
} from '../utils/supabase-helpers'

/**
 * Hook để fetch tất cả articles
 */
export function useArticles() {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        let mounted = true

        async function loadArticles() {
            try {
                setLoading(true)
                const data = await fetchArticles()
                if (mounted) {
                    setArticles(data)
                    setError(null)
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err : new Error('Failed to fetch articles'))
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        loadArticles()

        return () => {
            mounted = false
        }
    }, [])

    return { articles, loading, error }
}

/**
 * Hook để fetch một article theo path
 */
export function useArticle(path: string) {
    const [article, setArticle] = useState<Article | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        let mounted = true

        async function loadArticle() {
            if (!path) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const data = await fetchArticleByPath(path)
                if (mounted) {
                    setArticle(data)
                    setError(null)
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err : new Error('Failed to fetch article'))
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        loadArticle()

        return () => {
            mounted = false
        }
    }, [path])

    return { article, loading, error }
}

/**
 * Hook để fetch slides cho carousel
 */
export function useSlides() {
    const [slides, setSlides] = useState<Slide[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        let mounted = true

        async function loadSlides() {
            try {
                setLoading(true)
                const data = await fetchSlides()
                if (mounted) {
                    setSlides(data)
                    setError(null)
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err : new Error('Failed to fetch slides'))
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        loadSlides()

        return () => {
            mounted = false
        }
    }, [])

    return { slides, loading, error }
}

/**
 * Hook để fetch menu structure
 */
export function useMenuItems() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        let mounted = true

        async function loadMenuItems() {
            try {
                setLoading(true)
                const data = await fetchMenuItems()
                if (mounted) {
                    setMenuItems(data)
                    setError(null)
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err : new Error('Failed to fetch menu items'))
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        loadMenuItems()

        return () => {
            mounted = false
        }
    }, [])

    return { menuItems, loading, error }
}

/**
 * Hook để fetch FAQs theo category
 */
export function useFAQs(category: string) {
    const [faqs, setFaqs] = useState<FAQItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        let mounted = true

        async function loadFAQs() {
            if (!category) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const data = await fetchFAQs(category)
                if (mounted) {
                    setFaqs(data)
                    setError(null)
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err : new Error('Failed to fetch FAQs'))
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        loadFAQs()

        return () => {
            mounted = false
        }
    }, [category])

    return { faqs, loading, error }
}

/**
 * Hook để fetch workspace cards
 */
export function useWorkspaceCards() {
    const [cards, setCards] = useState<WorkspaceCard[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        let mounted = true

        async function loadCards() {
            try {
                setLoading(true)
                const data = await fetchWorkspaceCards()
                if (mounted) {
                    setCards(data)
                    setError(null)
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err : new Error('Failed to fetch workspace cards'))
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        loadCards()

        return () => {
            mounted = false
        }
    }, [])

    return { cards, loading, error }
}
