// src/components/TemplateVideoEmbed.tsx
import React from 'react'

type ContentBlock =
  | { type: 'paragraph'; text?: string }
  | { type: 'table'; headers?: string[]; rows?: string[][] }

export type VideoTemplateProps = {
  title: string
  subtitle?: string
  videoUrl: string
  contentHtml?: string
  contentBlocks?: ContentBlock[]
  endingNote?: string
}

/** Parse nhiều dạng URL YouTube → embed src (ưu tiên youtube-nocookie) */
function toYouTubeEmbedSrc(input: string): string | null {
  try {
    const url = new URL(input)
    const host = url.hostname.replace(/^www\./, '')
    const params = url.searchParams

    // Lấy start time nếu có
    let start = 0
    if (params.has('t')) {
      const t = params.get('t') || '0'
      // "1m20s" | "80" → đổi sang giây
      const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(t)
      if (m) {
        const h = parseInt(m[1] || '0', 10)
        const mm = parseInt(m[2] || '0', 10)
        const s = parseInt(m[3] || '0', 10)
        start = h * 3600 + mm * 60 + s
      } else {
        start = parseInt(t, 10) || 0
      }
    } else if (params.has('start')) {
      start = parseInt(params.get('start') || '0', 10) || 0
    }

    const startQS = start > 0 ? `?start=${start}&rel=0` : `?rel=0`

    // Các biến thể phổ biến
    // https://youtu.be/VIDEO_ID
    if (host === 'youtu.be') {
      const id = url.pathname.replace('/', '')
      return id ? `https://www.youtube-nocookie.com/embed/${id}${startQS}` : null
    }

    // https://youtube.com/watch?v=VIDEO_ID
    if (host.endsWith('youtube.com')) {
      // /watch?v=...
      if (url.pathname === '/watch' && params.get('v')) {
        return `https://www.youtube-nocookie.com/embed/${params.get('v')}${startQS}`
      }
      // /embed/VIDEO_ID (giữ nguyên id)
      if (url.pathname.startsWith('/embed/')) {
        return `https://www.youtube-nocookie.com${url.pathname}${startQS}`
      }
      // /shorts/VIDEO_ID
      if (url.pathname.startsWith('/shorts/')) {
        const id = url.pathname.split('/')[2]
        return id ? `https://www.youtube-nocookie.com/embed/${id}${startQS}` : null
      }
    }

    // Nếu là URL đã có /embed/ nhưng domain lạ → vẫn cố dùng
    if (url.pathname.includes('/embed/')) {
      return `https://${host}${url.pathname}${startQS}`
    }
    return null
  } catch {
    // Nếu không phải URL hợp lệ, thử coi như đã là src embed sẵn
    if (input.includes('/embed/')) return input
    return null
  }
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

export default function TemplateVideoEmbed({
  title,
  subtitle,
  videoUrl,
  contentHtml,
  contentBlocks,
  endingNote
}: VideoTemplateProps) {
  const embedSrc = toYouTubeEmbedSrc(videoUrl)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle ? <div className="text-sm md:text-base text-white/70">{subtitle}</div> : null}
      </div>

      {/* Video frame (16:9 responsive) */}
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
        <div className="relative w-full pt-[56.25%]"> {/* 16:9 */}
          {embedSrc ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={embedSrc}
              title={title || 'YouTube video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm p-6">
              Không nhận diện được URL YouTube hợp lệ. Kiểm tra lại trường <code>videoUrl</code>.
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {contentHtml
        ? <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        : <Blocks blocks={contentBlocks} />}

      {/* Footer note */}
      {endingNote ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
          {endingNote}
        </div>
      ) : null}
    </div>
  )
}
