// Articles List with search and CRUD actions
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Pencil, Trash2, Plus } from 'lucide-react'

export default function ArticlesList() {
    const [articles, setArticles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        loadArticles()
    }, [])

    const loadArticles = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setArticles(data)
        }
        setLoading(false)
    }

    const handleDelete = async (id: string, title: string, path: string) => {
        if (!confirm(`Delete "${title}"?`)) return

        // 1. Delete article
        const { error: articleError } = await supabase
            .from('articles')
            .delete()
            .eq('id', id)

        if (articleError) {
            alert('Error deleting article: ' + articleError.message)
            return
        }

        // 2. Delete corresponding menu item (if any)
        const { error: menuError } = await supabase
            .from('menu_items')
            .delete()
            .eq('path', path)

        if (menuError) {
            console.error('Error deleting menu item:', menuError)
            // Don't block success alert if menu delete fails, just log it
        }

        alert('Deleted!')
        loadArticles()
    }

    const [activeTab, setActiveTab] = useState('All')

    const tabs = ['All', 'ProductNews', 'FeatureGuide', 'VideoEmbed', 'FAQAccordion']

    const filtered = articles.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.path.toLowerCase().includes(search.toLowerCase())
        const matchesTab = activeTab === 'All' || a.template_key === activeTab
        return matchesSearch && matchesTab
    })

    const getTemplateBadgeColor = (key: string) => {
        switch (key) {
            case 'ProductNews': return 'bg-blue-500/20 border-blue-500/40 text-blue-400'
            case 'FeatureGuide': return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            case 'VideoEmbed': return 'bg-red-500/20 border-red-500/40 text-red-400'
            case 'FAQAccordion': return 'bg-purple-500/20 border-purple-500/40 text-purple-400'
            default: return 'bg-zinc-500/20 border-zinc-500/40 text-zinc-400'
        }
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Articles</h1>
                <Link
                    to="/CMS/articles/new"
                    className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg"
                >
                    <Plus size={18} />
                    New Article
                </Link>
            </div>

            <div className="flex flex-col gap-4 mb-6">
                {/* Tabs */}
                <div className="flex gap-2 border-b border-white/10 pb-1">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative top-[1px] ${activeTab === tab
                                ? 'text-brand border-b-2 border-brand bg-white/5'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title or path..."
                    className="w-full max-w-md px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                />
            </div>

            {loading ? (
                <div className="text-zinc-400">Loading...</div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Title</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Path</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Template</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                                        No articles found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((article) => (
                                    <tr key={article.id} className="hover:bg-white/5">
                                        <td className="px-4 py-3 text-white">{article.title}</td>
                                        <td className="px-4 py-3 text-zinc-400 text-sm font-mono">{article.path}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 border rounded text-xs ${getTemplateBadgeColor(article.template_key)}`}>
                                                {article.template_key}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/CMS/articles/edit/${article.id}`}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(article.id, article.title, article.path)}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg text-zinc-400 hover:text-red-400"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
