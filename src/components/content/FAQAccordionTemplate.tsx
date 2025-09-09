import React, { useEffect, useMemo, useState } from 'react'

type FaqItem = {
  qNo: number | string
  question: string
  answer: string
}

type Props = {
  title: string
  subtitle?: string
  /** Đường dẫn tới JSON FAQ (đặt ở /public/faqs/...), ví dụ: "faqs/faq-giao-dich.json" hoặc "/faqs/faq-giao-dich.json" */
  faqJsonPath: string
  /** Giống phong cách template khác: dùng endingNote làm footer note */
  endingNote?: string
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-5 w-5 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export default function FAQAccordionTemplate({
  title,
  subtitle,
  faqJsonPath,
  endingNote,
}: Props) {
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openSet, setOpenSet] = useState<Set<string | number>>(new Set())

  // Bảo toàn đường dẫn khi deploy gh-pages (BASE_URL khác '/')
  const buildUrl = (path: string) => {
    if (!path) return ''
    if (/^https?:\/\//i.test(path)) return path
    const normalized = path.replace(/^\//, '') // bỏ leading slash
    try {
      return new URL(normalized, import.meta.env.BASE_URL).toString()
    } catch {
      return `/${normalized}`
    }
  }

  useEffect(() => {
    if (!faqJsonPath) {
      setError("Chưa cấu hình 'faqJsonPath' trong leaf content.")
      return
    }
    const url = resolveFaqUrl(faqJsonPath)    
    setLoading(true)
    setError(null)
    fetch(url, { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const data = await r.json()
        const list: FaqItem[] = Array.isArray(data?.faqs) ? data.faqs : []
        if (!list.length) throw new Error('Sai cấu trúc JSON hoặc không có mục FAQ.')
        setFaqs(list)
      })
      .catch((e: any) => setError(`Không tải được FAQ: ${e?.message || String(e)}`))
      .finally(() => setLoading(false))
  }, [faqJsonPath])

  const sortedFaqs = useMemo(() => {
    return [...faqs].sort((a, b) => {
      const na = Number(a.qNo)
      const nb = Number(b.qNo)
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
      return String(a.qNo).localeCompare(String(b.qNo))
    })
  }, [faqs])

    const resolveFaqUrl = (p: string) => {
    if (!p) return ''
    if (/^https?:\/\//i.test(p)) return p
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')  // dev: '' | build: '/InfoHub'
    const rel  = p.replace(/^\//, '')                                  // 'faqs/faq-giao-dich.json'
    return `${base}/${rel}`
    }


  const toggle = (id: string | number) => {
    setOpenSet((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <article className="prose prose-invert max-w-none">
      {/* Title & subtitle: giữ style giống ProductNewsTemplate */}
      <h1 className="text-3xl font-extrabold text-left">{title}</h1>
      {subtitle && <p className="text-sm text-zinc-400 mb-4">{subtitle}</p>}

      {/* States */}
      {loading && (
        <div className="rounded-xl border border-white/10 p-4 text-sm opacity-80">
          Đang tải FAQ…
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Accordion */}
      {sortedFaqs.length > 0 && (
        <div className="divide-y divide-white/10 rounded-2xl">
          {sortedFaqs.map((item) => {
            const id = item.qNo ?? item.question
            const open = openSet.has(id)
            return (
              <div key={String(id)} className="p-0 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggle(id)}
                  aria-expanded={open}
                  aria-controls={`faq-panel-${id}`}
                  className="flex w-full items-start gap-3 px-4 py-4 text-left bg-[#FD872F]/70 hover:bg-[#FD872F]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 sm:rounded-none"
                >
                  <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center border border-white px-1 text-xs opacity-80 text-white rounded-full">
                    {item.qNo}
                  </span>
                  <span className="flex-1 font-medium">{item.question}</span>
                  <Chevron open={open} />
                </button>

                <div
                  id={`faq-panel-${id}`}
                  role="region"
                  className={`grid transition-all bg-[#1092F2]/50 duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 my-4 pt-0 text-sm leading-relaxed opacity-90 whitespace-pre-line">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer note */}
      {endingNote && <div className="mt-6 italic text-zinc-400">{endingNote}</div>}
    </article>
  )
}
