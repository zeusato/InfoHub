// Hook to load menu tree from Supabase
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type MenuItem = {
    id: string
    label: string
    path: string | null
    parent_id: string | null
    order_index: number
    level: number
    active: boolean
}

export function useMenuTree() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadMenu()
    }, [])

    const loadMenu = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('order_index')

        if (!error && data) {
            setMenuItems(data)
        }
        setLoading(false)
    }

    // Build tree structure
    const buildTree = (parentId: string | null = null): MenuItem[] => {
        return menuItems
            .filter(item => item.parent_id === parentId)
            .map(item => ({
                ...item,
                children: buildTree(item.id)
            }))
    }

    return { menuItems, loading, buildTree, reload: loadMenu }
}
