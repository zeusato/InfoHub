import { useEffect, useMemo, useState } from "react";
import { cn } from "@/components/lib/utils";

export type RssItem = {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
  image?: string;
};

type Props = {
  onBack: () => void;
  onOpenDetail: (item: RssItem) => void;
  storageKey?: string;
  pageSize?: number;
};

const STORAGE_KEY = "rss:cafebiz:home";

export default function CafeBizList({
  onBack,
  onOpenDetail,
  storageKey = STORAGE_KEY,
  pageSize = 10,
}: Props) {
  const [items, setItems] = useState<RssItem[]>([]);
  const [page, setPage] = useState(1);

  const load = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return setItems([]);
      const obj = JSON.parse(raw) as { items: RssItem[]; fetchedAt: number };
      setItems(Array.isArray(obj.items) ? obj.items : []);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    load();
    const onUpdated = () => load();
    window.addEventListener("rss-updated", onUpdated as EventListener);
    return () => window.removeEventListener("rss-updated", onUpdated as EventListener);
  }, []);

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
        <div className="text-sm opacity-70">CaféBiz • {items.length} bài</div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {view.map((it, i) => (
          <button
            key={i}
            onClick={() => onOpenDetail(it)}
            className={cn(
              "w-full text-left rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition",
              "px-3 py-2"
            )}
          >
            <div className="grid grid-cols-[30px_auto] gap-3 items-start">
              {/* Ảnh 30x40 */}
              <div className="w-[60px] h-[80px] rounded overflow-hidden border border-white/10 bg-black/30">
                {it.image ? (
                  <img src={it.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : null}
              </div>

              {/* Texts */}
              <div className="ml-6 min-w-0">
                <div className="font-semibold leading-snug">{it.title}</div>
                <div className="text-xs opacity-70 mt-0.5">
                  {it.pubDate ? new Date(it.pubDate).toLocaleString() : "Không rõ thời gian"}
                </div>
                <div className="text-sm opacity-85 mt-1 line-clamp-2">
                  {it.description?.replace(/<\/?[^>]+(>|$)/g, " ").replace(/\s+/g, " ").trim()}
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
