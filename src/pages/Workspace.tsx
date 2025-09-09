import { useState } from 'react'
import BannerCarousel from '@/components/BannerCarousel'
import SidebarMenu, { LeafPayload } from '@/components/SidebarMenu'
import Footer from '@/components/Footer'
import { ContentHost } from '@/components/content/ContentHost'
import { MENU } from '@/lib/menuData'
import logo from '@/assets/LOGO.png'
import { Link } from 'react-router-dom'
import { BorderBeam } from "@/components/lightswind/border-beam"

export default function Workspace() {
  const [activeLeaf, setActiveLeaf] = useState<LeafPayload | null>(null)

  return (
    <div className="min-h-screen bg-[var(--bg)] text-zinc-200 flex flex-col">
    {/* Top row: Logo block + Banner block */}
    <div className="px-3 pt-3 p-3"> {/* dùng px-3 để canh lề khớp với dưới */}      
      <div className="grid grid-cols-[300px_1fr] gap-3">
        {/* Khối Logo (thẻ riêng) */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] shadow-inner relative">        
          <BorderBeam 
          colorFrom="#7400ff" 
          colorTo="#9b41ff" 
          size={100}
          duration={6}
          borderThickness={2}
          glowIntensity={0}
          />
          <Link to="/Intro">
            <div className="h-full grid place-items-center px-4">              
              <img
                src={logo} // đặt ảnh tại src/assets/LOGO.png
                alt="SHS Logo"
                className="h-full p-10 w-auto object-contain"
              />
            </div>
          </Link>
        </div>

        {/* Khối Banner (thẻ riêng) */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
          {/* nếu BannerCarousel đã tự bo góc, bỏ rounded trong nó đi để tránh “2 lần bo” */}
          <BannerCarousel />
        </div>
      </div>
    </div>
    
      {/* Main area */}
      <div className="flex-1 grid grid-cols-[300px_1fr] gap-3 p-3 pt-0">
        {/* Sidebar */}
        <aside className="glass rounded-2xl overflow-hidden">
          <SidebarMenu
            menu={MENU}
            onLeafSelect={(leaf) => setActiveLeaf(leaf)}
          />
        </aside>

        {/* Content area */}
        <section className="glass rounded-2xl p-4 overflow-auto relative">
          <ContentHost activeLeaf={activeLeaf} />
        </section>
      </div>

      {/* Footer */}
      <div className="p-3 pt-0">
        <Footer />
      </div>
    </div>
  )
}
