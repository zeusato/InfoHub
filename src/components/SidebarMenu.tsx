// src/components/SidebarMenu.tsx
import { useMemo, useState } from 'react'
import { MENU_COLORS, MenuNode } from '@/lib/menuData'

export type LeafPayload = {
  id: string
  label: string
  path: string
}

type Props = {
  menu: MenuNode[]
  onLeafSelect: (leaf: LeafPayload) => void
}

export default function SidebarMenu({ menu, onLeafSelect }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // Build parent & depth maps to control accordion by level
  const { parentOf, depthOf, topAncestorOf } = useMemo(() => {
    const parentOf: Record<string, string | null> = {}
    const depthOf: Record<string, number> = {}
    const topAncestorOf: Record<string, string> = {}

    const walk = (nodes: MenuNode[], parent: string | null, depth: number, top?: string) => {
      for (const n of nodes) {
        parentOf[n.id] = parent
        depthOf[n.id] = depth
        const topId = depth === 0 ? n.id : (top ?? (parent ? topAncestorOf[parent] : n.id))
        topAncestorOf[n.id] = topId
        if (n.children?.length) walk(n.children, n.id, depth + 1, topId)
      }
    }
    walk(menu, null, 0)
    return { parentOf, depthOf, topAncestorOf }
  }, [menu])

  // Toggle logic:
  // - Level 0: exclusive (accordion toàn cục). Mở nhánh khác -> đóng sạch nhánh cũ, chỉ mở level 0 mới.
  // - Level >=1: sibling-exclusive trong cùng parent. Không ảnh hưởng các top-level khác đang mở.
  const toggleBranch = (id: string) =>
    setExpanded(prev => {
      const isOpen = !!prev[id]
      const depth = depthOf[id] ?? 0

      if (depth === 0) {
        // Top-level: nếu mở nhánh khác -> reset sạch, chỉ giữ id này mở
        if (isOpen) return {}               // click lại để đóng hết
        return { [id]: true }               // mở nhánh top mới, không giữ child cũ
      }

      // Middle/leaf-branch: sibling-exclusive theo cùng parent
      const parent = parentOf[id]
      const next: Record<string, boolean> = {}

      // Giữ mọi expansion hiện tại TRỪ các anh em cùng parent & cùng depth với id
      for (const k of Object.keys(prev)) {
        const sameParent = parentOf[k] === parent
        const sameDepth = (depthOf[k] ?? 0) === depth
        if (sameParent && sameDepth) continue // bỏ anh em
        next[k] = prev[k]
      }

      if (!isOpen) next[id] = true
      return next
    })

  const collapseAll = () => setExpanded({})

  const header = (
    <div className="flex items-center justify-between p-3 border-b border-white/10">
      <div className="font-bold">
        <span className="text-brand">Info</span>Hub
      </div>
      <button
        className="px-2 py-1 rounded-lg border border-white/10 hover:border-brand/50 hover:text-brand transition"
        onClick={collapseAll}
        title="Thu gọn"
      >
        ☰
      </button>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {header}
      <div className="flex-1 overflow-auto px-2 py-2 w-full">
        {menu.map((item) => (
          <MenuBranch
            key={item.id}
            node={item}
            depth={0}
            expanded={expanded}
            onToggle={(id) => toggleBranch(id)}
            onLeafSelect={onLeafSelect}
          />
        ))}
      </div>
    </div>
  )
}

function MenuBranch({
  node,
  depth,
  expanded,
  onToggle,
  onLeafSelect,
}: {
  node: MenuNode
  depth: number
  expanded: Record<string, boolean>
  onToggle: (id: string) => void
  onLeafSelect: (leaf: LeafPayload) => void
}) {
  const isLeaf = !node.children || node.children.length === 0
  const open = expanded[node.id]
  const color = MENU_COLORS[depth] ?? 'border-white/15 bg-white/5'
  const indentPx = Math.min(depth, 3) * 12; // tối đa 36px

  const bullet = (
    <span
      className={`inline-block h-2 w-2 rounded-full mr-2 ${
        depth === 0 ? 'bg-brand'
        : depth === 1 ? 'bg-emerald-400'   // tầng 2 (xanh lá)
        : depth === 2 ? 'bg-cyan-400'      // tầng 3 (xanh dương)
        : 'bg-purple-400'                  // tầng 4 (tím)
      }`}
    />
  )
  if (isLeaf) {
    return (
      <button
        onClick={() =>
          onLeafSelect({ id: node.id, label: node.label, path: node.path ?? node.id })
        }
        className={`w-full text-left my-1 px-3 py-2 rounded-xl border ${color} hover:border-brand/60 hover:bg-brand/10 transition`}
      >
        <div className="flex items-center">
          {bullet}
          <span className="truncate">{node.label}</span>
        </div>
      </button>
    )
  }

  return (
    <div className="my-1" style={{ paddingLeft: indentPx }}>
      <button
        onClick={() => onToggle(node.id)}
        className={`w-full text-left px-3 py-2 rounded-xl border ${color} hover:border-brand/60 hover:bg-brand/10 transition`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {bullet}
            <span className="font-semibold">{node.label}</span>
          </div>
          <span className="opacity-70">{open ? '−' : '+'}</span>
        </div>
      </button>

      {open && node.children && (
      <div className="mt-1 space-y-1">
        {node.children.map((child) => (
          <div key={child.id}>
            <MenuBranch
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              onLeafSelect={onLeafSelect}
            />
          </div>
        ))}
      </div>
    )}
  </div>
)}
