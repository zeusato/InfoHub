// src/components/news/RssDetail.tsx
import { useEffect, useState } from "react";
import { cn } from "@/components/lib/utils";
import type { RssItem } from "./RssFetcher";

type Props = {
  item: RssItem;
  sourceLabel?: string;
  onBack: () => void;
};

export default function RssDetail({ item, onBack, sourceLabel = "News" }: Props) {
  const [html, setHtml] = useState<string>("");
  const [mode, setMode] = useState<"reader" | "iframe">("reader");
  const [iframeSrc, setIframeSrc] = useState<string>(item.link);

  useEffect(() => {
    let aborted = false;

    // === giữ nguyên logic fetch hiện tại ===
    const tryFetch = async (u: string) => {
      const res = await fetch(u);
      if (!res.ok) throw new Error("fetch failed");
      return await res.text();
    };

    // absolutize url tương đối -> tuyệt đối, sửa ảnh hiển thị
    const fixContent = (root: HTMLElement, baseHref: string) => {
      root.querySelectorAll("script,noscript,style").forEach((n) => n.remove());

      // ảnh
      root.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
        img.removeAttribute("srcset");
        img.setAttribute("referrerpolicy", "no-referrer");
        img.classList.add("max-w-full");
        const src = img.getAttribute("src") || "";
        try {
          const abs = new URL(src, baseHref).href;
          img.setAttribute("src", abs);
        } catch {/* ignore */}
      });

      // link (optional, để user mở ngoài nếu cần)
      root.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => {
        const href = a.getAttribute("href") || "";
        try {
          const abs = new URL(href, baseHref).href;
          a.setAttribute("href", abs);
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
        } catch {/* ignore */}
      });
    };

    const extract = (rawHtml: string) => {
      const doc = new DOMParser().parseFromString(rawHtml, "text/html");

      let target: HTMLElement | null = null;
      const src = (item.source || "").toLowerCase();

      // === Vietstock: ưu tiên các layout đã mapping ===
      if (src === "vietstock") {
        const vsCandidates = [
          // longform
          'div.longform-content[id^="post-"]',
          'div[id^="post-"].longform-content',
          'div.longform-content[title]',
          '.longform-content',
          // article
          'div.article-content[id^="post-"]',
          'div[id^="post-"].article-content',
          'div.article-content[art-type]',
          '.article-content',
        ];
        for (const sel of vsCandidates) {
          const el = doc.querySelector<HTMLElement>(sel);
          if (el && (el.innerText?.trim().length ?? 0) > 0) { target = el; break; }
        }
      }

      // === CaféBiz: lấy đúng khối nội dung chính (khung đỏ) ===
      if (!target && src === "cafebiz") {
        const cbCandidates = [
          ".adm-mainsection",
          "div.adm-mainsection",
          // (tuỳ trang có thể lồng trong .admsectionfull/.wp1100 nhưng querySelector ở trên đã bắt được)
        ];
        for (const sel of cbCandidates) {
          const el = doc.querySelector<HTMLElement>(sel);
          if (el && (el.innerText?.trim().length ?? 0) > 0) { target = el; break; }
        }
      }

      // === Fallback chung nếu không match gì ở trên ===
      if (!target) {
        const candidates = [
          "article",
          ".detail-content",
          ".contentdetail",
          ".main_content_detail",
          ".news-content",
          ".content",
          "#content",
          "#mainContent",
          "body",
        ];
        let best: HTMLElement | null = null;
        for (const sel of candidates) {
          const el = doc.querySelector<HTMLElement>(sel);
          if (el && (!best || (el.innerText || "").length > (best.innerText || "").length)) best = el;
        }
        target = best || (doc.body as HTMLElement);
      }

      const container = target.cloneNode(true) as HTMLElement;

      // giữ nguyên hàm fixContent hiện có của đại ca
      fixContent(container, item.link);

      setHtml(container.innerHTML || "");
    };


    const run = async () => {
      try {
        const raw = await tryFetch(item.link);
        if (!aborted) extract(raw);
      } catch {
        try {
          const proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent(item.link)}`;
          const raw = await tryFetch(proxied);
          if (!aborted) extract(raw);
          if (!aborted) setIframeSrc(proxied); // để chế độ iframe dùng luôn proxy nếu cần
        } catch (e) {
          console.error(e);
        }
      }
    };

    setHtml("");
    setMode("reader");
    setIframeSrc(item.link);
    run();

    return () => { aborted = true; };
  }, [item.link, item.source]);

  return (
    <div className="relative w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-white/10 bg-white/[0.06] hover:bg-white/[0.1] transition"
          >
            ← Quay lại danh sách
          </button>
          <div className="flex items-center gap-1 ml-2 text-xs">
            <button
              onClick={() => setMode("reader")}
              className={cn(
                "px-2 py-1 rounded border border-white/10",
                mode === "reader" ? "bg-white/[0.15]" : "bg-white/[0.05] hover:bg-white/[0.1]"
              )}
              title="Đọc dạng văn bản đã làm sạch"
            >
              Văn bản
            </button>
            <button
              onClick={() => setMode("iframe")}
              className={cn(
                "px-2 py-1 rounded border border-white/10",
                mode === "iframe" ? "bg-white/[0.15]" : "bg-white/[0.05] hover:bg-white/[0.1]"
              )}
              title="Xem trang gốc bằng iframe (có thể bị chặn bởi trang nguồn)"
            >
              Iframe
            </button>
          </div>
        </div>
        <div className="text-xs opacity-70 whitespace-nowrap">
          Nguồn:{" "}
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4  hover:text-cyan-500"
            title="Mở bài gốc"
          >
            {sourceLabel}
          </a>
        </div>
      </div>

      <h1 className="text-xl font-bold leading-snug mb-1">{item.title}</h1>
      <div className="text-xs opacity-70 mb-3">{item.pubDate ? new Date(item.pubDate).toLocaleString() : ""}</div>

      <div className="prose prose-invert max-w-none flex-1 overflow-auto min-h-[320px]">
        {mode === "reader" ? (
          html ? (
            <div className={cn("max-w-none")} dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-70 mb-2">Đang tải nội dung bài viết...</p>
                <p className="text-xs opacity-50">{new URL(item.link).hostname}</p>
              </div>
            </div>
          )
        ) : (
          <iframe
            src={iframeSrc}
            title={item.title}
            className="w-full h-[72vh] rounded-xl border border-white/10 bg-white"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        )}
      </div>
    </div>
  );
}
