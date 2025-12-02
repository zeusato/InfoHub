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
import RotateOverlay from "@/components/RotateOverlay";
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
              <GlowingCard glowColor="#8b5cf6" className="flex items-center w-full h-full group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_-15px_rgba(0,0,0,0.6)] transition p-4">
                <div className="flex-1 flex justify-end pr-4">
                  <div className="flex flex-col items-end">
                    <ShinyText
                      baseColor="rgba(251, 146, 60, 0.8)"
                      size="4xl"
                      shineColor="rgba(251, 146, 60, 1)"
                      speed={5}
                    >
                      SH Smart
                    </ShinyText>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-400 text-white font-semibold rounded-lg shadow-md hover:from-orange-700 hover:to-orange-500 transition duration-300 whitespace-nowrap"
                        onClick={() => window.open('https://q.me-qr.com/l/SHSmart', '_blank')}
                      >
                        Giao dịch ngay
                      </button>
                      <ShinyText
                        baseColor="rgba(251, 146, 60, 0.8)"
                        size="base"
                        shineColor="rgba(251, 146, 60, 1)"
                        speed={5}
                      >
                        hoặc quét QR
                      </ShinyText>
                    </div>
                  </div>
                </div>
                <div className="w-px bg-white/20 h-full"></div>
                <div className="flex-1 flex justify-start pl-4">
                  <img src={SHSmartQR} alt="shaQR" className="h-48 w-auto object-contain" />
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
                      className="px-4 py-2 text-sm font-medium text-zinc-200 hover:text-white data-[state=active]:text-orange-400 data-[state=active]:border-b-2 data-[state=active]:border-orange-400 transition"
                    >
                      QR eKYC
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="qr-nop-tien"
                      className="px-2 py-2 text-sm font-medium text-zinc-200 hover:text-white data-[state=active]:text-orange-400 data-[state=active]:border-b-2 data-[state=active]:border-orange-400 transition"
                    >
                      QR nộp tiền 24/7
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
              <GlowingCard glowColor="#8b5cf6" className="flex items-center w-full h-full group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_-15px_rgba(0,0,0,0.6)] transition p-4">
                <div className="flex-1 flex justify-end pr-4">
                  <div className="flex flex-col items-end">
                    <ShinyText
                      baseColor="rgba(255, 255, 255, 0.8)"
                      size="4xl"
                      shineColor="rgba(255, 255, 255, 1)"
                      speed={5}
                    >
                      SHAdvisor
                    </ShinyText>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-pink-600 transition duration-300"
                        onClick={() => window.open('https://q.me-qr.com/Zb80ouRe', '_blank')}
                      >
                        Truy cập ngay
                      </button>
                      <ShinyText
                        baseColor="rgba(255, 255, 255, 0.8)"
                        size="base"
                        shineColor="rgba(255, 255, 255, 1)"
                        speed={5}
                      >
                        hoặc quét QR
                      </ShinyText>
                    </div>
                  </div>
                </div>
                <div className="w-px bg-white/20 h-full"></div>
                <div className="flex-1 flex justify-start pl-4">
                  <img src={shaQR} alt="shaQR" className="h-48 w-auto object-contain" />
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
      <RotateOverlay />
    </div>
  );
}

