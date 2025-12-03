// Workspace Cards Editor - Edit SH Smart & SHAdvisor cards
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ImageUploadButton } from '@/components/ImageUploadButton'

type WorkspaceCard = {
    id: string
    card_key: string
    title: string
    button_text: string
    button_url: string
    qr_image_url: string
    gradient_from: string
    gradient_to: string
    active: boolean
}

export default function WorkspaceCardsEditor() {
    const [cards, setCards] = useState<WorkspaceCard[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)

    useEffect(() => {
        loadCards()
    }, [])

    const loadCards = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('workspace_cards')
            .select('*')
            .in('card_key', ['sh_smart', 'sh_advisor'])
            .order('card_key')

        if (!error && data) {
            setCards(data)
        }
        setLoading(false)
    }

    const updateCard = (cardKey: string, field: keyof WorkspaceCard, value: any) => {
        setCards(cards.map(c =>
            c.card_key === cardKey ? { ...c, [field]: value } : c
        ))
    }

    const saveCard = async (cardKey: string) => {
        setSaving(cardKey)
        const card = cards.find(c => c.card_key === cardKey)
        if (!card) return

        const { error } = await supabase
            .from('workspace_cards')
            .update({
                title: card.title,
                button_text: card.button_text,
                button_url: card.button_url,
                qr_image_url: card.qr_image_url,
                gradient_from: card.gradient_from,
                gradient_to: card.gradient_to,
                active: card.active
            })
            .eq('card_key', cardKey)

        if (error) {
            alert('Error: ' + error.message)
        } else {
            alert(`${card.title} saved!`)
        }
        setSaving(null)
    }

    if (loading) return <div className="p-8 text-white">Loading...</div>

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Workspace Cards</h1>
            <p className="text-zinc-400 mb-8">Edit SH Smart and SHAdvisor cards</p>

            <div className="space-y-6">
                {cards.map((card) => (
                    <div key={card.card_key} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white capitalize">
                                {card.card_key.replace('_', ' ')}
                            </h2>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={card.active}
                                    onChange={(e) => updateCard(card.card_key, 'active', e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-zinc-400">Active</span>
                            </label>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={card.title}
                                        onChange={(e) => updateCard(card.card_key, 'title', e.target.value)}
                                        className="w-full px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Button Text</label>
                                    <input
                                        type="text"
                                        value={card.button_text}
                                        onChange={(e) => updateCard(card.card_key, 'button_text', e.target.value)}
                                        className="w-full px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Button URL</label>
                                <input
                                    type="url"
                                    value={card.button_url}
                                    onChange={(e) => updateCard(card.card_key, 'button_url', e.target.value)}
                                    className="w-full px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">QR Image URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={card.qr_image_url}
                                        onChange={(e) => updateCard(card.card_key, 'qr_image_url', e.target.value)}
                                        className="flex-1 px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                                        placeholder="workspace/QR-SHSmart.jpg"
                                    />
                                    <ImageUploadButton
                                        folder="workspace"
                                        onUploadComplete={(path) => updateCard(card.card_key, 'qr_image_url', path)}
                                        label="Upload"
                                    />
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">Upload or enter relative path</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Gradient From</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={card.gradient_from}
                                            onChange={(e) => updateCard(card.card_key, 'gradient_from', e.target.value)}
                                            className="w-12 h-10 bg-[#0e0f12] border border-white/20 rounded-lg"
                                        />
                                        <input
                                            type="text"
                                            value={card.gradient_from}
                                            onChange={(e) => updateCard(card.card_key, 'gradient_from', e.target.value)}
                                            className="flex-1 px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Gradient To</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={card.gradient_to}
                                            onChange={(e) => updateCard(card.card_key, 'gradient_to', e.target.value)}
                                            className="w-12 h-10 bg-[#0e0f12] border border-white/20 rounded-lg"
                                        />
                                        <input
                                            type="text"
                                            value={card.gradient_to}
                                            onChange={(e) => updateCard(card.card_key, 'gradient_to', e.target.value)}
                                            className="flex-1 px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => saveCard(card.card_key)}
                                disabled={saving === card.card_key}
                                className="w-full px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg disabled:opacity-50"
                            >
                                {saving === card.card_key ? 'Saving...' : `Save ${card.title}`}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
