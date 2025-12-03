// Protected Route wrapper for CMS
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)

    useEffect(() => {
        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setAuthenticated(!!session)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setAuthenticated(!!session)
        })

        return () => subscription.unsubscribe()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center">
                <div className="text-zinc-400">Loading...</div>
            </div>
        )
    }

    if (!authenticated) {
        return <Navigate to="/CMS/login" replace />
    }

    return <>{children}</>
}
