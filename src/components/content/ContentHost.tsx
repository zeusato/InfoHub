// src/components/content/ContentHost.tsx
import { LeafPayload } from '@/components/SidebarMenu'
import contentJson from '@/data/leafContent.json'
import ProductNewsTemplate from './ProductNewsTemplate'
import Placeholder from './Placeholder'
import TemplateFeatureGuide from './TemplateFeatureGuide'
import FAQAccordionTemplate from './FAQAccordionTemplate'

// === NEW: generic RSS components ===
import RssList from '@/components/news/RssList'
import RssDetail from '@/components/news/RssDetail'
import { RSS_SOURCES, type RssItem } from '@/components/news/RssFetcher'

export function ContentHost({
  activeLeaf,
  setActiveLeaf
}: {
  activeLeaf: LeafPayload | null,
  setActiveLeaf: (leaf: LeafPayload | null) => void
}) {
  if (!activeLeaf) {
    return (
      <div className="h-full w-full flex items-center justify-center text-zinc-400">
        Chọn mục ở menu bên trái để bắt đầu.
      </div>
    )
  }

  // -------------------------
  // Multi-source RSS routing
  // Hỗ trợ:
  //  - Legacy: "cafebiz/list" & "cafebiz/detail"
  //  - New:    "news/<source>/list" & "news/<source>/detail"
  // -------------------------
  const path = activeLeaf.path || ''

  // Helper lấy source & mode từ path
  const parseNewsRoute = (p: string):
    | { kind: 'list', source: keyof typeof RSS_SOURCES }
    | { kind: 'detail', source: keyof typeof RSS_SOURCES }
    | null => {

    // Legacy CaféBiz
    if (p === 'cafebiz/list') return { kind: 'list', source: 'cafebiz' as const }
    if (p === 'cafebiz/detail') return { kind: 'detail', source: 'cafebiz' as const }

    // New pattern: news/<source>/list|detail
    if (p.startsWith('news/')) {
      const segs = p.split('/')
      // expect: ['news', '<source>', 'list'|'detail']
      if (segs.length >= 3) {
        const src = segs[1] as keyof typeof RSS_SOURCES
        const mode = segs[2]
        if (src in RSS_SOURCES) {
          if (mode === 'list') return { kind: 'list', source: src }
          if (mode === 'detail') return { kind: 'detail', source: src }
        }
      }
    }
    return null
  }

  const newsRoute = parseNewsRoute(path)

  if (newsRoute?.kind === 'list') {
    const { source } = newsRoute
    const initialPage = (activeLeaf as any)?.page ?? 1

    return (
      <RssList
        source={source}
        initialPage={initialPage}
        onBack={() => setActiveLeaf(null)} // quay về Workspace default (Sources panel)
        onOpenDetail={(item: RssItem, page: number) => {
          // Khi mở Detail, set lại leaf kèm page để khi Back quay đúng trang
          const legacy = path === 'cafebiz/list'
          setActiveLeaf({
            id: `${source}-detail`,
            label: item.title,
            path: legacy ? 'cafebiz/detail' : `news/${source}/detail`,
            item,
            page
          } as any)
        }}
      />
    )
  }

  if (newsRoute?.kind === 'detail' && (activeLeaf as any).item) {
    const { source } = newsRoute
    const page = (activeLeaf as any)?.page ?? 1
    const item = (activeLeaf as any).item as RssItem
    const sourceLabel = RSS_SOURCES[source]?.label ?? 'News'

    return (
      <RssDetail
        item={item}
        sourceLabel={sourceLabel}
        onBack={() => {
          const legacy = path === 'cafebiz/detail'
          setActiveLeaf({
            id: `${source}-list`,
            label: `Danh sách ${sourceLabel}`,
            path: legacy ? 'cafebiz/list' : `news/${source}/list`,
            page
          } as any)
        }}
      />
    )
  }

  // -------------------------
  // Template-based rendering
  // -------------------------
  const entry = (contentJson as any)[activeLeaf.path]

  if (entry?.renderType === 'template') {
    switch (entry.templateKey) {
      case 'ProductNews':
        return <ProductNewsTemplate {...entry} />

      case 'FeatureGuide':
        return (
          <TemplateFeatureGuide
            title={entry.title}
            subtitle={entry.subtitle}
            gallery={(entry.gallery || []).map((src: string) => ({ src }))}
            contentBlocks={Array.isArray(entry.content) ? entry.content : undefined}
            contentHtml={typeof entry.contentHtml === 'string' ? entry.contentHtml : undefined}
            endingNote={entry.endingNote}
          />
        )

      case 'FAQAccordion':
        return (
          <FAQAccordionTemplate
            title={entry.title}
            subtitle={entry.subtitle}
            faqJsonPath={entry.faqJsonPath}
            endingNote={entry.endingNote}
          />
        )

      default:
        return <Placeholder title={activeLeaf.label} path={activeLeaf.path} />
    }
  }

  // (Dành cho tương lai) renderType === 'component' thì lazy-load TSX riêng
  // if (entry?.renderType === 'component') { ... }

  // Fallback nếu chưa có data
  return <Placeholder title={activeLeaf.label} path={activeLeaf.path} />
}
