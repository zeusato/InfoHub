import { useEffect, useState } from 'react'
import { getFAQsByCategory, FAQItem } from '@/lib/supabase'

export function useFAQs(category: string) {
    const [faqs, setFaqs] = useState<FAQItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        let isMounted = true

        async function fetchFAQs() {
            if (!category) {
                setFaqs([])
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const data = await getFAQsByCategory(category)
                if (isMounted) {
                    setFaqs(data)
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

        fetchFAQs()

        return () => {
            isMounted = false
        }
    }, [category])

    return { faqs, loading, error }
}
