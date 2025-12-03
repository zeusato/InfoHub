// FAQ Editor - Edit questions for a category with Delete All and Excel Import
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react'

type FAQItem = {
    id: string
    category: string
    question: string
    answer: string
    order_index: number
    active: boolean
}

export default function FAQEditor() {
    const { category } = useParams()
    const navigate = useNavigate()
    const [faqs, setFaqs] = useState<FAQItem[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (category) loadFAQs()
    }, [category])

    const loadFAQs = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('faq_items')
            .select('*')
            .eq('category', category)
            .order('order_index')

        if (!error && data) {
            setFaqs(data)
        }
        setLoading(false)
    }

    const addQuestion = () => {
        const newFaq: FAQItem = {
            id: crypto.randomUUID(),
            category: category || '',
            question: '',
            answer: '',
            order_index: faqs.length + 1,
            active: true
        }
        setFaqs([...faqs, newFaq])
    }

    const updateFaq = (id: string, field: 'question' | 'answer', value: string) => {
        setFaqs(faqs.map(f => f.id === id ? { ...f, [field]: value } : f))
    }

    const deleteFaq = (id: string) => {
        if (!confirm('Delete this question?')) return
        setFaqs(faqs.filter(f => f.id !== id))
    }

    const moveUp = (index: number) => {
        if (index === 0) return
        const newFaqs = [...faqs]
            ;[newFaqs[index - 1], newFaqs[index]] = [newFaqs[index], newFaqs[index - 1]]
        setFaqs(newFaqs.map((f, i) => ({ ...f, order_index: i + 1 })))
    }

    const moveDown = (index: number) => {
        if (index === faqs.length - 1) return
        const newFaqs = [...faqs]
            ;[newFaqs[index + 1], newFaqs[index]] = [newFaqs[index], newFaqs[index + 1]]
        setFaqs(newFaqs.map((f, i) => ({ ...f, order_index: i + 1 })))
    }

    const deleteAll = async () => {
        if (!confirm(`Delete ALL questions in category "${category}"? This cannot be undone!`)) return

        const { error } = await supabase
            .from('faq_items')
            .delete()
            .eq('category', category)

        if (error) {
            alert('Error: ' + error.message)
        } else {
            alert('All questions deleted!')
            setFaqs([])
        }
    }

    const handleImportCSV = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.csv'
        input.onchange = async (e: any) => {
            const file = e.target.files?.[0]
            if (!file) return

            const text = await file.text()
            const lines = text.split('\n').filter((l: string) => l.trim())
            const imported: FAQItem[] = []

            lines.forEach((line: string, index: number) => {
                if (index === 0 && line.toLowerCase().includes('question')) return
                const parts = line.split(',')
                if (parts.length < 2) return
                const question = parts[0].trim().replace(/^"|"$/g, '')
                const answer = parts.slice(1).join(',').trim().replace(/^"|"$/g, '')

                if (question && answer) {
                    imported.push({
                        id: crypto.randomUUID(),
                        category: category || '',
                        question,
                        answer,
                        order_index: faqs.length + imported.length + 1,
                        active: true
                    })
                }
            })

            if (imported.length > 0) {
                setFaqs([...faqs, ...imported])
                alert(`Imported ${imported.length} questions!`)
            } else {
                alert('No valid questions found. Format: question,answer')
            }
        }
        input.click()
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await supabase.from('faq_items').delete().eq('category', category)

            const items = faqs.map(f => ({
                category: f.category,
                question: f.question,
                answer: f.answer,
                order_index: f.order_index,
                active: f.active
            }))

            const { error } = await supabase.from('faq_items').insert(items)
            if (error) throw error

            alert('Saved!')
            navigate('/CMS/faq')
        } catch (error: any) {
            alert('Error: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-white">Loading...</div>

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Edit FAQ: {category}</h1>
                    <p className="text-zinc-400 text-sm mt-1">{faqs.length} questions</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleImportCSV}
                        className="px-4 py-2 border border-cyan-500/40 text-cyan-400 rounded-lg hover:bg-cyan-500/20"
                        title="Import CSV (format: question,answer)"
                    >
                        Import CSV
                    </button>
                    <button
                        onClick={deleteAll}
                        className="px-4 py-2 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/20"
                    >
                        Delete All
                    </button>
                    <button
                        onClick={() => navigate('/CMS/faq')}
                        className="px-4 py-2 border border-white/20 text-zinc-400 rounded-lg hover:bg-white/5"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save All'}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div key={faq.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="flex items-start gap-3">
                            <span className="px-3 py-1 bg-brand/20 border border-brand/40 text-brand rounded-full text-sm font-medium">
                                Q{index + 1}
                            </span>
                            <div className="flex-1 space-y-3">
                                <input
                                    type="text"
                                    value={faq.question}
                                    onChange={(e) => updateFaq(faq.id, 'question', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                                    placeholder="Question..."
                                />
                                <textarea
                                    value={faq.answer}
                                    onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                                    rows={3}
                                    placeholder="Answer..."
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => moveUp(index)}
                                    disabled={index === 0}
                                    className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30"
                                    title="Move up"
                                >
                                    <ArrowUp size={16} />
                                </button>
                                <button
                                    onClick={() => moveDown(index)}
                                    disabled={index === faqs.length - 1}
                                    className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30"
                                    title="Move down"
                                >
                                    <ArrowDown size={16} />
                                </button>
                                <button
                                    onClick={() => deleteFaq(faq.id)}
                                    className="p-2 hover:bg-red-500/20 rounded-lg text-zinc-400 hover:text-red-400"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={addQuestion}
                    className="w-full px-4 py-3 border-2 border-dashed border-white/20 text-zinc-400 rounded-xl hover:border-brand/40 hover:text-brand transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={18} />
                    Add Question
                </button>
            </div>
        </div>
    )
}
