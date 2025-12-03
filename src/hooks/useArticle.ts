import { useEffect, useState } from 'react'
import { getArticleByPath, Article, getStorageUrl } from '@/lib/supabase'

export function useArticle(path: string | null) {
    const [article, setArticle] = useState<Article | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        let isMounted = true

        async function fetchArticle() {
            if (!path) {
                setArticle(null)
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const data = await getArticleByPath(path)
                if (isMounted) {
                    setArticle(data)
                    setError(null)
                }
            } catch (err) {
                if (isMounted) {
                    setError(err as Error)
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchArticle()

        return () => {
            isMounted = false
        }
    }, [path])

    return { article, loading, error }
}
