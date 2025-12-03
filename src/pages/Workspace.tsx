// src/pages/Workspace.tsx
import { useEffect, useState } from "react";
import BannerCarousel from "@/components/BannerCarousel";
import SidebarMenu from "@/components/SidebarMenu";
import Footer from "@/components/Footer";
import { ContentHost } from "@/components/content/ContentHost";
import { MENU } from "@/lib/menuData";
import logo from "@/assets/LOGO.png";
import { Link, useSearchParams } from "react-router-dom";
import { BorderBeam } from "@/components/lightswind/border-beam";
import { GlowingCards, GlowingCard } from "@/components/lightswind/glowing-cards";
import ShinyText from "@/components/lightswind/shiny-text";
import MGReferralQRCard from "@/components/tools/MGReferralQRCard";
import QRDepositCard from "@/components/tools/QRDepositCard";
import QrApp from "@/assets/qr-app.jpg";
import NeonAnimatedButton from "@/components/tools/NeonAnimatedButton";
import IPO from "@/assets/IPO.png";
import SHSmartQR from "@/assets/QR SHSmart.jpg";
import * as Tabs from "@radix-ui/react-tabs";

import RssFetcher from "@/components/news/RssFetcher";
import RssSourcesPanel from "@/components/news/RssSourcesPanel";
import cafebizLogo from "@/assets/cafebiz.jpg";
import vietstockLogo from "@/assets/vietstock.jpg";
import SymbolChart from '@/components/Index/SymbolChart';
import shaQR from '@/assets/SH Advisor.png'
import HamburgerButton from "@/components/HamburgerButton"
import { downloadQRImage } from "@/lib/downloadQR"
import { useWorkspaceCards } from "@/hooks/useWorkspaceCards"
import { getStorageUrl } from "@/lib/supabase"

type LeafPayload = Parameters<typeof ContentHost>[0]["activeLeaf"];

