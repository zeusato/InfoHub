import { useState } from "react";
import BannerCarousel from "@/components/BannerCarousel";
import SidebarMenu, { LeafPayload } from "@/components/SidebarMenu";
import Footer from "@/components/Footer";
import { ContentHost } from "@/components/content/ContentHost";
import { MENU } from "@/lib/menuData";
import logo from "@/assets/LOGO.png";
import { Link } from "react-router-dom";
import { BorderBeam } from "@/components/lightswind/border-beam";
import RotateOverlay from "@/components/RotateOverlay";

/** 4 ô shortcut mặc định của workspace */
function HomeGrid() {
  // Sau này đại ca đổi title/subtitle/href cho phù hợp hệ thống khác là xong
  const TILES = [
    { id: "t1", title: "Tin tức sản phẩm", subtitle: "Cập nhật mới nhất", href: "#" },
    { id: "t2", title: "Release Notes", subtitle: "Nhật ký phiên bản", href: "#" },
    { id: "t3", title: "Ưu đãi", subtitle: "Chương trình đang chạy", href: "#" },
    { id: "t4", title: "Hướng dẫn sử dụng", subtitle: "Bắt đầu nhanh", href: "#" },
  ];

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-4">
      {TILES.map((t, i) => (
        <a
          key={t.id}
          href={t.href}
          // đổi target="_blank" nếu là link hệ thống ngoài
          className="group relative overflow-hidden rounded-2xl border border-white/10
                     bg-white/[0.03] hover:bg-white/[0.06]
                     shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_-15px_rgba(0,0,0,0.6)]
                     transition"
        >
          {/* light sweep */}
          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
            <div className="absolute -inset-40 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl" />
          </div>

          <div className="h-full p-6 flex flex-col justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-white/50">
                Shortcut {i + 1}
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">{t.title}</div>
              <div className="mt-1 text-sm text-white/60">{t.subtitle}</div>
            </div>

            <div className="mt-6 self-end text-sm text-white/60 group-hover:text-cyan-300">
              <span className="inline-flex items-center gap-2">
                Mở
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition"
                >
                  <path d="M13.5 4.5h6v6h-1.5V7.06l-9.97 9.97-1.06-1.06 9.97-9.97H13.5V4.5z" />
                </svg>
              </span>
            </div>
          </div>

          {/* ring on hover */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10
                       group-hover:ring-cyan-400/50 transition"
          />
        </a>
      ))}
    </div>
  );
}

export default function Workspace() {
  const [activeLeaf, setActiveLeaf] = useState<LeafPayload | null>(null);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-zinc-200 flex flex-col">
      {/* Top row: Logo block + Banner block */}
      <div className="px-3 pt-3 p-3">
        <div className="grid grid-cols-[300px_1fr] gap-3">
          {/* Logo card */}
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
            /** khi bấm chữ “InfoHub” ở header menu → quay về mặc định */
            onHomeClick={() => setActiveLeaf(null)}
          />
        </aside>

        {/* Content area */}
        <section className="glass rounded-2xl p-4 overflow-auto relative">
          {activeLeaf ? (
            <ContentHost activeLeaf={activeLeaf} />
          ) : (
            <div className="h-full">
              <HomeGrid />
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <div className="p-3 pt-0">
        <Footer />
      </div>
      <RotateOverlay />
    </div>
  );
}
