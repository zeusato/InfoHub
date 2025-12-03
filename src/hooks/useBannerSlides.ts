import { useEffect, useState } from 'react'
import { getActiveSlides, Slide, getStorageUrl } from '@/lib/supabase'

export function useBannerSlides() {
    const [slides, setSlides] = useState<Slide[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        let isMounted = true

        async function fetchSlides() {
            try {
                setLoading(true)
                const data = await getActiveSlides()
                if (isMounted) {
                    setSlides(data)
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

        fetchSlides()

        return () => {
            isMounted = false
        }
    }, [])

    return { slides, loading, error }
}
