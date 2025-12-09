// src/components/SearchBar.tsx
import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { supabase, Article } from '@/lib/supabase'

type SearchResult = {
    id: string
    title: string
    path: string
}

type Props = {
    onSelect: (result: { id: string; label: string; path: string }) => void
    onClose?: () => void
}

export default function SearchBar({ onSelect, onClose }: Props) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [articles, setArticles] = useState<Article[]>([])
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Load all articles once on mount
    useEffect(() => {
        const loadArticles = async () => {
            const { data, error } = await supabase
                .from('articles')
                .select('id, title, path')
                .order('title', { ascending: true })

            if (!error && data) {
                setArticles(data as Article[])
            }
        }
        loadArticles()
    }, [])

    // Filter articles client-side when query changes (same logic as CMS)
    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            setShowDropdown(false)
            return
        }

        setLoading(true)
        const lowerQuery = query.toLowerCase()

        const filtered = articles.filter(a =>
            a.title.toLowerCase().includes(lowerQuery)
        ).slice(0, 8) // Limit to 8 results

        setResults(filtered.map(a => ({
            id: a.id,
            title: a.title,
            path: a.path
        })))
        setShowDropdown(true)
        setLoading(false)
    }, [query, articles])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (result: SearchResult) => {
        onSelect({
            id: result.id,
            label: result.title,
            path: result.path
        })
        setQuery('')
        setShowDropdown(false)
        onClose?.() // Close sidebar on mobile
    }

    const clearSearch = () => {
        setQuery('')
        setResults([])
        setShowDropdown(false)
        inputRef.current?.focus()
    }

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Search Input */}
            <div className="relative">
                <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm bài viết..."
                    className="w-full pl-9 pr-8 py-2 bg-[var(--bg-glass)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/30 transition"
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white transition"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {showDropdown && (
                <div className="absolute z-50 w-full mt-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl max-h-64 overflow-auto">
                    {loading ? (
                        <div className="px-3 py-2 text-sm text-[var(--text-muted)]">Đang tìm...</div>
                    ) : results.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-[var(--text-muted)]">Không tìm thấy kết quả</div>
                    ) : (
                        results.map((result) => (
                            <button
                                key={result.id}
                                onClick={() => handleSelect(result)}
                                className="w-full px-3 py-2 text-left hover:bg-[var(--bg-glass-hover)] transition group"
                            >
                                <div className="text-sm text-[var(--text-primary)] group-hover:text-brand truncate">
                                    {result.title}
                                </div>
                                <div className="text-xs text-[var(--text-muted)] truncate">
                                    {result.path}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
