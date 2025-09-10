import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { GridBackground } from '../components/lightswind/grid-dot-backgrounds'
import SmokeyCursor from '@/components/lightswind/smokey-cursor'
import { useEffect } from "react"

export default function Intro() {
  const navigate = useNavigate()
  useEffect(() => {
    // Khi Intro mount → chặn cuộn
    document.body.style.overflow = "hidden"

    // Khi rời Intro → trả lại
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  return (
    <GridBackground 
      gridSize={20}
      gridColor="#e4e4e7"
      darkGridColor="#262626"
      showFade={true}
      fadeIntensity={20}
      className="h-full w-full"
    >
      <div className="min-h-screen w-screen relative overflow-hidden">
        {/* gradient glow */}
        <div
          className="pointer-events-none absolute -z-10 -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(closest-side, rgba(255,122,24,0.35), rgba(255,122,24,0.08), transparent)' }}
        />

        {/* Header (brand only) */}
        <header className="w-full px-6 pt-10 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight">
            <span className="text-brand">Info</span>Hub
          </div>
          <div></div>
          <div></div>
        </header>

        {/* Hero */}
        <main className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Cổng thông tin của <span className="text-brand">SHS</span>
          </h1>
          <p className="mt-5 max-w-2xl text-zinc-400">
            Nơi tập trung tin tức, hướng dẫn sử dụng, và các nội dung vận hành.
          </p>

          {/* Single primary CTA button in center */}
          {/* <Link to="/app"> */}
            <button
              onClick={() => navigate('/app')}
              className="mt-10 inline-flex items-center gap-2 rounded-2xl px-8 py-4 border border-brand/60 bg-brand/50 text-white font-semibold transition
                        hover:shadow-neon hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-brand/60 brand-glow"
            >
              Vào màn thao tác
            </button>
          {/* </Link> */}
        </main>

        {/* Footer pinned near bottom */}
        <footer className="absolute bottom-4 left-0 right-0">
          <div className="max-w-screen mx-auto px-6 text-sm text-zinc-500">
            © {new Date().getFullYear()} SHS — InfoHub
          </div>
        </footer>
        <SmokeyCursor />
      </div>
    </GridBackground>
  )
}
