import { useEffect, useState } from "react";
import BannerCarousel from "@/components/BannerCarousel";
import SidebarMenu, { LeafPayload } from "@/components/SidebarMenu";
import Footer from "@/components/Footer";
import { ContentHost } from "@/components/content/ContentHost";
import { MENU } from "@/lib/menuData";
import logo from "@/assets/LOGO.png";
import { Link } from "react-router-dom";
import { BorderBeam } from "@/components/lightswind/border-beam";
import RotateOverlay from "@/components/RotateOverlay";
import { GlowingCards, GlowingCard } from "@/components/lightswind/glowing-cards";
import CafeBizCarousel from "@/components/news/CafeBizCarousel";

type RssItem = {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
  image?: string;
};

const FEED = "https://cafebiz.vn/rss/home.rss";
const STORAGE_KEY = "rss:cafebiz:home";
const TTL_MS = 5 * 60 * 1000; // 5 phút

export default function Workspace() {
  const [activeLeaf, setActiveLeaf] = useState<LeafPayload | null>(null);

  // ---- RSS cache (load -> localStorage, TTL 5')
  useEffect(() => {
    const parseImageFromDescription = (html?: string) => {
      if (!html) return undefined;
      const m = html.match(/<img[^>]+src=["']?([^"' >]+)["']?[^>]*>/i);
      return m?.[1];
    };

    const xmlToItems = (xmlText: string): RssItem[] => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, "application/xml");
      const itemNodes = Array.from(xml.getElementsByTagName("item"));
      const mapped = itemNodes.map((it) => {
        const get = (tag: string) => it.getElementsByTagName(tag)[0]?.textContent ?? "";
        const title = get("title").trim();
        const link = get("link").trim();
        const description = get("description").trim();
        let image: string | undefined =
          (it.getElementsByTagName("enclosure")[0]?.getAttribute("url") ?? undefined) ||
          (it.getElementsByTagName("media:content")[0]?.getAttribute("url") ?? undefined) ||
          parseImageFromDescription(description);
        if (image && image.startsWith("//")) image = window.location.protocol + image;
        const pubDate = get("pubDate") || undefined;
        return { title, link, description, pubDate, image };
      });
      mapped.sort((a, b) => {
        const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return db - da;
      });
      return mapped;
    };

    const needRefresh = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return true;
        const obj = JSON.parse(raw) as { fetchedAt: number };
        return Date.now() - obj.fetchedAt > TTL_MS;
      } catch {
        return true;
      }
    };

    const tryFetchText = async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("fetch failed");
      return await res.text();
    };

    const updateRss = async () => {
      // 3 tầng fallback: trực tiếp -> AllOrigins -> r.jina.ai
      const candidates = [
        FEED,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(FEED)}`,
        `https://r.jina.ai/http://cafebiz.vn/rss/home.rss`,
      ];
      for (const u of candidates) {
        try {
          const xml = await tryFetchText(u);
          const items = xmlToItems(xml);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ fetchedAt: Date.now(), items }));
          window.dispatchEvent(new Event("rss-updated"));
          return;
        } catch {
          // thử next candidate
        }
      }
      console.error("RSS load failed: all candidates failed");
      // vẫn phát event để UI không chờ vô hạn
      window.dispatchEvent(new Event("rss-updated"));
    };

    // cho phép thành phần khác yêu cầu refresh tay
    const onForce = () => updateRss();
    window.addEventListener("rss-refresh", onForce as EventListener);

    if (needRefresh()) updateRss();

    return () => {
      window.removeEventListener("rss-refresh", onForce as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-zinc-200 flex flex-col">
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
            <GlowingCards gap="2rem" className="h-full grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-4" borderRadius="0 rem" maxWidth="none">
              <GlowingCard
                hoverEffect={false}
                glowColor="#10b981"
                className="p-0 text-left w-full h-full group relative overflow-hidden rounded-2xl border border-white/10
                           bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_-15px_rgba(0,0,0,0.6)]
                           transition row-span-2"
              >
                <CafeBizCarousel
                  limit={3}
                  onOpenList={(leaf: LeafPayload) => setActiveLeaf(leaf)}
                />
              </GlowingCard>

              <GlowingCard children glowColor="#f59e0b" className="text-center w-full h-full group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_-15px_rgba(0,0,0,0.6)] transition"></GlowingCard>
              <GlowingCard children glowColor="#8b5cf6" className="text-center w-full h-full group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_-15px_rgba(0,0,0,0.6)] transition"></GlowingCard>
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
