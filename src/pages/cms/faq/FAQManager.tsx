// FAQ Manager - List categories and manage FAQs
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Plus } from 'lucide-react'

export default function FAQManager() {
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('faq_items')
            .select('category')

        if (!error && data) {
            // Group by category and count
            const categoryMap = new Map<string, number>()
            data.forEach(item => {
                const count = categoryMap.get(item.category) || 0
                categoryMap.set(item.category, count + 1)
            })

            const cats = Array.from(categoryMap.entries()).map(([cat, count]) => ({
                category: cat,
                count
            }))

            setCategories(cats)
        }
        setLoading(false)
    }

    const handleNewCategory = () => {
        const category = prompt('Enter new FAQ category name (e.g., faq-trading):')
        if (category && category.trim()) {
            navigate(`/CMS/faq/edit/${category.trim()}`)
        }
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">FAQ Manager</h1>
                <button
                    onClick={handleNewCategory}
                    className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg"
                >
                    <Plus size={18} />
                    New Category
                </button>
            </div>

            {loading ? (
                <div className="text-zinc-400">Loading...</div>
            ) : categories.length === 0 ? (
                <div className="text-zinc-400">No FAQ categories yet</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map(({ category, count }) => (
                        <Link
                            key={category}
                            to={`/CMS/faq/edit/${category}`}
                            className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
                        >
                            <div className="text-lg font-semibold text-white mb-2">{category}</div>
                            <div className="text-sm text-zinc-400">{count} question{count !== 1 ? 's' : ''}</div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
