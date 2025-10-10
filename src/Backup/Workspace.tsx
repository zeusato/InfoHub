// src/pages/Workspace.tsx
import { useEffect, useState } from "react";
import BannerCarousel from "@/components/BannerCarousel";
import SidebarMenu from "@/components/SidebarMenu";
import Footer from "@/components/Footer";
import { ContentHost } from "@/components/content/ContentHost";
import { MENU } from "@/lib/menuData";
import logo from "@/assets/LOGO.png";
import { Link } from "react-router-dom";
import { BorderBeam } from "@/components/lightswind/border-beam";
import RotateOverlay from "@/components/RotateOverlay";
import { GlowingCards, GlowingCard } from "@/components/lightswind/glowing-cards";
import ShinyText from "@/components/lightswind/shiny-text";
import MGReferralQRCard from "@/components/tools/MGReferralQRCard";
import QrApp from "@/assets/qr-app.jpg";
import NeonAnimatedButton from "@/components/tools/NeonAnimatedButton";
import IPO from "@/assets/IPO.png";

import RssFetcher from "@/components/news/RssFetcher";
import RssSourcesPanel from "@/components/news/RssSourcesPanel";
import cafebizLogo from "@/assets/cafebiz.jpg";
import vietstockLogo from "@/assets/vietstock.jpg";

type LeafPayload = Parameters<typeof ContentHost>[0]["activeLeaf"];

export default function Workspace() {
  const [activeLeaf, setActiveLeaf] = useState<LeafPayload | null>(null);

  // Khi ở màn default (activeLeaf === null) → check RSS TTL
  const checkToken = activeLeaf === null ? Date.now() : 0;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-zinc-200 flex flex-col">
      {/* Fetcher (ẩn) */}
      <RssFetcher checkNow={checkToken} />

      {/* Top row: Logo block + Banner block */}
      <div className="px-3 pt-3 p-3">
        <div className="grid grid-cols-[300px_1fr] gap-3">
          {/* Logo card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] shadow-inner relative">
            <BorderBeam colorFrom="#7400ff" colorTo="#9b41ff" size={100} duration={6} borderThickness={2} glowIntensity={0} />
            <Link to="/Intro">
              <div className="h-full grid place-items-center px-4">
                <img src={logo} alt="SHS Logo" className="h-full p-10 w-auto object-contain" />
              </div>
            </Link>
          </div>

          {/* Banner */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
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
            onHomeClick={() => setActiveLeaf(null)}
          />
        </aside>

        {/* Content area */}
        <section className="glass rounded-2xl p-4 overflow-auto relative h-full">
          {activeLeaf ? (
            <ContentHost activeLeaf={activeLeaf} setActiveLeaf={setActiveLeaf} />
          ) : (
            <GlowingCards
              gap="2rem"
              className="h-full grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-4"
              borderRadius="0 rem"
              maxWidth="none"
            >
              {/* News sources panel (bên trái, row-span-2).
                  BẤM chọn nguồn → mở LIST full-width ở ContentHost */}
              <GlowingCard glowColor="#8b5cf6" className="text-center w-full h-full group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_-15px_rgba(0,0,0,0.6)] transition">
                <img src={IPO} alt="IPO" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex flex-col items-end justify-center p-4 mr-5">
                  <p className="text-[#F76F08] text-xl mb-2 text-right font-bold drop-shadow-lg">SHS là đại lý chính<br/>phân phối cổ phiếu VPBS</p>
                  <NeonAnimatedButton label="Đăng ký ngay" onClick={() => window.open('https://ipo.shs.com.vn/', '_blank')}/>
                </div>
              </GlowingCard>
              <GlowingCard
                hoverEffect={false}
                glowColor="#f59e0b"
                className="p-0 flex items-center justify-center w-full h-full group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_-15px_rgba(0,0,0,0.6)] transition"
              >
                <MGReferralQRCard />
              </GlowingCard>
              <GlowingCard glowColor="#8b5cf6" className="flex items-center justify-center w-full h-full group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_-15px_rgba(0,0,0,0.6)] transition">
                <ShinyText
                  baseColor="rgba(255, 255, 255, 0.8)"
                  size="2xl"
                  shineColor="rgba(255, 255, 255, 1)"
                  speed={5}
                >
                  Coming soon...
                </ShinyText>
              </GlowingCard>
              <GlowingCard
                hoverEffect={false}
                glowColor="#10b981"
                className="p-0 text-left w-full h-full group relative overflow-hidden rounded-2xl border border-white/10
                           bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_-15px_rgba(0,0,0,0.6)]
                           transition"
              >
              <RssSourcesPanel
                icons={{
                  cafebiz: cafebizLogo,
                  vietstock: vietstockLogo,
                }}
                onSelect={(src) =>
                  setActiveLeaf({
                    id: `news-${src}-list`,
                    label: `Danh sách ${src}`,
                    path: `news/${src}/list`,
                    page: 1,
                  } as any)
                }
                className="h-full"
              />
              </GlowingCard>
            </GlowingCards>
          )}
        </section>
      </div>

      <div className="p-3 pt-0">
        <Footer />
      </div>
      <RotateOverlay />
    </div>
  );
}
