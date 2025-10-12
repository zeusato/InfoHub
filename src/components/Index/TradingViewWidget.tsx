import React, {
  memo,
  useEffect,
  useRef,
  useState,
  useMemo,
  MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

// Cho phép truyền string hoặc object kiểu TradingView
type TickerSymbol = { proName: string; title?: string } | string;

type Props = {
  symbols?: TickerSymbol[];
  colorTheme?: "light" | "dark";
  isTransparent?: boolean;
  height?: number | string;
  bleed?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Chu kỳ làm mới dữ liệu (ms). Mặc định 10_000ms */
  refreshMs?: number;
};

type Row = {
  symbol: string;
  displayName: string;
  current: number | null; // c
  change: number | null; // ch
  percent: number | null; // r (%)
  vo?: number | null; // KLGD
  va?: number | null; // GTGD (VND)
  ic?: { ce?: number; fl?: number; up?: number; dw?: number; uc?: number } | null;
};

// Ánh xạ mã chỉ số → symbol của TradingView
const tradingViewMap: Record<string, string> = {
  VN: "HOSE%3AVNindex",
  VN30: "HOSE%3AVN30",
  VN100: "HOSE%3AVN100",
  VNALLSHARE: "HOSE%3AVNallshare",
  VNXALLSHARE: "HOSE%3AVNallshare",
  VNDIAMOND: "HOSE%3AVNdiamond",
  VNMIDCAP: "HOSE%3AVNmidcap",
  HNX: "HNX%3AHNXINDEX",
  UPCOM: "HNX%3A301",
};

// Helpers format số
const fmt = (n: number | null | undefined) =>
  typeof n === "number" && isFinite(n) ? n.toLocaleString() : "-";

const fmtBillion = (vnd: number | null | undefined) =>
  typeof vnd === "number" && isFinite(vnd)
    ? (vnd / 1_000_000_000).toLocaleString(undefined, {
        maximumFractionDigits: 3,
        minimumFractionDigits: 0,
      })
    : "-";

// Tooltip render ra body (vượt mọi overflow), neo theo con trỏ
function PortalTooltip({
  open,
  x,
  y,
  theme,
  content,
}: {
  open: boolean;
  x: number;
  y: number;
  theme: "light" | "dark";
  content: React.ReactNode;
}) {
  if (!open) return null;
  return createPortal(
    <div
      style={{
        position: "fixed",
        left: x,
        top: y - 10,
        transform: "translate(-50%, -100%)", // vị trí tooltip nằm phía trên con trỏ 10px
        zIndex: 9999,
        pointerEvents: "none",
      }}
      className={clsx(
        "rounded-xl px-3 py-2 border backdrop-blur-md shadow-lg",
        theme === "dark"
          ? "bg-white/10 text-white border-white/20"
          : "bg-black/10 text-gray-900 border-black/15"
      )}
    >
      {content}
    </div>,
    document.body
  );
}

export default memo(function TradingViewWidget({
  symbols = [
    "VN",
    "VN100",
    "VN30",
    "HNX",
    "UPCOM",
    "VNXALLSHARE",
    "VNDIAMOND",
    "VNMIDCAP",
  ],
  colorTheme = "dark",
  isTransparent = true,
  height = 46,
  bleed = false,
  className,
  style,
  refreshMs,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const h = typeof height === "number" ? `${height}px` : height;
  const refresh = typeof refreshMs === "number" ? refreshMs : 10_000; // 10s mặc định

  const baseTextClass = colorTheme === "dark" ? "text-white" : "text-gray-800";
  const baseBgClass = !isTransparent
    ? colorTheme === "dark"
      ? "bg-gray-900"
      : "bg-white"
    : "";

  const [rows, setRows] = useState<Row[]>([]);

  // Rút mã symbol gọi API (từ string hoặc từ proName: "VENDOR:CODE")
  const symbolCodes = useMemo(() => {
    return (symbols as TickerSymbol[]).map((item) => {
      if (typeof item === "string") return item;
      const p = (item.proName || "").split(":");
      return p[p.length - 1] || item.proName;
    });
  }, [symbols]);

  // Fetch + polling
  useEffect(() => {
    if (!symbolCodes.length) return;
    let destroyed = false;
    let fetching = false;
    let timer: number | undefined;

    const load = async () => {
      if (destroyed || fetching || document.hidden) return;
      fetching = true;
      try {
        const url = `https://sboard.shs.com.vn/api/v1/market/symbolLatest?symbolList=${encodeURIComponent(
          symbolCodes.join(",")
        )}`;
        const resp = await fetch(url, { cache: "no-store" });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json: any = await resp.json();

        const list: any[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
          ? json.data
          : Object.values(json || {}).filter(
              (v) => v && typeof v === "object"
            );

        const next: Row[] = list.map((it) => {
          const s: string = it.s || it.symbol || "";
          const displayName = s === "VN" ? "VNIndex" : s;
          const c: number | null =
            typeof it.c === "number" ? it.c : it.last ?? it.close ?? null;
          const ch: number | null =
            typeof it.ch === "number" ? it.ch : it.change ?? null;
          let r: number | null = null;
          if (typeof it.r === "number") r = it.r * 100;
          else if (
            typeof ch === "number" &&
            typeof it.o === "number" &&
            it.o !== 0
          )
            r = (ch / it.o) * 100;
          const vo: number | null = typeof it.vo === "number" ? it.vo : null;
          const va: number | null = typeof it.va === "number" ? it.va : null;
          const ic = it.ic || null;
          return {
            symbol: s,
            displayName,
            current: c,
            change: ch,
            percent: r,
            vo,
            va,
            ic,
          };
        });

        if (!destroyed) setRows(next);
      } catch (e) {
        console.error(e);
      } finally {
        fetching = false;
      }
    };

    load();
    timer = window.setInterval(load, refresh) as unknown as number;

    const onVis = () => !document.hidden && load();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      destroyed = true;
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [symbolCodes, refresh]);

  // Màu toàn item theo biến động (null → xám, >0 xanh, <0 đỏ, =0 vàng)
  const colorByChange = (ch: number | null) =>
    ch == null
      ? "text-gray-400"
      : ch > 0
      ? "text-green-500"
      : ch < 0
      ? "text-red-500"
      : "text-yellow-400";

  // --- State & handlers cho tooltip portal theo con trỏ ---
  const [ttOpen, setTtOpen] = useState(false);
  const [ttX, setTtX] = useState(0);
  const [ttY, setTtY] = useState(0);
  const [ttNode, setTtNode] = useState<React.ReactNode>(null);

  const renderTooltipContent = (r: Row) => (
    <div>
      <div className="font-semibold mb-1">
        <span>{r.displayName}</span>{" "}
        <span className="text-emerald-400">{fmt(r.current)}</span>{" "}
        {typeof r.change === "number" && typeof r.percent === "number" && (
          <span>
            {" ("}
            <span
              className={
                r.change > 0
                  ? "text-emerald-400"
                  : r.change < 0
                  ? "text-red-500"
                  : "text-yellow-400"
              }
            >
              {r.change > 0 ? "+" : ""}
              {r.change.toFixed(2)}
            </span>
            {" | "}
            <span
              className={
                r.change > 0
                  ? "text-emerald-400"
                  : r.change < 0
                  ? "text-red-500"
                  : "text-yellow-400"
              }
            >
              {r.percent.toFixed(2)}%
            </span>
            {")"}
          </span>
        )}
      </div>
      {typeof r.vo === "number" && (
        <div>
          KLGD: <span className="font-semibold">{fmt(r.vo)}</span>{" "}
          <span className="opacity-75">CP</span>
        </div>
      )}
      {typeof r.va === "number" && (
        <div>
          GTGD: <span className="font-semibold">{fmtBillion(r.va)}</span>{" "}
          <span className="opacity-75">Tỷ</span>
        </div>
      )}
      {r.ic && (
        <div className="mt-1 flex items-center gap-4">
          <span className="text-green-500">
            {fmt(r.ic.up)}{" "}
            <span className="text-purple-400">({fmt(r.ic.ce)})</span>
          </span>
          <span className="text-yellow-400">{fmt(r.ic.uc)}</span>
          <span className="text-red-500">
            {fmt(r.ic.dw)}{" "}
            <span className="text-cyan-400">({fmt(r.ic.fl)})</span>
          </span>
        </div>
      )}
    </div>
  );

  const showTooltip = (e: MouseEvent<HTMLDivElement>, r: Row) => {
    setTtNode(renderTooltipContent(r));
    setTtX(e.clientX);
    setTtY(e.clientY);
    setTtOpen(true);
  };
  const moveTooltip = (e: MouseEvent<HTMLDivElement>) => {
    setTtX(e.clientX);
    setTtY(e.clientY);
  };
  const hideTooltip = () => setTtOpen(false);

  return (
    <div
      ref={wrapperRef}
      className={clsx(
        "tradingview-widget-container w-full",
        className,
        bleed && "-mx-4 md:-mx-6"
      )}
      style={{ ...(style || {}) }}
    >
      {/* CSS ticker: double-track, pause on hover */}
      <style>{`
        .ticker { position: relative; }
        .ticker__viewport {
          overflow: hidden; width: 100%; height: 100%;
          display: flex; align-items: center; /* căn giữa dọc */
        }
        .ticker__track {
          display: inline-flex;
          white-space: nowrap;
          will-change: transform;
          animation: ticker-scroll var(--ticker-duration, 60s) linear infinite;
          align-items: center; line-height: 1;
        }
        .ticker:hover .ticker__track { animation-play-state: paused; }
        @keyframes ticker-scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      `}</style>

      {/* Tooltip vượt khung, bám theo con trỏ */}
      <PortalTooltip
        open={ttOpen}
        x={ttX}
        y={ttY}
        theme={colorTheme}
        content={ttNode}
      />

      <div className={clsx("ticker", baseTextClass, baseBgClass)} style={{ height: h }}>
        <div className="ticker__viewport">
          <div
            className="ticker__track"
            style={{ ["--ticker-duration" as any]: "60s" }}
          >
            {/* Track 1 */}
            {rows.map((r) => {
              const col = colorByChange(r.change);
              const tvSym = tradingViewMap[r.symbol.toUpperCase()];
              return (
                <div
                  key={`a-${r.symbol}`}
                  className={clsx(
                    "relative group flex items-center gap-1 px-3 py-1 border-r border-gray-600 cursor-pointer hover:opacity-90",
                    col
                  )}
                  onMouseEnter={(e) => showTooltip(e, r)}
                  onMouseMove={moveTooltip}
                  onMouseLeave={hideTooltip}
                  onClick={() => {
                    if (tvSym)
                      window.open(
                        `https://www.tradingview.com/chart/?symbol=${tvSym}`,
                        "_blank"
                      );
                  }}
                >
                  <span className="font-medium">{r.displayName}</span>
                  {r.current !== null && <span>{fmt(r.current)}</span>}
                  {r.change !== null && r.percent !== null && (
                    <span>
                      {r.change > 0 ? "+" : r.change < 0 ? "" : ""}
                      {typeof r.change === "number"
                        ? r.change.toFixed(2)
                        : r.change}
                      {" ("}
                      {typeof r.percent === "number"
                        ? r.percent.toFixed(2)
                        : r.percent}
                      {"%)"}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Spacer giữa 2 track (≈ 1 item) */}
            <div className="w-[140px]" aria-hidden="true" />

            {/* Track 2 (nhân đôi để loop liền mạch) */}
            {rows.map((r) => {
              const col = colorByChange(r.change);
              const tvSym = tradingViewMap[r.symbol.toUpperCase()];
              return (
                <div
                  key={`b-${r.symbol}`}
                  className={clsx(
                    "relative group flex items-center gap-1 px-3 py-1 border-r border-gray-600 cursor-pointer hover:opacity-90",
                    col
                  )}
                  onMouseEnter={(e) => showTooltip(e, r)}
                  onMouseMove={moveTooltip}
                  onMouseLeave={hideTooltip}
                  onClick={() => {
                    if (tvSym)
                      window.open(
                        `https://www.tradingview.com/chart/HXqbgYu4/?symbol=${tvSym}`,
                        "_blank"
                      );
                  }}
                >
                  <span className="font-medium">{r.displayName}</span>
                  {r.current !== null && <span>{fmt(r.current)}</span>}
                  {r.change !== null && r.percent !== null && (
                    <span>
                      {r.change > 0 ? "+" : r.change < 0 ? "" : ""}
                      {typeof r.change === "number"
                        ? r.change.toFixed(2)
                        : r.change}
                      {" ("}
                      {typeof r.percent === "number"
                        ? r.percent.toFixed(2)
                        : r.percent}
                      {"%)"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});
