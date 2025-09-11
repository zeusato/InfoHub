// src/components/news/RssFetcher.tsx
import React, { useEffect } from "react";
import { fetchTextWithFallback } from "@/lib/rssProxy";

export type RssItem = {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate?: string;
  image?: string;
  source?: string; // 'cafebiz' | 'vietstock'
};

export const RSS_SOURCES = {
  cafebiz: {
    label: "CaféBiz",
    feeds: ["https://cafebiz.vn/rss/home.rss"],
  },
  vietstock: {
    label: "Vietstock",
    feeds: [
      "https://vietstock.vn/830/chung-khoan/co-phieu.rss",
      "https://vietstock.vn/739/chung-khoan/giao-dich-noi-bo.rss",
      "https://vietstock.vn/741/chung-khoan/niem-yet.rss",
      "https://vietstock.vn/3358/chung-khoan/etf-va-cac-quy.rss",
      "https://vietstock.vn/4186/chung-khoan/chung-khoan-phai-sinh.rss",
      "https://vietstock.vn/4308/chung-khoan/chung-quyen.rss",
      "https://vietstock.vn/143/chung-khoan/chinh-sach.rss",
      "https://vietstock.vn/785/chung-khoan/thi-truong-trai-phieu.rss",
    ],
  },
} as const;

type Props = {
  /** thay đổi giá trị (true/false/number) để kích hoạt check TTL + fetch nếu cần */
  checkNow?: number | boolean;
};

const TTL_MS = 5 * 60 * 1000;

// ===== utilities =====
const b64safe = (s: string) =>
  btoa(unescape(encodeURIComponent(s)))
    .replace(/=+$/g, "")
    .replace(/[+/]/g, "-");

const indexKey = (src: string) => `rss:${src}:index`;
const itemKey = (src: string, id: string) => `rss:${src}:item:${id}`;

const parseImageFromDescription = (html?: string) => {
  if (!html) return undefined;
  const m = html.match(/<img[^>]+src=["']?([^"' >]+)["']?[^>]*>/i);
  return m?.[1];
};

const parseXmlToItems = (xmlText: string, source: string): Omit<RssItem, "id">[] => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "application/xml");
  const itemNodes = Array.from(xml.getElementsByTagName("item"));
  return itemNodes.map((it) => {
    const get = (tag: string) => it.getElementsByTagName(tag)[0]?.textContent ?? "";
    const title = (get("title") || "").trim();
    const link = (get("link") || "").trim();
    const description = (get("description") || "").trim();
    let image: string | undefined =
      it.getElementsByTagName("enclosure")[0]?.getAttribute("url") ??
      it.getElementsByTagName("media:content")[0]?.getAttribute("url") ??
      parseImageFromDescription(description);
    if (image && image.startsWith("//")) image = window.location.protocol + image;
    const pubDate = get("pubDate") || undefined;
    return { title, link, description, pubDate, image, source };
  });
};

const tryFetchText = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("fetch failed");
  return await res.text();
};

async function fetchFeed(url: string) {
  // dùng proxy fallback để vượt CORS
  return await fetchTextWithFallback(url);
}

async function fetchSource(srcKey: keyof typeof RSS_SOURCES) {
  const cfg = RSS_SOURCES[srcKey];
  const allItems: RssItem[] = [];

  for (const feed of cfg.feeds) {
    try {
      const xml = await fetchFeed(feed);
      const items = parseXmlToItems(xml, srcKey);
      for (const it of items) {
        const id = b64safe(it.link || `${it.title}-${it.pubDate || ""}`);
        allItems.push({ ...it, id });
      }
    } catch (e) {
      console.warn(`[RSS] ${srcKey} feed failed:`, feed, e);
    }
  }

  // dedupe + sort by pubDate desc
  const map = new Map<string, RssItem>();
  for (const it of allItems) map.set(it.id, it);
  const merged = Array.from(map.values()).sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return db - da;
  });

  // persist index + items
  const ids: string[] = [];
  for (const it of merged) {
    localStorage.setItem(itemKey(srcKey, it.id), JSON.stringify(it));
    ids.push(it.id);
  }
  localStorage.setItem(indexKey(srcKey), JSON.stringify({ fetchedAt: Date.now(), ids }));

  // broadcast update
  window.dispatchEvent(new CustomEvent("rss:updated", { detail: { source: srcKey } }));
}

function needRefresh(srcKey: keyof typeof RSS_SOURCES) {
  try {
    const raw = localStorage.getItem(indexKey(srcKey));
    if (!raw) return true;
    const { fetchedAt } = JSON.parse(raw) as { fetchedAt: number };
    return Date.now() - fetchedAt >= TTL_MS;
  } catch {
    return true;
  }
}

// ===== component =====
export default function RssFetcher({ checkNow }: Props): JSX.Element {
  useEffect(() => {
    const run = async () => {
      for (const srcKey of Object.keys(RSS_SOURCES) as (keyof typeof RSS_SOURCES)[]) {
        if (needRefresh(srcKey)) {
          await fetchSource(srcKey);
        }
      }
    };
    run().catch(console.error);

    // optional: allow forcing refresh from outside
    const onForce = (e: CustomEvent<{ source?: keyof typeof RSS_SOURCES }>) => {
      const src = e.detail?.source;
      const doOne = async (k: keyof typeof RSS_SOURCES) => fetchSource(k).catch(console.error);
      if (src) doOne(src);
      else for (const k of Object.keys(RSS_SOURCES) as (keyof typeof RSS_SOURCES)[]) doOne(k);
    };

    const handler = onForce as unknown as EventListener;
    window.addEventListener("rss:refresh", handler);
    return () => window.removeEventListener("rss:refresh", handler);
  }, [checkNow]);

  return <></>;
}
