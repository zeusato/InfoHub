import type { Theme } from '@/hooks/useTheme';

// Production iframe entry. Override only with a public HTTPS embed URL;
// never put an authentication/bypass token in this frontend configuration.
const DEFAULT_EMBED_URL = 'https://shone-platform.vercel.app/embed/infohub/board';

export function createShoneEmbedUrl(configured: string | undefined, theme: Theme): URL | null {
  try {
    const url = new URL(configured?.trim() || DEFAULT_EMBED_URL);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    url.searchParams.set('theme', theme);
    return url;
  } catch {
    return null;
  }
}

export function isShoneReady(event: MessageEvent, frameWindow: Window | null, origin: string): boolean {
  if (!frameWindow || event.source !== frameWindow || event.origin !== origin) return false;
  const data: unknown = event.data;
  if (!data || typeof data !== 'object') return false;
  const message = data as Record<string, unknown>;
  return message.source === 'shs-embed' && message.version === 1 && message.type === 'ready';
}