export default function Workspace() {
  // Manage URL search parameters to enable deep linking to a specific leaf.
  // We will use a single query param "leaf" that stores the path of the
  // selected leaf. When the page loads with this parameter present, the
  // corresponding content will be displayed automatically. When the user
  // selects a leaf or navigates back, we update this param to reflect
  // the current state.
  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * Recursively search the menu tree for a leaf node matching the given
   * path. Returns the node if found, otherwise null.
   */
  function findLeafByPath(nodes: typeof MENU, targetPath: string): any {
    for (const node of nodes) {
      const children: any = (node as any).children;
      if (Array.isArray(children) && children.length) {
        const found = findLeafByPath(children, targetPath);
        if (found) return found;
      }
      if ((node as any).path && (node as any).path === targetPath) {
        return node;
      }
    }
    return null;
  }

  // Determine the initial active leaf based on the current query param. Doing
  // this in the initializer avoids an initial render with null, which can
  // cause a brief flash of the default workspace before the content loads.
  const initialLeaf: LeafPayload | null = (() => {
    const initialPath = searchParams.get('leaf');
    if (initialPath) {
      const node = findLeafByPath(MENU, initialPath);
      if (node) {
        return { id: node.id, label: node.label, path: node.path ?? node.id } as any;
      }
      return { id: initialPath, label: initialPath, path: initialPath } as any;
    }
    return null;
  })();

  const [activeLeaf, setActiveLeaf] = useState<LeafPayload | null>(initialLeaf);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch workspace cards from Supabase
  const { getCard, loading: cardsLoading } = useWorkspaceCards();
  const shSmartCard = getCard('sh_smart');
  const shAdvisorCard = getCard('sh_advisor');

  // Effect: When the `leaf` query param changes, sync it into activeLeaf.
  useEffect(() => {
    const param = searchParams.get('leaf');
    if (param) {
      if (!activeLeaf || activeLeaf.path !== param) {
        const node = findLeafByPath(MENU, param);
        if (node) {
          setActiveLeaf({ id: node.id, label: node.label, path: node.path ?? node.id } as any);
        } else {
          setActiveLeaf({ id: param, label: param, path: param } as any);
        }
      }
    } else {
      if (activeLeaf) setActiveLeaf(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Effect: When activeLeaf changes, push the value into the URL. This
  // ensures that copyable links reflect the current leaf. We avoid
  // unnecessary updates by checking the existing parameter value.
  useEffect(() => {
    if (activeLeaf && activeLeaf.path) {
      const current = searchParams.get('leaf');
      if (current !== activeLeaf.path) {
        setSearchParams({ leaf: activeLeaf.path });
      }
    } else {
      if (searchParams.has('leaf')) {
        setSearchParams({});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLeaf]);

  // Khi ở màn default (activeLeaf === null) → check RSS TTL
  const checkToken = activeLeaf === null ? Date.now() : 0;

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (sidebarOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setSidebarOpen(false);
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-zinc-200 flex flex-col">
      {/* Fetcher (ẩn) */}
      <RssFetcher checkNow={checkToken} />

      {/* Hamburger Menu Button (Mobile only) */}
      <HamburgerButton isOpen={sidebarOpen} onClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Top row: Logo block + Banner block */}
      <div className="px-3 pt-3 p-3">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-3">
          {/* Logo card - Hidden on mobile */}
          <div className="hidden lg:block rounded-2xl border border-white/10 bg-white/[0.04] shadow-inner relative">
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-3 p-3 pt-0">
        {/* Sidebar - Desktop: static, Mobile: overlay drawer */}
        <>
          {/* Mobile overlay backdrop */}
          {sidebarOpen && (
            <div
              className="sidebar-overlay"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Sidebar */}
          <aside className={`glass rounded-2xl overflow-hidden lg:static lg:translate-x-0 ${sidebarOpen ? 'sidebar-mobile open' : 'sidebar-mobile closed'}`}>

            <SidebarMenu
              menu={MENU}
              onLeafSelect={(leaf) => setActiveLeaf(leaf)}
              onHomeClick={() => setActiveLeaf(null)}
              onClose={() => setSidebarOpen(false)}
            />
          </aside>
        </>

        {/* Content area */}
        <section className="glass rounded-2xl p-4 overflow-auto relative h-full">
          {activeLeaf ? (
            <ContentHost activeLeaf={activeLeaf} setActiveLeaf={setActiveLeaf} />
          ) : (
            <GlowingCards
              gap="2rem"
              className="h-full grid grid-cols-1 sm:grid-cols-2 gap-4"
              borderRadius="0 rem"
              maxWidth="none"
            >
              {/* News sources panel (bên trái, row-span-2).
                  BẤM chọn nguồn → mở LIST full-width ở ContentHost */}
              <GlowingCard hoverEffect={false} glowColor="#8b5cf6" className="w-full h-full group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_-15px_rgba(0,0,0,0.6)] transition p-4">
                {/* Flex container - column on mobile, row on desktop */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-full">
                  {/* Left section - Text and buttons */}
                  <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                    <ShinyText
                      baseColor="rgba(251, 146, 60, 0.8)"
                      size="4xl"
                      shineColor="rgba(251, 146, 60, 1)"
                      speed={5}
                      className="text-3xl sm:text-4xl lg:text-5xl whitespace-nowrap"
                    >
                      {shSmartCard?.title || 'SH Smart'}
                    </ShinyText>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      <button
                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-400 text-white font-semibold rounded-lg shadow-md hover:from-orange-700 hover:to-orange-500 transition duration-300 whitespace-nowrap text-sm"
                        onClick={() => window.open(shSmartCard?.button_url || 'https://q.me-qr.com/l/SHSmart', '_blank')}
                      >
                        {shSmartCard?.button_text || 'Giao dịch ngay'}
                      </button>
                      {/* Desktop: show QR text, Mobile: show download button */}
                      <div className="hidden lg:block">
                        <ShinyText
                          baseColor="rgba(251, 146, 60, 0.8)"
                          size="base"
                          shineColor="rgba(251, 146, 60, 1)"
                          speed={5}
                          className="text-sm whitespace-nowrap"
                        >
                          hoặc quét QR
                        </ShinyText>
                      </div>
                      <button
                        className="sm:hidden px-3 py-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/50 text-orange-300 text-sm rounded-lg hover:from-orange-500/30 hover:to-orange-600/30 transition whitespace-nowrap font-medium"
                        onClick={() => downloadQRImage(shSmartCard ? getStorageUrl(shSmartCard.qr_image_url) : SHSmartQR, 'SHSmart-QR.jpg')}
                      >
                        📥 QR
                      </button>
                    </div>
                  </div>
                  {/* Divider - hidden on mobile */}
                  <div className="hidden sm:block w-px bg-white/20 self-stretch"></div>
                  {/* QR Code - hidden on mobile */}
                  <div className="hidden sm:flex items-center justify-center">
                    <img src={shSmartCard ? getStorageUrl(shSmartCard.qr_image_url) : SHSmartQR} alt="SH Smart QR" className="h-32 sm:h-40 lg:h-48 w-auto object-contain" />
                  </div>
                </div>
              </GlowingCard>

              <GlowingCard
                hoverEffect={false}
                glowColor="#f59e0b"
                className="p-0 flex items-center justify-center w-full h-full group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_-15px_rgba(0,0,0,0.6)] transition"
              >
                <Tabs.Root defaultValue="qr-ekyc" className="w-full h-full">
                  <Tabs.List className="flex border-b border-white/10 mb-4">
                    <Tabs.Trigger
                      value="qr-ekyc"
                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-zinc-200 hover:text-white data-[state=active]:text-orange-400 data-[state=active]:border-b-2 data-[state=active]:border-orange-400 transition"
                    >
                      QR eKYC
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="qr-nop-tien"
                      className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-zinc-200 hover:text-white data-[state=active]:text-orange-400 data-[state=active]:border-b-2 data-[state=active]:border-orange-400 transition"
                    >
                      <span className="hidden sm:inline">QR nộp tiền 24/7</span>
                      <span className="sm:hidden">Nộp tiền 24/7</span>
                    </Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="qr-ekyc" className="h-full">
                    <MGReferralQRCard />
                  </Tabs.Content>
                  <Tabs.Content value="qr-nop-tien" className="h-full">
                    <QRDepositCard />
                  </Tabs.Content>
                </Tabs.Root>
              </GlowingCard>
              <GlowingCard hoverEffect={false} glowColor="#8b5cf6" className="w-full h-full group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_-15px_rgba(0,0,0,0.6)] transition p-4">
                {/* Flex container - column on mobile, row on desktop */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-full">
                  {/* Left section - Text and buttons */}
                  <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                    <ShinyText
                      baseColor="rgba(255, 255, 255, 0.8)"
                      size="4xl"
                      shineColor="rgba(255, 255, 255, 1)"
                      speed={5}
                      className="text-3xl sm:text-4xl lg:text-5xl whitespace-nowrap"
                    >
                      {shAdvisorCard?.title || 'SHAdvisor'}
                    </ShinyText>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      <button
                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-pink-600 transition duration-300 text-sm whitespace-nowrap"
                        onClick={() => window.open(shAdvisorCard?.button_url || 'https://q.me-qr.com/Zb80ouRe', '_blank')}
                      >
                        {shAdvisorCard?.button_text || 'Truy cập ngay'}
                      </button>
                      {/* Desktop: show QR text, Mobile: show download button */}
                      <div className="hidden lg:block">
                        <ShinyText
                          baseColor="rgba(255, 255, 255, 0.8)"
                          size="base"
                          shineColor="rgba(255, 255, 255, 1)"
                          speed={5}
                          className="text-sm whitespace-nowrap"
                        >
                          hoặc quét QR
                        </ShinyText>
                      </div>
                      <button
                        className="sm:hidden px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/50 text-purple-300 text-sm rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition whitespace-nowrap font-medium"
                        onClick={() => downloadQRImage(shAdvisorCard ? getStorageUrl(shAdvisorCard.qr_image_url) : shaQR, 'SHAdvisor-QR.png')}
                      >
                        📥 QR
                      </button>
                    </div>
                  </div>
                  {/* Divider - hidden on mobile */}
                  <div className="hidden sm:block w-px bg-white/20 self-stretch"></div>
                  {/* QR Code - hidden on mobile */}
                  <div className="hidden sm:flex items-center justify-center">
                    <img src={shAdvisorCard ? getStorageUrl(shAdvisorCard.qr_image_url) : shaQR} alt="SHAdvisor QR" className="h-32 sm:h-40 lg:h-48 w-auto object-contain" />
                  </div>
                </div>
                {/* <SymbolChart symbol="VN" height={300} colorTheme="dark" /> */}
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
    </div>
  );
}

