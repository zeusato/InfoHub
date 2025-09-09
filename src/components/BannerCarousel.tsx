// src/components/BannerCarousel.tsx
import { useEffect, useMemo, useState } from 'react'
import slidesJson from '@/data/slides.json'

type Slide = {
  id: string
  title: string
  desc: string
  img: string   // tên file trong src/assets
  link: string  // link nội/ngoại
}

export default function BannerCarousel() {
  const [idx, setIdx] = useState(0)

  const slides: (Slide & { imgUrl: string })[] = useMemo(() => {
    const list = (slidesJson as Slide[]).map(s => ({
      ...s,
      imgUrl: new URL(`../assets/${s.img}`, import.meta.url).href,
    }))
    return list
  }, [])

  useEffect(() => {
    const t = setInterval(() => setIdx(v => (v + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [slides.length])

  if (slides.length === 0) return null
  const cur = slides[idx]
  const isExternal = cur.link.startsWith('http')

  return (
    <div className="relative h-36 md:h-40 lg:h-48 w-full overflow-hidden rounded-2xl">
      {/* Ảnh nền phủ toàn khung, được mask để mờ dần về bên trái */}
      <img
        src={cur.imgUrl}
        alt={cur.title}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          // ảnh rõ ở bên phải (đen = opaque), mờ dần về bên trái (transparent)
          WebkitMaskImage: 'linear-gradient(to left, black 60%, transparent 92%)',
          maskImage: 'linear-gradient(to left, black 60%, transparent 92%)',
        }}
      />

      {/* Panel trái: nền cam gradient đậm -> nhạt -> trong suốt để blend với ảnh */}
      <div
        className="absolute inset-y-0 left-0 w-[46%] min-w-[280px]"
        style={{
          background:
            'linear-gradient(90deg, rgba(255,122,24,0.35) 0%, rgba(255,122,24,0.20) 45%, rgba(255,122,24,0.08) 70%, rgba(255,122,24,0) 100%)',
        }}
      />

      {/* Overlay tối rất nhẹ toàn khung để chữ dễ đọc (không glow) */}
      <div className="absolute inset-0 bg-black/15" />

      {/* Nội dung (nằm trong panel trái) */}
      <a
        href={cur.link}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="absolute inset-y-0 left-0 w-[46%] min-w-[280px] p-5 flex flex-col justify-center text-left focus:outline-none"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 text-zinc-200 text-xs w-max">
          Tin nổi bật
        </div>
        <h3 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-100">
          {cur.title}
        </h3>
        <p className="text-zinc-300 mt-1">{cur.desc}</p>
      </a>

      {/* Dots điều hướng */}
      <div className="absolute bottom-3 right-5 flex gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIdx(i)}
            className={`h-2.5 rounded-full transition-all ${i === idx ? 'w-6 bg-brand' : 'w-2.5 bg-white/40'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
