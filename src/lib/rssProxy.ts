// src/lib/rssProxy.ts
// PROXY_BASE: đặt ở .env hoặc môi trường build (prod): VITE_RSS_PROXY_BASE="https://<your-worker>/fetch"
export const PROXY_BASE = import.meta.env.VITE_RSS_PROXY_BASE || "";

const toHttps = (u: string) => u.replace(/^http:\/\//i, "https://");
const enc = (u: string) => encodeURIComponent(u);

export function buildCandidates(rawUrl: string): string[] {
  const httpsUrl = toHttps(rawUrl);

  const urls: string[] = [];
  // 1) Prod proxy (Cloudflare Worker / serverless)
  if (PROXY_BASE) urls.push(`${PROXY_BASE}?url=${enc(httpsUrl)}`);

  // 2) Dev proxy (vite server.proxy → /_p -> allorigins)
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    urls.push(`/_p?url=${enc(httpsUrl)}`);
  }

  // 3) AllOrigins
  urls.push(`https://api.allorigins.win/raw?url=${enc(httpsUrl)}`);

  // 4) Direct (nhiều site sẽ fail CORS, nhưng cứ thử)
  urls.push(httpsUrl);

  // 5) Rất cuối: r.jina.ai (Readability – text-only nhưng thường vượt CORS)
  const hostless = httpsUrl.replace(/^https?:\/\//, "");
  urls.push(`https://r.jina.ai/http://${hostless}`);

  return urls;
}

export async function fetchTextWithFallback(url: string): Promise<string> {
  const candidates = buildCandidates(url);
  let lastErr: any;
  for (const u of candidates) {
    try {
      const res = await fetch(u, { redirect: "follow" as RequestRedirect, mode: "cors" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      lastErr = e;
      // thử tiếp
    }
  }
  throw lastErr ?? new Error("All proxy candidates failed");
}

// Nếu cần iframe src "an toàn"
export function iframeSrcFor(url: string): string {
  const httpsUrl = toHttps(url);
  if (PROXY_BASE) return `${PROXY_BASE}?url=${enc(httpsUrl)}`;
  // allorigins trả text/plain nên không đẹp trong iframe → thôi trả link gốc
  return httpsUrl;
}
