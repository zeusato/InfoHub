import { LeafPayload } from '@/components/SidebarMenu'
import contentJson from '@/data/leafContent.json'
import ProductNewsTemplate from './ProductNewsTemplate'
import Placeholder from './Placeholder'
import TemplateFeatureGuide from './TemplateFeatureGuide'
import FAQAccordionTemplate from './FAQAccordionTemplate'
import CafeBizList from '@/components/news/CafeBizList'
import CafeBizDetail from '@/components/news/CafeBizDetail'
import type { RssItem } from '@/components/news/CafeBizList'

export function ContentHost({
  activeLeaf,
  setActiveLeaf
}: {
  activeLeaf: LeafPayload | null,
  setActiveLeaf: (leaf: LeafPayload | null) => void
}) {
  if (!activeLeaf) {
    return <div className="h-full w-full flex items-center justify-center text-zinc-400">
      Chọn mục ở menu bên trái để bắt đầu.
    </div>
  }

  // Handle CafeBiz custom paths
  if (activeLeaf.path === 'cafebiz/list') {
    return (
      <CafeBizList
        onBack={() => setActiveLeaf(null)}
        onOpenDetail={(item: RssItem) => setActiveLeaf({
          id: 'cafebiz-detail',
          label: item.title,
          path: 'cafebiz/detail',
          item
        })}
        storageKey="rss:cafebiz:home"
      />
    )
  }

  if (activeLeaf.path === 'cafebiz/detail' && (activeLeaf as any).item) {
    return (
      <CafeBizDetail
        item={(activeLeaf as any).item}
        onBack={() => setActiveLeaf({ id: 'cafebiz-list', label: 'Danh sách CaféBiz', path: 'cafebiz/list' })}
      />
    )
  }

  const entry = (contentJson as any)[activeLeaf.path]

  // Hybrid: template vs component
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
