// Article Editor - Main form for creating/editing articles
import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, getStorageUrl, getFAQCategories } from '@/lib/supabase'
import { ImageUploadButton } from '@/components/ImageUploadButton'
import { useMenuTree } from '@/hooks/useMenuTree'
import { vietnameseToSlug } from '@/utils/slugify'
import { Check } from 'lucide-react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

// Configuration for template fields
const TEMPLATE_CONFIG: Record<string, {
    label: string
    fields: ('bannerImg' | 'gallery' | 'videoUrl' | 'faqJsonPath' | 'contentHtml')[]
}> = {
    ProductNews: {
        label: 'Product News',
        fields: ['bannerImg', 'contentHtml']
    },
    FeatureGuide: {
        label: 'Feature Guide',
        fields: ['gallery', 'contentHtml']
    },
    VideoEmbed: {
        label: 'Video Embed',
        fields: ['videoUrl', 'contentHtml']
    },
    FAQAccordion: {
        label: 'FAQ Accordion',
        fields: ['faqJsonPath']
    }
}

export default function ArticleEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const { menuItems, loading: loadingMenu } = useMenuTree()

    // FAQ Categories state
    const [faqCategories, setFaqCategories] = useState<string[]>([])
    const [selectedFaqCategory, setSelectedFaqCategory] = useState('')

    const [menuConfig, setMenuConfig] = useState({
        createMenu: true,
        menuLabel: '',
        level1: null as string | null,
        level1Label: '', // For new menu
        level2: null as string | null,
        level2Label: '', // For new menu
        level3: null as string | null,
        level3Label: ''  // For new menu
    })

    const [articleSlug, setArticleSlug] = useState('')
    const [originalPath, setOriginalPath] = useState('') // Store DB path for edit mode
    const [menuChanged, setMenuChanged] = useState(false) // Track if user changed menu

    const [form, setForm] = useState({
        path: '',
        title: '',
        subtitle: '',
        template_key: 'ProductNews',
        banner_img: '',
        content_html: '',
        gallery: [] as string[],
        video_url: '',
        faq_json_path: '',
        ending_note: 'Thông tin chi tiết vui lòng liên hệ Hotline 1900-63-8588 để được hỗ trợ.'
    })

    // Load FAQ categories on mount
    useEffect(() => {
        getFAQCategories().then(setFaqCategories)
    }, [])

    useEffect(() => {
        if (id) loadArticle(id)
    }, [id])

    // Auto-generate path when menu or slug changes
    useEffect(() => {
        if (!articleSlug) return

        // In edit mode, preserve original path unless user changed menu
        if (id && !menuChanged && originalPath) {
            setForm(prev => ({ ...prev, path: originalPath }))
            return
        }

        // Build path from menu hierarchy + slug
        const buildPathFromMenu = () => {
            const pathSegments = []

            // Level 1
            if (menuConfig.level1 === '__NEW__') {
                if (menuConfig.level1Label) pathSegments.push(vietnameseToSlug(menuConfig.level1Label))
            } else if (menuConfig.level1) {
                const l1 = menuItems.find(m => m.id === menuConfig.level1)
                if (l1) pathSegments.push(vietnameseToSlug(l1.label))
            }

            // Level 2
            if (menuConfig.level2 === '__NEW__') {
                if (menuConfig.level2Label) pathSegments.push(vietnameseToSlug(menuConfig.level2Label))
            } else if (menuConfig.level2) {
                const l2 = menuItems.find(m => m.id === menuConfig.level2)
                if (l2) pathSegments.push(vietnameseToSlug(l2.label))
            }

            // Level 3
            if (menuConfig.level3 === '__NEW__') {
                if (menuConfig.level3Label) pathSegments.push(vietnameseToSlug(menuConfig.level3Label))
            } else if (menuConfig.level3) {
                const l3 = menuItems.find(m => m.id === menuConfig.level3)
                if (l3) pathSegments.push(vietnameseToSlug(l3.label))
            }

            // Add article slug at the end
            pathSegments.push(articleSlug)

            return pathSegments.join('/')
        }

        const generatedPath = buildPathFromMenu()
        setForm(prev => ({ ...prev, path: generatedPath }))
    }, [menuConfig, articleSlug, id, menuChanged, originalPath, menuItems])

    // Update faq_json_path when category changes
    useEffect(() => {
        if (selectedFaqCategory) {
            setForm(prev => ({ ...prev, faq_json_path: `faqs/${selectedFaqCategory}.json` }))
        } else if (form.template_key === 'FAQAccordion') {
            setForm(prev => ({ ...prev, faq_json_path: '' }))
        }
    }, [selectedFaqCategory])

    const loadArticle = async (articleId: string) => {
        setLoading(true)
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', articleId)
            .single()

        if (error) {
            alert('Error loading article')
            navigate('/CMS/articles')
        } else if (data) {
            setForm({
                path: data.path || '',
                title: data.title || '',
                subtitle: data.subtitle || '',
                template_key: data.template_key || 'ProductNews',
                banner_img: data.banner_img || '',
                content_html: data.content_html || '',
                gallery: data.gallery || [],
                video_url: data.video_url || '',
                faq_json_path: data.faq_json_path || '',
                ending_note: data.ending_note || ''
            })

            // Parse FAQ category from path
            if (data.faq_json_path) {
                const match = data.faq_json_path.match(/faqs\/(.+)\.json/)
                if (match && match[1]) {
                    setSelectedFaqCategory(match[1])
                }
            }

            // Store original path
            setOriginalPath(data.path)

            // Extract slug from path
            const pathParts = data.path.split('/')
            setArticleSlug(pathParts[pathParts.length - 1])

            // Find menu item and populate cascading selector
            const { data: menuItem } = await supabase
                .from('menu_items')
                .select('id, parent_id, level')
                .eq('path', data.path)
                .single()

            if (menuItem) {
                // Build parent chain recursively
                const parents = []
                let currentId = menuItem.parent_id

                while (currentId) {
                    const { data: parent } = await supabase
                        .from('menu_items')
                        .select('id, parent_id, level')
                        .eq('id', currentId)
                        .single()

                    if (parent) {
                        parents.unshift(parent)
                        currentId = parent.parent_id
                    } else {
                        break
                    }
                }

                // Populate levels (parents[0] = L1, parents[1] = L2, etc.)
                setMenuConfig({
                    createMenu: true,
                    menuLabel: data.title,
                    level1: parents[0]?.id || null,
                    level1Label: '',
                    level2: parents[1]?.id || null,
                    level2Label: '',
                    level3: parents[2]?.id || null,
                    level3Label: ''
                })
            }
        }
        setLoading(false)
    }

    const handleSave = async () => {
        if (!form.title) {
            alert('Title is required')
            return
        }

        if (!id && (!menuConfig.level1 || !articleSlug)) {
            alert('Menu selection and article slug are required')
            return
        }

        // Validation based on template
        const config = TEMPLATE_CONFIG[form.template_key]
        if (config.fields.includes('videoUrl') && !form.video_url) {
            alert('Video URL is required for Video Embed template')
            return
        }
        if (config.fields.includes('faqJsonPath') && !form.faq_json_path) {
            alert('FAQ Category is required for FAQ Accordion template')
            return
        }

        setSaving(true)
        try {
            // Clean up data based on template visibility
            const article = {
                path: form.path,
                title: form.title,
                subtitle: form.subtitle,
                render_type: 'template',
                template_key: form.template_key,
                ending_note: form.ending_note || null,
                // Conditional fields
                banner_img: config.fields.includes('bannerImg') ? (form.banner_img || null) : null,
                content_html: config.fields.includes('contentHtml') ? (form.content_html || null) : null,
                gallery: config.fields.includes('gallery') && form.gallery.length > 0 ? form.gallery : null,
                video_url: config.fields.includes('videoUrl') ? (form.video_url || null) : null,
                faq_json_path: config.fields.includes('faqJsonPath') ? (form.faq_json_path || null) : null,
            }


            // Handle menu creation logic (shared for both create and update)
            const handleMenuCreation = async () => {
                // In edit mode, menuLabel might be empty (hidden input). Use title as fallback.
                const labelToUse = menuConfig.menuLabel || form.title

                // In create mode, check createMenu flag. In edit mode, always proceed if we have a label.
                if (!id && !menuConfig.createMenu) return
                if (!labelToUse) return

                let currentParentId: string | null = null
                let currentLevel = 0

                // Handle Level 1
                if (menuConfig.level1 === '__NEW__') {
                    const label = menuConfig.level1Label
                    const slug = vietnameseToSlug(label)
                    const { data: newL1, error: l1Error } = await supabase
                        .from('menu_items')
                        .insert([{
                            label: label,
                            path: slug,
                            parent_id: null,
                            level: 1,
                            order_index: 99,
                            active: true
                        }])
                        .select()
                        .single()
                    if (l1Error) throw l1Error
                    currentParentId = newL1.id
                    currentLevel = 1
                } else if (menuConfig.level1) {
                    currentParentId = menuConfig.level1
                    currentLevel = 1
                }

                // Handle Level 2
                if (currentParentId && menuConfig.level2 === '__NEW__') {
                    const label = menuConfig.level2Label
                    const slug = vietnameseToSlug(label)
                    const { data: parent } = await supabase.from('menu_items').select('path').eq('id', currentParentId).single()
                    const fullPath = `${parent?.path}/${slug}`

                    const { data: newL2, error: l2Error } = await supabase
                        .from('menu_items')
                        .insert([{
                            label: label,
                            path: fullPath,
                            parent_id: currentParentId,
                            level: 2,
                            order_index: 99,
                            active: true
                        }])
                        .select()
                        .single()
                    if (l2Error) throw l2Error
                    currentParentId = newL2.id
                    currentLevel = 2
                } else if (menuConfig.level2) {
                    currentParentId = menuConfig.level2
                    currentLevel = 2
                }

                // Handle Level 3
                if (currentParentId && menuConfig.level3 === '__NEW__') {
                    const label = menuConfig.level3Label
                    const slug = vietnameseToSlug(label)
                    const { data: parent } = await supabase.from('menu_items').select('path').eq('id', currentParentId).single()
                    const fullPath = `${parent?.path}/${slug}`

                    const { data: newL3, error: l3Error } = await supabase
                        .from('menu_items')
                        .insert([{
                            label: label,
                            path: fullPath,
                            parent_id: currentParentId,
                            level: 3,
                            order_index: 99,
                            active: true
                        }])
                        .select()
                        .single()
                    if (l3Error) throw l3Error
                    currentParentId = newL3.id
                    currentLevel = 3
                } else if (menuConfig.level3) {
                    currentParentId = menuConfig.level3
                    currentLevel = 3
                }

                // Create or update the article's menu item
                if (id) {
                    // Edit mode: update existing menu item or create new one
                    const { data: existingMenu } = await supabase
                        .from('menu_items')
                        .select('id')
                        .eq('path', form.path)
                        .single()

                    if (existingMenu) {
                        // Update existing menu item
                        await supabase
                            .from('menu_items')
                            .update({
                                label: labelToUse,
                                parent_id: currentParentId,
                                level: currentLevel + 1
                            })
                            .eq('id', existingMenu.id)
                    } else {
                        // Create new menu item for this article
                        await supabase
                            .from('menu_items')
                            .insert([{
                                label: labelToUse,
                                path: form.path,
                                parent_id: currentParentId,
                                level: currentLevel + 1,
                                order_index: 99,
                                active: true
                            }])
                    }
                } else {
                    // Create mode: always create new menu item
                    const { error: menuError } = await supabase
                        .from('menu_items')
                        .insert([{
                            label: labelToUse,
                            path: form.path,
                            parent_id: currentParentId,
                            level: currentLevel + 1,
                            order_index: 99,
                            active: true
                        }])

                    if (menuError) console.error('Menu creation error:', menuError)
                }
            }

            if (id) {
                const { error } = await supabase
                    .from('articles')
                    .update(article)
                    .eq('id', id)
                if (error) throw error

                // Handle menu creation/update in edit mode
                await handleMenuCreation()

                alert('Article updated!')
                navigate('/CMS/articles')
            } else {
                const { error } = await supabase
                    .from('articles')
                    .insert([article])
                if (error) throw error

                // Create menu item if enabled
                await handleMenuCreation()

                alert('Article created!')
                navigate('/CMS/articles')
            }
        } catch (error: any) {
            alert('Error saving: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    // Upload states
    const [bannerUpload, setBannerUpload] = useState({ status: 'idle', progress: 0 })
    const [galleryUpload, setGalleryUpload] = useState({ status: 'idle', progress: 0 })

    // Helper to render upload status or default text
    const renderUploadStatus = (statusState: { status: string, progress: number }, defaultText: string) => {
        if (statusState.status === 'uploading') {
            return (
                <div className="mt-2 w-full max-w-md">
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Uploading...</span>
                        <span>{statusState.progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-1.5">
                        <div
                            className="bg-brand h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${statusState.progress}%` }}
                        />
                    </div>
                </div>
            )
        }
        if (statusState.status === 'success') {
            return (
                <div className="mt-2 flex items-center gap-2 text-emerald-400 text-xs animate-in fade-in slide-in-from-left-2">
                    <div className="bg-emerald-500/20 p-1 rounded-full">
                        <Check size={12} />
                    </div>
                    <span>Upload completed</span>
                </div>
            )
        }
        return <p className="text-xs text-zinc-500 mt-1">{defaultText}</p>
    }

    if (loading) return <div className="p-8 text-white">Loading...</div>

    // Determine visible fields based on template
    const activeFields = TEMPLATE_CONFIG[form.template_key]?.fields || []
    const showBanner = activeFields.includes('bannerImg')
    const showGallery = activeFields.includes('gallery')
    const showVideo = activeFields.includes('videoUrl')
    const showFAQ = activeFields.includes('faqJsonPath')
    const showContent = activeFields.includes('contentHtml')

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">{id ? 'Edit Article' : 'New Article'}</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/CMS/articles')}
                        className="px-4 py-2 border border-white/20 text-zinc-400 rounded-lg hover:bg-white/5"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Article Slug - Auto-generated from Menu Label */}
                {!id && (
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Article Slug (auto-generated)</label>
                        <input
                            type="text"
                            value={articleSlug}
                            readOnly
                            className="w-full px-4 py-2 bg-[#0e0f12]/50 border border-white/10 rounded-lg text-zinc-400"
                            placeholder="Will be generated from Menu Label"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Auto-generated from Menu Label</p>
                    </div>
                )}

                {/* Path - editable, updates when menu changes */}
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Path {id ? '(from DB, updates if menu changed)' : '(auto-generated from menu + slug)'}
                    </label>
                    <input
                        type="text"
                        value={form.path}
                        readOnly
                        className="w-full px-4 py-2 bg-[#0e0f12]/50 border border-white/10 rounded-lg text-zinc-400"
                        placeholder="Will be generated from menu + slug"
                    />
                </div>

                {/* Title & Template */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Template</label>
                        <select
                            value={form.template_key}
                            onChange={(e) => setForm({ ...form, template_key: e.target.value })}
                            className="w-full px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                        >
                            {Object.entries(TEMPLATE_CONFIG).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                            placeholder="Article title"
                        />
                    </div>
                </div>

                {/* Subtitle */}
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Subtitle</label>
                    <input
                        type="text"
                        value={form.subtitle}
                        onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                        className="w-full px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                        placeholder="Phát hành: 01/01/2025 — Bộ phận Phát triển Sản phẩm"
                    />
                </div>

                {/* Menu Integration - Always visible */}
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                    <h3 className="text-sm font-medium text-cyan-300 mb-3">
                        {id ? 'Article Menu Location' : 'Select Menu Location *'}
                    </h3>

                    <div className="space-y-3">
                        {!id && (
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">Menu Label *</label>
                                <input
                                    type="text"
                                    value={menuConfig.menuLabel}
                                    onChange={(e) => {
                                        const label = e.target.value
                                        setMenuConfig({ ...menuConfig, menuLabel: label })
                                        setArticleSlug(vietnameseToSlug(label))
                                    }}
                                    className="w-full px-3 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white text-sm"
                                    placeholder="e.g., Hướng dẫn sử dụng tính năng X"
                                />
                                <p className="text-xs text-zinc-500 mt-1">Slug will be auto-generated from this</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-zinc-400">Menu Path (select level by level)</label>

                            {/* Level 1 */}
                            <div className="space-y-1">
                                <select
                                    value={menuConfig.level1 || ''}
                                    onChange={(e) => {
                                        setMenuConfig({
                                            ...menuConfig,
                                            level1: e.target.value || null,
                                            level1Label: '',
                                            level2: null,
                                            level2Label: '',
                                            level3: null,
                                            level3Label: ''
                                        });
                                        if (id) setMenuChanged(true);
                                    }}
                                    className="w-full px-3 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white text-sm"
                                    disabled={loadingMenu}
                                >
                                    <option value="">-- Level 1 (Root) --</option>
                                    <option value="__NEW__" className="text-cyan-400 font-bold">+ New menu</option>
                                    {menuItems.filter(m => m.level === 1).map(m => (
                                        <option key={m.id} value={m.id}>{m.label}</option>
                                    ))}
                                </select>
                                {menuConfig.level1 === '__NEW__' && (
                                    <input
                                        type="text"
                                        value={menuConfig.level1Label}
                                        onChange={(e) => setMenuConfig({ ...menuConfig, level1Label: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#0e0f12] border border-cyan-500/50 rounded-lg text-white text-sm"
                                        placeholder="Enter new Level 1 menu name"
                                        autoFocus
                                    />
                                )}
                            </div>

                            {/* Level 2 */}
                            {menuConfig.level1 && (
                                <div className="space-y-1 pl-4 border-l border-zinc-700">
                                    <select
                                        value={menuConfig.level2 || ''}
                                        onChange={(e) => {
                                            setMenuConfig({
                                                ...menuConfig,
                                                level2: e.target.value || null,
                                                level2Label: '',
                                                level3: null,
                                                level3Label: ''
                                            });
                                            if (id) setMenuChanged(true);
                                        }}
                                        className="w-full px-3 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white text-sm"
                                    >
                                        <option value="">-- Stop at Level 1 --</option>
                                        <option value="__NEW__" className="text-cyan-400 font-bold">+ New menu</option>
                                        {menuConfig.level1 !== '__NEW__' && menuItems.filter(m => m.parent_id === menuConfig.level1).map(m => (
                                            <option key={m.id} value={m.id}>{m.label}</option>
                                        ))}
                                    </select>
                                    {menuConfig.level2 === '__NEW__' && (
                                        <input
                                            type="text"
                                            value={menuConfig.level2Label}
                                            onChange={(e) => setMenuConfig({ ...menuConfig, level2Label: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#0e0f12] border border-cyan-500/50 rounded-lg text-white text-sm"
                                            placeholder="Enter new Level 2 menu name"
                                            autoFocus
                                        />
                                    )}
                                </div>
                            )}

                            {/* Level 3 */}
                            {menuConfig.level2 && (
                                <div className="space-y-1 pl-8 border-l border-zinc-700">
                                    <select
                                        value={menuConfig.level3 || ''}
                                        onChange={(e) => {
                                            setMenuConfig({
                                                ...menuConfig,
                                                level3: e.target.value || null,
                                                level3Label: ''
                                            });
                                            if (id) setMenuChanged(true);
                                        }}
                                        className="w-full px-3 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white text-sm"
                                    >
                                        <option value="">-- Stop at Level 2 --</option>
                                        <option value="__NEW__" className="text-cyan-400 font-bold">+ New menu</option>
                                        {menuConfig.level2 !== '__NEW__' && menuItems.filter(m => m.parent_id === menuConfig.level2).map(m => (
                                            <option key={m.id} value={m.id}>{m.label}</option>
                                        ))}
                                    </select>
                                    {menuConfig.level3 === '__NEW__' && (
                                        <input
                                            type="text"
                                            value={menuConfig.level3Label}
                                            onChange={(e) => setMenuConfig({ ...menuConfig, level3Label: e.target.value })}
                                            className="w-full px-3 py-2 bg-[#0e0f12] border border-cyan-500/50 rounded-lg text-white text-sm"
                                            placeholder="Enter new Level 3 menu name"
                                            autoFocus
                                        />
                                    )}
                                </div>
                            )}

                            <p className="text-xs text-zinc-500 mt-1">
                                New article will be placed under: <span className="text-cyan-400 font-medium">
                                    {menuConfig.level3 ? menuItems.find(m => m.id === menuConfig.level3)?.label :
                                        menuConfig.level2 ? menuItems.find(m => m.id === menuConfig.level2)?.label :
                                            menuConfig.level1 ? menuItems.find(m => m.id === menuConfig.level1)?.label :
                                                'Root'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Conditional: Video URL */}
                {showVideo && (
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">YouTube Video URL</label>
                        <input
                            type="url"
                            value={form.video_url}
                            onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                            className="w-full px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                    </div>
                )}

                {/* Conditional: FAQ Category Dropdown */}
                {showFAQ && (
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">FAQ Category</label>
                        <select
                            value={selectedFaqCategory}
                            onChange={(e) => setSelectedFaqCategory(e.target.value)}
                            className="w-full px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                        >
                            <option value="">-- Select FAQ Category --</option>
                            {faqCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <p className="text-xs text-zinc-500 mt-1">
                            Select a category to link to <code>faqs/{selectedFaqCategory || '...'}.json</code>
                        </p>
                    </div>
                )}

                {/* Conditional: Banner Image */}
                {showBanner && (
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Banner Image</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={form.banner_img}
                                onChange={(e) => setForm({ ...form, banner_img: e.target.value })}
                                className="flex-1 px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                                placeholder="hdsd/banner.png"
                            />
                            <ImageUploadButton
                                folder="hdsd"
                                onUploadComplete={(path) => setForm({ ...form, banner_img: path })}
                                label="Upload"
                                onProgress={(p) => setBannerUpload(prev => ({ ...prev, progress: p }))}
                                onStatusChange={(s) => setBannerUpload(prev => ({ ...prev, status: s }))}
                            />
                        </div>
                        {renderUploadStatus(bannerUpload, 'Upload or enter relative path')}
                    </div>
                )}

                {/* Conditional: Gallery */}
                {showGallery && (
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Gallery</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={form.gallery.join(', ')}
                                onChange={(e) => setForm({ ...form, gallery: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                className="flex-1 px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                                placeholder="hdsd/img1.png, hdsd/img2.png"
                            />
                            <ImageUploadButton
                                folder="hdsd"
                                onUploadComplete={(paths) => {
                                    const newGallery = [...form.gallery, ...paths.split(', ').filter(Boolean)]
                                    setForm({ ...form, gallery: newGallery })
                                }}
                                label="Upload"
                                multiple
                                onProgress={(p) => setGalleryUpload(prev => ({ ...prev, progress: p }))}
                                onStatusChange={(s) => setGalleryUpload(prev => ({ ...prev, status: s }))}
                            />
                        </div>
                        {renderUploadStatus(galleryUpload, 'Upload multiple or enter comma-separated paths')}
                    </div>
                )}

                {/* Conditional: Content (Quill) */}
                {showContent && (
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Content</label>
                        <div className="quill-wrapper bg-white rounded-lg text-black">
                            <ReactQuill
                                theme="snow"
                                value={form.content_html}
                                onChange={(val) => setForm({ ...form, content_html: val })}
                                modules={{
                                    toolbar: [
                                        [{ header: [1, 2, 3, false] }],
                                        ['bold', 'italic', 'underline'],
                                        [{ list: 'ordered' }, { list: 'bullet' }],
                                        ['link', 'clean']
                                    ]
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Ending Note */}
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Ending Note</label>
                    <input
                        type="text"
                        value={form.ending_note}
                        onChange={(e) => setForm({ ...form, ending_note: e.target.value })}
                        className="w-full px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                    />
                </div>
            </div>
        </div>
    )
}
