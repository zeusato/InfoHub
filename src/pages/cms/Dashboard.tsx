// CMS Dashboard - Overview stats
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function CMSDashboard() {
    const [stats, setStats] = useState({
        articles: 0,
        menuItems: 0,
        faqs: 0,
        slides: 0,
        workspaceCards: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const [articles, menuItems, faqData, slides, cards] = await Promise.all([
                    supabase.from('articles').select('id', { count: 'exact', head: true }),
                    supabase.from('menu_items').select('id', { count: 'exact', head: true }),
                    supabase.from('faq_items').select('category'),
                    supabase.from('slides').select('id', { count: 'exact', head: true }),
                    supabase.from('workspace_cards').select('id', { count: 'exact', head: true }),
                ])

                // Count unique FAQ categories
                const uniqueCategories = new Set(faqData.data?.map(f => f.category) || [])
                const faqCount = uniqueCategories.size

                setStats({
                    articles: articles.count || 0,
                    menuItems: menuItems.count || 0,
                    faqs: faqCount,
                    slides: slides.count || 0,
                    workspaceCards: cards.count || 0,
                })
            } catch (error) {
                console.error('Error fetching stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    const statCards = [
        { label: 'Articles', value: stats.articles, color: 'from-orange-500/20 to-orange-600/20 border-orange-500/50' },
        { label: 'Menu Items', value: stats.menuItems, color: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/50' },
        { label: 'FAQ Topics', value: stats.faqs, color: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/50' },
        { label: 'Slides', value: stats.slides, color: 'from-purple-500/20 to-purple-600/20 border-purple-500/50' },
        { label: 'Workspace Cards', value: stats.workspaceCards, color: 'from-pink-500/20 to-pink-600/20 border-pink-500/50' },
    ]

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

            {loading ? (
                <div className="text-zinc-400">Loading stats...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {statCards.map((stat) => (
                        <div
                            key={stat.label}
                            className={`bg-gradient-to-br ${stat.color} border rounded-2xl p-6 transition-transform hover:scale-105`}
                        >
                            <div className="text-zinc-400 text-sm font-medium mb-2">{stat.label}</div>
                            <div className="text-4xl font-bold text-white">{stat.value}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl">
                <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/CMS/articles/new"
                        className="px-4 py-3 bg-brand/20 border border-brand/40 text-brand rounded-lg text-center font-medium hover:bg-brand/30 transition-colors"
                    >
                        + New Article
                    </Link>
                    <Link
                        to="/CMS/menu"
                        className="px-4 py-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-lg text-center font-medium hover:bg-emerald-500/30 transition-colors"
                    >
                        Edit Menu
                    </Link>
                    <Link
                        to="/CMS/faq"
                        className="px-4 py-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-lg text-center font-medium hover:bg-cyan-500/30 transition-colors"
                    >
                        Manage FAQs
                    </Link>
                </div>
            </div>
        </div>
    )
}
