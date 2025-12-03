// Article Editor - Main form for creating/editing articles
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, getStorageUrl } from '@/lib/supabase'
import { ImageUploadButton } from '@/components/ImageUploadButton'
import { useMenuTree } from '@/hooks/useMenuTree'
import { vietnameseToSlug } from '@/utils/slugify'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

export default function ArticleEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const { menuItems, loading: loadingMenu } = useMenuTree()

    const [menuConfig, setMenuConfig] = useState({
        createMenu: false,
        menuLabel: '',
        level1: null as string | null,
        level2: null as string | null,
        level3: null as string | null
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

            // Get selected menu items and build path from their labels
            if (menuConfig.level1) {
                const l1 = menuItems.find(m => m.id === menuConfig.level1)
                if (l1) {
                    // Convert label to slug (lowercase, replace spaces with dashes)
                    const slug = l1.label.toLowerCase()
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
                        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
                        .replace(/\s+/g, '-') // Replace spaces with dashes
                        .replace(/-+/g, '-') // Replace multiple dashes
                    pathSegments.push(slug)
                }
            }

            if (menuConfig.level2) {
                const l2 = menuItems.find(m => m.id === menuConfig.level2)
                if (l2) {
                    const slug = l2.label.toLowerCase()
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                    pathSegments.push(slug)
                }
            }

            if (menuConfig.level3) {
                const l3 = menuItems.find(m => m.id === menuConfig.level3)
                if (l3) {
                    const slug = l3.label.toLowerCase()
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                    pathSegments.push(slug)
                }
            }

            // Add article slug at the end
            pathSegments.push(articleSlug)

            return pathSegments.join('/')
        }

        const generatedPath = buildPathFromMenu()
        setForm(prev => ({ ...prev, path: generatedPath }))
    }, [menuConfig.level1, menuConfig.level2, menuConfig.level3, articleSlug, id, menuChanged, originalPath, menuItems])

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
                    level2: parents[1]?.id || null,
                    level3: parents[2]?.id || null
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

        setSaving(true)
        try {
            const article = {
                path: form.path,
                title: form.title,
                subtitle: form.subtitle,
                render_type: 'template',
                template_key: form.template_key,
                banner_img: form.banner_img || null,
                content_html: form.content_html || null,
                gallery: form.gallery.length > 0 ? form.gallery : null,
                video_url: form.video_url || null,
                faq_json_path: form.faq_json_path || null,
                ending_note: form.ending_note || null
            }

            if (id) {
                const { error } = await supabase
                    .from('articles')
                    .update(article)
                    .eq('id', id)
                if (error) throw error
                alert('Article updated!')
            } else {
                const { error } = await supabase
                    .from('articles')
                    .insert([article])
                if (error) throw error

                // Create menu item if enabled
                if (menuConfig.createMenu && menuConfig.menuLabel) {
                    const finalParentId = menuConfig.level3 || menuConfig.level2 || menuConfig.level1 || null
                    const parent = menuItems.find(m => m.id === finalParentId)
                    const { error: menuError } = await supabase
                        .from('menu_items')
                        .insert([{
                            label: menuConfig.menuLabel,
                            path: form.path,
                            parent_id: finalParentId,
                            level: parent ? parent.level + 1 : 1,
                            order_index: menuItems.filter(m => m.parent_id === finalParentId).length + 1,
                            active: true
                        }])

                    if (menuError) console.error('Menu creation error:', menuError)
                }

                alert('Article created!')
                navigate('/CMS/articles')
            }
        } catch (error: any) {
            alert('Error saving: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-white">Loading...</div>

    const isFAQ = form.template_key === 'FAQAccordion'
    const isVideo = form.template_key === 'VideoEmbed'
    const showContent = !isFAQ
    const showBanner = !isFAQ && !isVideo
    const showGallery = !isFAQ && !isVideo

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
                            <option value="ProductNews">ProductNews</option>
                            <option value="FeatureGuide">FeatureGuide</option>
                            <option value="VideoEmbed">VideoEmbed</option>
                            <option value="FAQAccordion">FAQAccordion</option>
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

                                        // Auto-generate slug from label using utility
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
                            <select
                                value={menuConfig.level1 || ''}
                                onChange={(e) => { setMenuConfig({ ...menuConfig, level1: e.target.value || null, level2: null, level3: null }); if (id) setMenuChanged(true); }}
                                className="w-full px-3 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white text-sm"
                                disabled={loadingMenu}
                            >
                                <option value="">-- Level 1 (Root) --</option>
                                {menuItems.filter(m => m.level === 1).map(m => (
                                    <option key={m.id} value={m.id}>{m.label}</option>
                                ))}
                            </select>

                            {/* Level 2 */}
                            {menuConfig.level1 && (
                                <select
                                    value={menuConfig.level2 || ''}
                                    onChange={(e) => { setMenuConfig({ ...menuConfig, level2: e.target.value || null, level3: null }); if (id) setMenuChanged(true); }}
                                    className="w-full px-3 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white text-sm"
                                >
                                    <option value="">-- Stop at Level 1 --</option>
                                    {menuItems.filter(m => m.parent_id === menuConfig.level1).map(m => (
                                        <option key={m.id} value={m.id}>{m.label}</option>
                                    ))}
                                </select>
                            )}

                            {/* Level 3 */}
                            {menuConfig.level2 && (
                                <select
                                    value={menuConfig.level3 || ''}
                                    onChange={(e) => { setMenuConfig({ ...menuConfig, level3: e.target.value || null }); if (id) setMenuChanged(true); }}
                                    className="w-full px-3 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white text-sm"
                                >
                                    <option value="">-- Stop at Level 2 --</option>
                                    {menuItems.filter(m => m.parent_id === menuConfig.level2).map(m => (
                                        <option key={m.id} value={m.id}>{m.label}</option>
                                    ))}
                                </select>
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
                {isVideo && (
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

                {/* Conditional: FAQ JSON Path */}
                {isFAQ && (
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">FAQ JSON Path</label>
                        <input
                            type="text"
                            value={form.faq_json_path}
                            onChange={(e) => setForm({ ...form, faq_json_path: e.target.value })}
                            className="w-full px-4 py-2 bg-[#0e0f12] border border-white/20 rounded-lg text-white"
                            placeholder="faqs/faq-giao-dich.json"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Relative path to FAQ JSON in public folder</p>
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
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">Upload or enter relative path</p>
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
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">Upload multiple or enter comma-separated paths</p>
                    </div>
                )}

                {/* Conditional: Content (Quill) */}
                {showContent && (
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Content</label>
                        <div className="quill-wrapper bg-white rounded-lg">
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
