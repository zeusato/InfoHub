import { useEffect, useState } from "react";
import { cn } from "@/components/lib/utils";
import type { RssItem } from "./CafeBizList";

type Props = {
  item: RssItem;
  onBack: () => void;
};

export default function CafeBizDetail({ item, onBack }: Props) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let aborted = false;

    const fetchArticle = async (url: string) => {
      const tryFetch = async (u: string) => {
        const res = await fetch(u);
        if (!res.ok) throw new Error("fetch failed");
        return await res.text();
      };
      try {
        // Trực tiếp (có thể bị CORS)
        const raw = await tryFetch(url);
        if (!aborted) extract(raw);
      } catch {
        // Fallback proxy
        try {
          const raw = await tryFetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
          if (!aborted) extract(raw);
        } catch (e) {
          console.error(e);
        }
      }
    };

    const extract = (rawHtml: string) => {
      const doc = new DOMParser().parseFromString(rawHtml, "text/html");

      // Tìm khối nội dung “dài nhất” trong các selector thường gặp
      const candidates = [
        "article",
        ".detail-content",
        ".contentdetail",
        ".main_content_detail",
        ".news-content",
        ".content", // fallback
        "#content",
        "#mainContent",
      ];
      let best: HTMLElement | null = null;
      for (const sel of candidates) {
        const el = doc.querySelector(sel) as HTMLElement | null;
        if (el && (!best || (el.innerText || "").length > (best.innerText || "").length)) {
          best = el;
        }
      }
      // Fallback chọn body nếu không có selector nào
      const target = best || (doc.body as HTMLElement);

      // Gỡ scripts/iframes nguy hiểm
      target.querySelectorAll("script,noscript,style").forEach((n) => n.remove());
      // Chuẩn hóa ảnh
      target.querySelectorAll("img").forEach((img) => {
        img.removeAttribute("srcset");
        img.setAttribute("referrerpolicy", "no-referrer");
        img.classList.add("max-w-full");
      });

      setHtml(target.innerHTML || "");
    };

    fetchArticle(item.link);
    return () => {
      aborted = true;
    };
  }, [item.link]);

  return (
    <div className="relative w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-white/10 bg-white/[0.06] hover:bg-white/[0.1] transition"
        >
          ← Quay lại danh sách
        </button>
        <div className="text-xs opacity-70">CaféBiz</div>
      </div>

      <h1 className="text-xl font-bold leading-snug mb-1">{item.title}</h1>
      <div className="text-xs opacity-70 mb-3">{item.pubDate ? new Date(item.pubDate).toLocaleString() : ""}</div>

      <div className="prose prose-invert max-w-none flex-1 overflow-auto">
        {html ? (
          <div
            className={cn("max-w-none")}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-70 mb-2">Đang tải nội dung bài viết...</p>
              <p className="text-xs opacity-50">Từ {new URL(item.link).hostname}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
