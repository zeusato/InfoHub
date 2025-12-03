import { useState, useMemo, useEffect } from 'react'
import { useMenuTree, MenuItem } from '@/hooks/useMenuTree'
import { supabase } from '@/lib/supabase'
import { Trash2, ChevronRight, ChevronDown, Folder, FileText, AlertTriangle } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'

export default function MenuManager() {
    const { menuItems, loading, buildTree, reload } = useMenuTree()
    const menuTree = useMemo(() => buildTree(), [menuItems])
    const [expanded, setExpanded] = useState<Record<string, boolean>>({})

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)
    const [deleteConfirmed, setDeleteConfirmed] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [stats, setStats] = useState({ subMenus: 0, articles: 0 })

    // Lock State
    const [isLocked, setIsLocked] = useState(true)
    const [passwordInput, setPasswordInput] = useState('')
    const [lockError, setLockError] = useState('')
    const [userEmail, setUserEmail] = useState('')

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user?.email) setUserEmail(data.user.email)
        })
    }, [])

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userEmail) {
            setLockError('Could not verify user identity')
            return
        }

        const { error } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: passwordInput
        })

        if (!error) {
            setIsLocked(false)
            setLockError('')
        } else {
            setLockError('Incorrect password')
        }
    }

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const handleDeleteClick = async (item: MenuItem) => {
        setItemToDelete(item)
        setDeleteConfirmed(false)

        // Calculate impact
        const descendants = getAllDescendants(item)
        const paths = [item.path, ...descendants.map(d => d.path)].filter(Boolean) as string[]

        // Count articles
        const { count } = await supabase
            .from('articles')
            .select('*', { count: 'exact', head: true })
            .in('path', paths)

        setStats({
            subMenus: descendants.length,
            articles: count || 0
        })

        setDeleteModalOpen(true)
    }

    const getAllDescendants = (item: MenuItem): MenuItem[] => {
        const children = menuItems.filter(m => m.parent_id === item.id)
        let descendants = [...children]
        children.forEach(child => {
            descendants = [...descendants, ...getAllDescendants(child)]
        })
        return descendants
    }

    const executeDelete = async () => {
        if (!itemToDelete) return
        setDeleting(true)

        try {
            const descendants = getAllDescendants(itemToDelete)
            const allItems = [itemToDelete, ...descendants]
            const allIds = allItems.map(i => i.id)
            const allPaths = allItems.map(i => i.path).filter(Boolean) as string[]

            // 1. Delete associated articles
            if (allPaths.length > 0) {
                const { error: articleError } = await supabase
                    .from('articles')
                    .delete()
                    .in('path', allPaths)
                if (articleError) throw articleError
            }

            // 2. Delete menu items
            const { error: menuError } = await supabase
                .from('menu_items')
                .delete()
                .in('id', allIds)
            if (menuError) throw menuError

            alert('Deleted successfully')
            setDeleteModalOpen(false)
            reload()
        } catch (error: any) {
            alert('Error deleting: ' + error.message)
        } finally {
            setDeleting(false)
        }
    }

    const renderNode = (node: MenuItem & { children?: MenuItem[] }, depth = 0) => {
        const hasChildren = node.children && node.children.length > 0
        const isExpanded = expanded[node.id]

        return (
            <div key={node.id} className="select-none">
                <div
                    className={`flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors ${depth > 0 ? 'ml-6' : ''}`}
                >
                    <button
                        onClick={() => toggleExpand(node.id)}
                        className={`p-1 rounded hover:bg-white/10 text-zinc-400 ${!hasChildren ? 'opacity-0 cursor-default' : ''}`}
                    >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    <div className="flex-1 flex items-center gap-3">
                        {hasChildren ? <Folder size={16} className="text-blue-400" /> : <FileText size={16} className="text-zinc-500" />}
                        <span className="text-sm text-zinc-200">{node.label}</span>
                        <span className="text-xs text-zinc-600 font-mono">{node.path}</span>
                    </div>

                    <button
                        onClick={() => handleDeleteClick(node)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>

                {hasChildren && isExpanded && (
                    <div className="border-l border-white/5 ml-5">
                        {node.children!.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        )
    }

    if (loading) return <div className="p-8 text-white">Loading menu...</div>

    if (isLocked) {
        return (
            <div className="p-8 max-w-md mx-auto mt-20">
                <div className="bg-[#0e0f12] border border-white/10 rounded-xl p-8 shadow-2xl text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Restricted Area</h2>
                    <p className="text-zinc-400 mb-6">Enter admin password to manage menu structure.</p>

                    <form onSubmit={handleUnlock} className="space-y-4">
                        <input
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="Enter password"
                            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                            autoFocus
                        />
                        {lockError && <p className="text-red-500 text-sm">{lockError}</p>}
                        <button
                            type="submit"
                            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Unlock
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Menu Manager</h1>

            <div className="bg-[#0e0f12] border border-white/10 rounded-xl p-4">
                {menuTree.map(node => renderNode(node))}
                {menuTree.length === 0 && (
                    <div className="text-center text-zinc-500 py-8">No menu items found</div>
                )}
            </div>

            {/* Strict Delete Confirmation Modal */}
            <Dialog.Root open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1a1b1e] border border-red-500/30 rounded-xl p-6 shadow-2xl z-50">
                        <div className="flex items-center gap-3 text-red-500 mb-4">
                            <div className="p-2 bg-red-500/10 rounded-full">
                                <AlertTriangle size={24} />
                            </div>
                            <h2 className="text-xl font-bold">Delete Menu Item?</h2>
                        </div>

                        <div className="space-y-4 mb-6">
                            <p className="text-zinc-300">
                                You are about to delete <span className="font-bold text-white">{itemToDelete?.label}</span>.
                            </p>

                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-2">
                                <p className="text-red-200 font-medium text-sm">This action will permanently delete:</p>
                                <ul className="list-disc list-inside text-sm text-red-300/80">
                                    <li>The menu item itself</li>
                                    <li>{stats.subMenus} sub-menu items</li>
                                    <li>{stats.articles} associated articles</li>
                                </ul>
                            </div>

                            <label className="flex items-start gap-3 p-3 border border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={deleteConfirmed}
                                    onChange={(e) => setDeleteConfirmed(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded border-zinc-600 bg-transparent text-red-500 focus:ring-red-500 focus:ring-offset-0"
                                />
                                <span className="text-sm text-zinc-400">
                                    I understand that this action cannot be undone and will delete all related content.
                                </span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDelete}
                                disabled={!deleteConfirmed || deleting}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {deleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    )
}
