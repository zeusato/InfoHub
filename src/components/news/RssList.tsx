// src/components/news/RssList.tsx
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/components/lib/utils";
import type { RssItem } from "./RssFetcher";
import { RSS_SOURCES } from "./RssFetcher";

type Props = {
  source: keyof typeof RSS_SOURCES;
  initialPage?: number;
  onBack: () => void;
  onOpenDetail: (item: RssItem, page: number) => void;
  pageSize?: number;
};

const indexKey = (src: string) => `rss:${src}:index`;
const oldArrayKey = (src: string) =>
  src === "cafebiz" ? "rss:cafebiz:home" : `rss:${src}:home`; // fallback

// SVG placeholder cho Vietstock (30x40)
const VietstockPlaceholder = () => (
  <svg viewBox="0 0 30 40" width="30" height="40" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopOpacity="1" />
        <stop offset="1" stopOpacity="0.9" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="30" height="40" fill="url(#g)" />
    <path d="M4 30 L10 22 L14 27 L20 17 L26 24" fill="none" strokeWidth="2" />
    <circle cx="10" cy="22" r="2" />
    <circle cx="14" cy="27" r="2" />
    <circle cx="20" cy="17" r="2" />
    <circle cx="26" cy="24" r="2" />
  </svg>
);

export default function RssList({
  source,
  initialPage = 1,
  onBack,
  onOpenDetail,
  pageSize = 10,
}: Props) {
  const [items, setItems] = useState<RssItem[]>([]);
  const [page, setPage] = useState(initialPage);

  const load = () => {
    try {
      // ưu tiên index mới
      const rawIdx = localStorage.getItem(indexKey(source));
      if (rawIdx) {
        const { ids } = JSON.parse(rawIdx) as { fetchedAt: number; ids: string[] };
        const list: RssItem[] = [];
        for (const id of ids) {
          const rawIt = localStorage.getItem(`rss:${source}:item:${id}`);
          if (rawIt) list.push(JSON.parse(rawIt));
        }
        setItems(list);
        return;
      }
      // fallback kiểu mảng cũ (CaféBiz)
      const rawOld = localStorage.getItem(oldArrayKey(source));
      if (rawOld) {
        const obj = JSON.parse(rawOld) as { items: Omit<RssItem, "id">[]; fetchedAt: number };
        const list = (obj.items || []).map((x) => ({
          ...x,
          id: btoa(unescape(encodeURIComponent(x.link || x.title || ""))).replace(/=+$/g, ""),
          source,
        }));
        setItems(list);
        return;
      }
      setItems([]);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    load();
    const onUpdated = (e: Event) => {
      const src = (e as CustomEvent).detail?.source as keyof typeof RSS_SOURCES | undefined;
      if (!src || src === source) load();
    };
    window.addEventListener("rss:updated", onUpdated as EventListener);
    return () => window.removeEventListener("rss:updated", onUpdated as EventListener);
  }, [source]);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return db - da;
    });
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const view = sorted.slice((page - 1) * pageSize, page * pageSize);
  const goto = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="relative w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-white/10 bg-white/[0.06] hover:bg-white/[0.1] transition"
        >
          ← Quay lại
        </button>
        <div className="text-sm opacity-70">
          {RSS_SOURCES[source].label} • {items.length} bài
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {view.map((it) => (
          <button
            key={it.id}
            onClick={() => onOpenDetail(it, page)}
            className={cn(
              "w-full text-left rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition",
              "px-3 py-2"
            )}
          >
            <div className="grid grid-cols-[30px_auto] gap-3 items-start">
              {/* Ảnh 30x40 */}
              <div className="w-[30px] h-[40px] rounded overflow-hidden border border-white/10 bg-black/30 grid place-items-center">
                {it.image ? (
                  <img
                    src={it.image}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : source === "vietstock" ? (
                  <VietstockPlaceholder />
                ) : null}
              </div>

              {/* Texts */}
              <div className="ml-4 min-w-0">
                <div className="font-semibold leading-snug">{it.title}</div>
                <div className="text-xs opacity-70 mt-0.5">
                  {it.pubDate ? new Date(it.pubDate).toLocaleString() : "Không rõ thời gian"}
                </div>
                <div className="text-sm opacity-85 mt-1 line-clamp-2">
                  {(it.description || "")
                    .replace(/<\/?[^>]+(>|$)/g, " ")
                    .replace(/\s+/g, " ")
                    .trim()}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => goto(page - 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-white/10 bg-white/[0.06] hover:bg-white/[0.1]"
            disabled={page === 1}
          >
            ‹ Trước
          </button>
          <div className="text-sm opacity-80">
            Trang {page}/{totalPages}
          </div>
          <button
            onClick={() => goto(page + 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-white/10 bg-white/[0.06] hover:bg-white/[0.1]"
            disabled={page === totalPages}
          >
            Sau ›
          </button>
        </div>
      )}
    </div>
  );
}
