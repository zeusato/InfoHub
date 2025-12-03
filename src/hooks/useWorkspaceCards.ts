import { useEffect, useState } from 'react'
import { getWorkspaceCards, WorkspaceCard, getStorageUrl } from '@/lib/supabase'

export function useWorkspaceCards() {
    const [cards, setCards] = useState<WorkspaceCard[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        let isMounted = true

        async function fetchCards() {
            try {
                setLoading(true)
                const data = await getWorkspaceCards()
                if (isMounted) {
                    setCards(data)
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

        fetchCards()

        return () => {
            isMounted = false
        }
    }, [])

    // Helper to get card by key
    const getCard = (key: 'sh_smart' | 'sh_advisor') => {
        return cards.find(c => c.card_key === key)
    }

    return { cards, loading, error, getCard }
}
