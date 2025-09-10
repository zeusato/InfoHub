import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/components/lib/utils";
import { LeafPayload } from '@/components/SidebarMenu';

type RssItem = {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
  image?: string;
};

type Props = {
  // feedUrl giữ lại cho tương thích, KHÔNG dùng nữa
  feedUrl?: string;
  limit?: number;
  autoMs?: number;
  className?: string;
  storageKey?: string; // key lấy từ localStorage
  onOpenList?: (leaf: LeafPayload) => void;
};

const STORAGE_KEY = "rss:cafebiz:home";

export default function CafeBizCarousel({
  limit = 3,
  autoMs = 5000,
  className = "",
  storageKey = STORAGE_KEY,
  onOpenList,
}: Props) {
  const [items, setItems] = useState<RssItem[]>([]);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<number | null>(null);

  const loadFromStorage = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return setItems([]);
      const obj = JSON.parse(raw) as { items: RssItem[]; fetchedAt: number };
      const list = Array.isArray(obj.items) ? obj.items : [];
      list.sort((a, b) => {
        const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return db - da;
      });
      setItems(list.slice(0, limit));
      setIdx(0);
    } catch {
      setItems([]);
    }
  };

  // load ban đầu + khi có event rss-updated
  useEffect(() => {
    loadFromStorage();
    const onUpdated = () => loadFromStorage();
    window.addEventListener("rss-updated", onUpdated as EventListener);
    return () => window.removeEventListener("rss-updated", onUpdated as EventListener);
  }, [limit, storageKey]);

  // auto slide
  useEffect(() => {
    if (!items.length) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % items.length);
    }, autoMs) as unknown as number;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [items, autoMs]);

  const truncate = (html: string, n = 240) => {
    const text = html.replace(/<\/?[^>]+(>|$)/g, " ").replace(/\s+/g, " ").trim();
    return text.length > n ? text.slice(0, n - 1) + "…" : text;
  };

  const go = (to: number) => items.length && setIdx(((to % items.length) + items.length) % items.length);
  const next = () => go(idx + 1);
  const prev = () => go(idx - 1);

  const current = useMemo(() => items[idx], [items, idx]);

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden m-0 p-0 text-left rounded-2xl",
        className
      )}
      role="region"
      aria-label="Tin nóng CaféBiz"
    >
      {/* Nội dung */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={() => onOpenList?.({ id: 'cafebiz-list', label: 'Danh sách CaféBiz', path: 'cafebiz/list' })}
        title="Mở danh sách tin CaféBiz"
      >
        {current ? (
          <div className="group flex flex-col md:flex-row h-full w-full">
            {/* Ảnh */}
            <div className="md:w-1/3 w-full h-48 md:h-full overflow-hidden">
              {current.image ? (
                <img
                  src={current.image}
                  alt={current.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="grid place-items-center h-full">No image</div>
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0 flex flex-col px-4 py-3">
              <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1">
                CaféBiz {current.pubDate && "• " + new Date(current.pubDate).toLocaleString()}
              </div>
              <h3 className="text-lg font-semibold leading-snug mb-2">
                {current.title}
              </h3>
              <p className="text-sm opacity-90">
                {truncate(current.description, 240)}
              </p>

              {/* Dots */}
              <div className="mt-auto pt-3 flex items-center gap-2">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => go(i)}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full transition",
                      i === idx ? "bg-white/90" : "bg-white/30 hover:bg-white/50"
                    )}
                    aria-label={`Chuyển đến tin ${i + 1}`}
                    title={`Tin ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid place-items-center h-full text-sm opacity-80">
            Đang chờ dữ liệu RSS…
          </div>
        )}
      </div>

      {/* Controls */}
      {items.length > 1 && (
        <div className="absolute bottom-0 right-4 flex gap-2 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="h-10 w-10 rounded-full grid place-items-center bg-black/40 hover:bg-black/55 border border-white/10 backdrop-blur"
            aria-label="Tin trước"
          >
            <span className="text-lg leading-none">‹</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="h-10 w-10 rounded-full grid place-items-center bg-black/40 hover:bg-black/55 border border-white/10 backdrop-blur"
            aria-label="Tin sau"
          >
            <span className="text-lg leading-none">›</span>
          </button>
        </div>
      )}
    </div>
  );
}
