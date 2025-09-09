import React, { useEffect, useRef, useState } from 'react'

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
  /** Viewport width/height (px). Default 1000 x 707. Adjust as needed. */
  viewportWidth?: number
  viewportHeight?: number
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
    viewportWidth = 1550,
    viewportHeight = 500,
  } = props

  const [idx, setIdx] = useState(0)
  const [imgW, setImgW] = useState(0)    // fitted width in px
  const [imgH, setImgH] = useState(0)    // fitted height in px
  const [zoom, setZoom] = useState(1)    // additional zoom factor over fitted size
  const [tx, setTx] = useState(0)        // pan X (px)
  const [ty, setTy] = useState(0)        // pan Y (px)
  const [isPanning, setIsPanning] = useState(false)
  const startRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const zoomRef = React.useRef(1)
  const txRef = React.useRef(0)
  const tyRef = React.useRef(0)

  const hasGallery = !!(gallery && gallery.length)
  const total = gallery?.length ?? 0
  const current = gallery?.[idx]

  // Compute base fit using dominant dimension (H vs W).
  // Rule: if ih >= iw -> scale = ch/ih ; else scale = cw/iw.
  const computeFit = (iw: number, ih: number, cw: number, ch: number) => {
    const scale = ih >= iw ? (ch / ih) : (cw / iw)
    return {
      w: Math.round(iw * scale),
      h: Math.round(ih * scale),
    }
  }

  const refit = () => {
    const img = imgRef.current
    const c = containerRef.current
    if (!img || !c) return
    const iw = img.naturalWidth || img.width
    const ih = img.naturalHeight || img.height
    const cw = viewportWidth
    const ch = viewportHeight
    const { w, h } = computeFit(iw, ih, cw, ch)
    setImgW(w)
    setImgH(h)
    setZoom(1)
    setTx(0)
    setTy(0)
  }

  React.useEffect(() => { zoomRef.current = zoom }, [zoom])
  React.useEffect(() => { txRef.current = tx }, [tx])
  React.useEffect(() => { tyRef.current = ty }, [ty])

  // Refit when image changes or idx changes
  useEffect(() => {
    // Try immediate refit; if natural sizes not ready, attach onload
    const img = imgRef.current
    if (!img) return
    const doRefit = () => refit()
    if (img.complete && img.naturalWidth && img.naturalHeight) {
      doRefit()
    } else {
      img.addEventListener('load', doRefit, { once: true })
      return () => img.removeEventListener('load', doRefit)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, current?.src, viewportWidth, viewportHeight])

  // Wheel zoom in container only; prevent page scroll
  // const onWheel = (e: React.WheelEvent) => {
  //   e.preventDefault()
  //   const rect = containerRef.current?.getBoundingClientRect()
  //   const mx = e.clientX - (rect?.left ?? 0)
  //   const my = e.clientY - (rect?.top ?? 0)
  //   const factor = e.deltaY > 0 ? 1 / 1.1 : 1.1
  //   // keep point under cursor stable
  //   setZoom((prev) => {
  //     const newZoom = Math.max(0.25, Math.min(8, Number((prev * factor).toFixed(3))))
  //     // translate adjust (relative to center)
  //     const cx = viewportWidth / 2
  //     const cy = viewportHeight / 2
  //     const ix = (mx - cx - tx) / prev
  //     const iy = (my - cy - ty) / prev
  //     const ntx = mx - cx - ix * newZoom
  //     const nty = my - cy - iy * newZoom
  //     setTx(ntx)
  //     setTy(nty)
  //     return newZoom
  //   })
  // }

  const onMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1.001) return
    setIsPanning(true)
    startRef.current = { x: e.clientX, y: e.clientY, tx, ty }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !startRef.current) return
    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y
    setTx(startRef.current.tx + dx)
    setTy(startRef.current.ty + dy)
  }
  const onMouseUp = () => {
    setIsPanning(false)
    startRef.current = null
  }

  const go = (n: number) => {
    if (!total) return
    setIdx((i) => (i + n + total) % total)
  }

  const reset = () => {
    setZoom(1)
    setTx(0)
    setTy(0)
  }

  const Indicators = () => (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur text-xs">
      <span>{idx + 1} / {total}</span>
    </div>
  )

  // === Wheel zoom trong viewport, KHÔNG scroll toàn trang ===
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handler = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const rect = el.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      // đổi độ “nhạy” zoom ở đây (1.1 = 10%)
      const factor = e.deltaY > 0 ? 1 / 1.1 : 1.1

      const prevZoom = zoomRef.current
      const prevTx = txRef.current
      const prevTy = tyRef.current
      const newZoom = Math.max(0.25, Math.min(8, +(prevZoom * factor).toFixed(3)))

      // giữ điểm dưới con trỏ cố định khi zoom
      const cx = el.clientWidth / 2
      const cy = el.clientHeight / 2
      const ix = (mx - cx - prevTx) / prevZoom
      const iy = (my - cy - prevTy) / prevZoom
      const ntx = mx - cx - ix * newZoom
      const nty = my - cy - iy * newZoom

      setZoom(newZoom)
      setTx(ntx)
      setTy(nty)
    }

    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler as any)
  }, [])


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle ? <div className="text-sm md:text-base text-white/70">{subtitle}</div> : null}
      </div>

      {/* Gallery */}
      {hasGallery ? (
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.04]">
          {/* Controls */}
          <div className="absolute top-3 right-3 z-10 flex gap-2">
            <button className="px-2 py-1 rounded-md border border-white/15 bg-black/40 hover:bg-black/60" onClick={() => go(-1)} title="Ảnh trước">←</button>
            <button className="px-2 py-1 rounded-md border border-white/15 bg-black/40 hover:bg-black/60" onClick={() => go(1)} title="Ảnh sau">→</button>
            <div className="mx-1 w-px bg-white/20" />
            <button className="px-2 py-1 rounded-md border border-white/15 bg-black/40 hover:bg-black/60" onClick={() => setZoom((z)=>Math.max(0.25, Number((z/1.1).toFixed(3))))} title="Thu nhỏ">−</button>
            <button className="px-2 py-1 rounded-md border border-white/15 bg-black/40 hover:bg-black/60" onClick={() => setZoom((z)=>Math.min(8, Number((z*1.1).toFixed(3))))} title="Phóng to">＋</button>
            <button className="px-2 py-1 rounded-md border border-white/15 bg-black/40 hover:bg-black/60" onClick={reset} title="Reset">Reset</button>
          </div>

          {/* Viewport */}
          <div
            ref={containerRef}
            className="overflow-hidden rounded-2xl select-none"
            style={{ width: viewportWidth, height: viewportHeight }}
            // onWheel={onWheel}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onMouseDown={onMouseDown}
          >
            <div className="grid place-items-center mr-4">
              <img
                ref={imgRef}
                src={current?.src}
                alt={current?.alt || `Slide ${idx + 1}`}
                className="shadow-lg"
                style={{
                  width: imgW || 'auto',
                  height: imgH || 'auto',
                  transform: `translate(${tx}px, ${ty}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: isPanning ? 'none' : 'transform 80ms ease-out',
                }}
                draggable={false}
              />
            </div>
          </div>

          {/* Caption */}
          {current?.caption ? (
            <div className="px-4 py-3 text-sm text-white/80 border-t border-white/10">{current.caption}</div>
          ) : null}

          {/* Indicator */}
          <Indicators />
        </div>
      ) : null}

      {/* Text content (optional) */}
      {contentHtml ? (
        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      ) : (
        <Blocks blocks={contentBlocks} />
      )}

      {/* Ending note */}
      {endingNote ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
          {endingNote}
        </div>
      ) : null}
    </div>
  )
}
