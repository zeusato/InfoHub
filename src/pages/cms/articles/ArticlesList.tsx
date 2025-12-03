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

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"?`)) return

        const { error } = await supabase
            .from('articles')
            .delete()
            .eq('id', id)

        if (error) {
            alert('Error deleting: ' + error.message)
        } else {
            alert('Deleted!')
            loadArticles()
        }
    }

    const filtered = articles.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.path.toLowerCase().includes(search.toLowerCase())
    )

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

            <div className="mb-6">
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
                                            <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded text-xs">
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
                                                    onClick={() => handleDelete(article.id, article.title)}
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
