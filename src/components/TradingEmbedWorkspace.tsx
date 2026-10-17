import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { createShoneEmbedUrl, isShoneReady } from '@/lib/shoneEmbed';

type Props = { onClose: () => void };
type Connection = 'loading' | 'ready' | 'unavailable';

export default function TradingEmbedWorkspace({ onClose }: Props) {
  const { theme } = useTheme();
  const frame = useRef<HTMLIFrameElement>(null);
  // Keep src stable when the theme changes, so an authenticated frame is not reloaded.
  const [url] = useState(() => createShoneEmbedUrl(import.meta.env.VITE_SHONE_EMBED_URL, theme));
  const [attempt, setAttempt] = useState(0);
  const [connection, setConnection] = useState<Connection>('loading');

  useEffect(() => {
    if (!url) return;
    const timeout = window.setTimeout(() => setConnection('unavailable'), 20000);
    const receive = (event: MessageEvent) => {
      if (!isShoneReady(event, frame.current?.contentWindow ?? null, url.origin)) return;
      window.clearTimeout(timeout);
      setConnection('ready');
    };
    window.addEventListener('message', receive);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('message', receive);
    };
  }, [url, attempt]);

  useEffect(() => {
    if (connection !== 'ready' || !url) return;
    frame.current?.contentWindow?.postMessage({
      source: 'shs-embed', version: 1, type: 'set_theme', payload: { theme },
    }, url.origin);
  }, [theme, connection, url]);

  const status = !url ? 'URL SHOne chưa hợp lệ'
    : connection === 'ready' ? 'SHOne'
    : connection === 'loading' ? 'Đang kết nối SHOne…'
    : 'Chưa kết nối được SHOne';

  return (
    <div className="flex h-[max(520px,calc(100dvh-320px))] min-w-0 flex-col bg-[var(--bg-primary)]">
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--border-color)] px-2 text-sm">
        <button type="button" onClick={onClose}
          className="flex h-11 shrink-0 items-center gap-1 px-2 hover:text-brand"
          aria-label="Quay lại nội dung InfoHub">
          <ArrowLeft size={16} aria-hidden="true" /> InfoHub
        </button>
        <span role="status" aria-live="polite" className="min-w-0 flex-1 truncate text-[var(--text-secondary)]" title={status}>
          {status}
        </span>
        <button type="button" disabled={!url} aria-label="Tải lại SHOne" title="Tải lại SHOne"
          className="flex h-11 w-11 shrink-0 items-center justify-center hover:text-brand disabled:opacity-40"
          onClick={() => { setConnection('loading'); setAttempt(value => value + 1); }}>
          <RotateCw size={16} aria-hidden="true" />
        </button>
      </div>
      {url ? (
        <iframe key={attempt} ref={frame} src={url.href} title="SHOne Trading System"
          className="block min-h-0 w-full flex-1 border-0 bg-[var(--bg-primary)]"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="storage-access"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
        />
      ) : (
        <p role="alert" className="p-4 text-sm">Chưa thể mở SHOne. Vui lòng kiểm tra cấu hình đường dẫn nhúng.</p>
      )}
    </div>
  );
}
