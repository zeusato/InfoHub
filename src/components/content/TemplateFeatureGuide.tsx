import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type ContentBlock =
  | { type: 'paragraph'; text?: string }
  | { type: 'table'; headers?: string[]; rows?: string[][] }

export type FeatureGuideProps = {
  title: string
  subtitle?: string
  gallery: Array<{ src: string; alt?: string; caption?: string }>
  contentHtml?: string
  contentBlocks?: ContentBlock[]
  endingNote?: string
  /** Min height for the viewport (px). Port width auto-co giãn theo ảnh. */
  minViewportHeight?: number // default 500
}

function Blocks({ blocks }: { blocks?: ContentBlock[] }) {
  if (!blocks?.length) return null
  return (
    <div className="prose prose-invert max-w-none">
      {blocks.map((b, i) => {
        if (b.type === 'paragraph') return <p key={i} className="leading-relaxed">{b.text}</p>
        if (b.type === 'table') {
          return (
            <div key={i} className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse text-sm">
                {b.headers?.length ? (
                  <thead>
                    <tr>
                      {b.headers.map((h, j) => (
                        <th key={j} className="border-b border-white/10 px-3 py-2 text-left font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                ) : null}
                <tbody>
                  {(b.rows || []).map((row, r) => (
                    <tr key={r} className="even:bg-white/[0.03]">
                      {row.map((cell, c) => (
                        <td key={c} className="border-b border-white/5 px-3 py-2 align-top whitespace-pre-wrap">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

export default function TemplateFeatureGuide(props: FeatureGuideProps) {
  const {
    title,
    subtitle,
    gallery,
    contentHtml,
    contentBlocks,
    endingNote,
    minViewportHeight = 500,
  } = props

  const [idx, setIdx] = useState(0)

  const [displayW, setDisplayW] = useState<number | undefined>(undefined)
  const [displayH, setDisplayH] = useState<number>(minViewportHeight)
  const [containerH, setContainerH] = useState<number>(minViewportHeight)

  const imgRef = useRef<HTMLImageElement | null>(null)
  const frameRef = useRef<HTMLDivElement | null>(null) // khung 100% để đo maxPortW

  const hasGallery = !!(gallery && gallery.length)
  const total = gallery?.length ?? 0
  const current = gallery?.[idx]

  const fitToPort = useCallback(() => {
    const img = imgRef.current
    const frame = frameRef.current
    if (!img || !frame) return

    const naturalW = img.naturalWidth || img.width || 1
    const naturalH = img.naturalHeight || img.height || 1

    // maxPortW = chiều rộng có thể dùng (chiều rộng cha)
    const maxPortW = frame.clientWidth || window.innerWidth || naturalW

    // Ảnh không vượt quá port → width = min(naturalW, maxPortW)
    const w = Math.min(naturalW, maxPortW)
    const scale = w / naturalW
    const h = Math.max(minViewportHeight, Math.round(naturalH * scale))

    setDisplayW(w)
    setDisplayH(h)
    setContainerH(h)
  }, [minViewportHeight])

  // Refit khi ảnh đổi / load
  useEffect(() => {
    const img = imgRef.current
    if (!img) return
    const handler = () => fitToPort()

    if (img.complete && img.naturalWidth && img.naturalHeight) {
      handler()
    } else {
      img.addEventListener('load', handler, { once: true })
      return () => img.removeEventListener('load', handler)
    }
  }, [idx, current?.src, fitToPort])

  // Refit khi resize cửa sổ
  useEffect(() => {
    const onResize = () => fitToPort()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [fitToPort])

  const go = (n: number) => {
    if (!total) return
    setIdx((i) => (i + n + total) % total)
  }

  const Indicators = () => (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 text-white backdrop-blur-md shadow-md text-sm font-medium border border-white/10">
      <span>{idx + 1} / {total}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle ? <div className="text-sm md:text-base text-[var(--text-secondary)]">{subtitle}</div> : null}
      </div>

      {/* Gallery */}
      {hasGallery ? (
        <div className="relative rounded-2xl border border-[var(--border-color)] bg-[var(--bg-glass)]">
          {/* Controls */}
          <div className="absolute top-1/2 -translate-y-1/2 left-3 right-3 z-10 flex justify-between pointer-events-none">
            <button 
              className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-900 border border-gray-200/50 shadow-lg backdrop-blur-md transition-all dark:bg-gray-900/80 dark:hover:bg-gray-900 dark:text-gray-100 dark:border-gray-700/50 dark:shadow-black/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              onClick={() => go(-1)} 
              title="Ảnh trước"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-900 border border-gray-200/50 shadow-lg backdrop-blur-md transition-all dark:bg-gray-900/80 dark:hover:bg-gray-900 dark:text-gray-100 dark:border-gray-700/50 dark:shadow-black/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              onClick={() => go(1)} 
              title="Ảnh sau"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Frame (w-full để đo được giới hạn; port sẽ co theo ảnh) */}
          <div ref={frameRef} className="w-full px-0 py-0">
            {/* Viewport: inline-block để width co giãn theo ảnh */}
            <div
              className="overflow-hidden rounded-2xl select-none inline-block"
              style={{ width: displayW, height: containerH }}
            >
              {/* Ảnh bám trái, không zoom/pan */}
              <img
                ref={imgRef}
                src={current?.src}
                alt={current?.alt || `Slide ${idx + 1}`}
                className="block shadow-lg object-contain"
                style={{
                  width: displayW,
                  maxHeight: displayH,
                }}
                draggable={false}
              />

            </div>
          </div>

          {/* Caption */}
          {current?.caption ? (
            <div className="px-4 py-3 text-sm text-[var(--text-secondary)] border-t border-[var(--border-color)]">{current.caption}</div>
          ) : null}

          <Indicators />
        </div>
      ) : null}

      {/* Text content (optional) */}
      {contentBlocks && <Blocks blocks={contentBlocks} />}
      {contentHtml && (
        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      )}

      {/* Ending note */}
      {endingNote ? (
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-glass)] px-4 py-3 text-sm">
          {endingNote}
        </div>
      ) : null}
    </div>
  )
}
