// Carousel Editor - Manage 3 banner slots
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ImageUploadButton } from '@/components/ImageUploadButton'

type Slide = {
    id: string
    slot_number: number
    title: string
    image_url: string
    link_url: string | null
    active: boolean
}

export default function CarouselEditor() {
    const [slides, setSlides] = useState<Slide[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<number | null>(null)

    useEffect(() => {
        loadSlides()
    }, [])

    const loadSlides = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('slides')
            .select('*')
            .order('slot_number')

        if (!error && data) {
            setSlides(data)
        }
        setLoading(false)
    }

    const updateSlide = (slotNumber: number, field: keyof Slide, value: any) => {
        setSlides(slides.map(s =>
            s.slot_number === slotNumber ? { ...s, [field]: value } : s
        ))
    }

    const saveSlot = async (slotNumber: number) => {
        setSaving(slotNumber)
        const slide = slides.find(s => s.slot_number === slotNumber)
        if (!slide) return

        const { error } = await supabase
            .from('slides')
            .update({
                title: slide.title,
                image_url: slide.image_url,
                link_url: slide.link_url,
                active: slide.active
            })
            .eq('slot_number', slotNumber)

        if (error) {
            alert('Error: ' + error.message)
        } else {
            alert(`Slot ${slotNumber} saved!`)
        }
        setSaving(null)
    }

    if (loading) return <div className="p-8 text-white">Loading...</div>

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Carousel Editor</h1>
            <p className="text-zinc-400 mb-8">Manage the 3 banner carousel slots</p>

            <div className="space-y-6">
                {slides.map((slide) => (
                    <div key={slide.slot_number} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">Slot {slide.slot_number}</h2>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={slide.active}
                                    onChange={(e) => updateSlide(slide.slot_number, 'active', e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-zinc-400">Active</span>
                            </label>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={slide.title}
                                    onChange={(e) => updateSlide(slide.slot_number, 'title', e.target.value)}
                                    className="w-full px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                                    placeholder="Banner title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Image URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={slide.image_url}
                                        onChange={(e) => updateSlide(slide.slot_number, 'image_url', e.target.value)}
                                        className="flex-1 px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                                        placeholder="banners/banner-1.png"
                                    />
                                    <ImageUploadButton
                                        folder="banners"
                                        onUploadComplete={(path) => updateSlide(slide.slot_number, 'image_url', path)}
                                        label="Upload"
                                    />
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">Upload or enter relative path</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Link URL (optional)</label>
                                <input
                                    type="url"
                                    value={slide.link_url || ''}
                                    onChange={(e) => updateSlide(slide.slot_number, 'link_url', e.target.value)}
                                    className="w-full px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                                    placeholder="https://www.shs.com.vn/"
                                />
                            </div>

                            <button
                                onClick={() => saveSlot(slide.slot_number)}
                                disabled={saving === slide.slot_number}
                                className="w-full px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg disabled:opacity-50"
                            >
                                {saving === slide.slot_number ? 'Saving...' : `Save Slot ${slide.slot_number}`}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
