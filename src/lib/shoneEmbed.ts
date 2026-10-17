import type { Theme } from '@/hooks/useTheme';

// Branch alias stays stable across embed-mode deployments. Replace through the build variable
// when embed is enabled on SHOne production; never put an authentication/bypass token here.
const DEFAULT_EMBED_URL = 'https://shone-git-embed-mode-manhquyet88-gmailcoms-projects.vercel.app/embed/demo/board';

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
