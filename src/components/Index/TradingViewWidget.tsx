// src/components/TradingViewWidget.tsx
import React, { memo, useEffect, useRef, useState, useMemo } from "react";
import clsx from "clsx";

/**
 * TickerSymbol describes the shape of each ticker entry passed into the widget.
 * In the original TradingView implementation the proName included a vendor
 * prefix (e.g. "SPREADEX:DJI").  For our purposes we only care about the
 * symbol code itself (the part after the colon).  If you supply plain
 * strings instead of objects the value will be treated as the symbol code
 * directly.  The optional `title` field is retained for compatibility but
 * unused in our custom rendering.
 */
type TickerSymbol = { proName: string; title?: string } | string;

type Props = {
  symbols?: TickerSymbol[];
  colorTheme?: "light" | "dark";
  locale?: string;
  largeChartUrl?: string;
  isTransparent?: boolean;
  showSymbolLogo?: boolean;
  displayMode?: "adaptive" | "regular";
  /** Cho widget dùng kích thước của container (rộng 100%, cao theo container) */
  useContainerSize?: boolean;
  /** Chiều cao của vùng widget; vd 46, '48px', '3rem'... */
  height?: number | string;
  /** Tràn mép ngang (âm margin) để full-bleed trong footer */
  bleed?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

function TradingViewWidget({
  /**
   * Danh sách các symbol cần lấy dữ liệu.  Bạn có thể truyền vào một mảng
   * string (ví dụ ["VN", "VN30"]) hoặc mảng các object có trường proName.
   * Nếu để trống sẽ dùng các mã chỉ số phổ biến của thị trường Việt Nam.
   */
  symbols = ["VN", "VN100", "VN30", "HNX", "UPCOM", "VNXALLSHARE", "VNDIAMOND", "VNMIDCAP"],
  /** Chủ đề màu: dark hoặc light. Ảnh hưởng tới màu chữ. */
  colorTheme = "dark",
  /**
   * Tùy chọn hiển thị liệu nền widget có trong suốt hay không.  Hiện tại
   * chúng tôi chỉ dùng để tính màu nền; TradingView yêu cầu tham số này
   * nên giữ lại để tương thích API.  Khi isTransparent=true sẽ không đặt
   * màu nền, ngược lại đặt màu nền phù hợp với theme.
   */
  isTransparent = true,
  /** Chiều cao của widget, nhận vào số hoặc chuỗi. */
  height = 46,
  /** Nếu đặt bleed=true thì widget sẽ có margin âm để tràn cạnh ngang. */
  bleed = false,
  className,
  style,
}: Props) {
  // Bản đồ ánh xạ mã chỉ số sang symbol sử dụng cho đường dẫn TradingView.  Khi
  // click vào một item trong ticker, chúng ta sẽ dùng bản đồ này để mở
  // chart TradingView ở tab mới theo cú pháp:
  // https://www.tradingview.com/chart/HXqbgYu4/?symbol=[Symbol on tradingview]
  // Chú ý: một số mã có thể được viết theo nhiều cách, vì vậy chúng ta lưu
  // cả phiên bản viết hoa và viết thường (nếu cần) vào đây.  Bạn có thể
  // mở rộng danh sách này khi cần thêm chỉ số mới.
  const tradingViewMap: Record<string, string> = {
    VN: 'HOSE%3AVNindex',
    VN30: 'HOSE%3AVN30',
    VN100: 'HOSE%3AVN100',
    VNALLSHARE: 'HOSE%3AVNallshare',
    VNXALLSHARE: 'HOSE%3AVNallshare',
    VNDIAMOND: 'HOSE%3AVNdiamond',
    VNMIDCAP: 'HOSE%3AVNmidcap',
    HNX: 'HNX%3AHNXINDEX',
    UPCOM: 'HNX%3A301',
  };
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  // Nội dung scrollable sẽ được tham chiếu để áp dụng hiệu ứng dịch chuyển.
  const contentRef = useRef<HTMLDivElement | null>(null);
  // Trạng thái dừng/chạy khi hover vào slider.
  const [isPaused, setIsPaused] = useState(false);
  // Lưu trạng thái dữ liệu ticker sau khi fetch từ API.
  const [tickerData, setTickerData] = useState<
    {
      symbol: string;
      displayName: string;
      current: number | null;
      change: number | null;
      percent: number | null;
    }[]
  >([]);

  /**
   * Từ danh sách symbols nhận vào (có thể là string hoặc object), trích xuất
   * mã (code) để gọi API.  Nếu phần tử là chuỗi sẽ dùng trực tiếp, nếu là
   * object và có tiền tố trước dấu ":" thì lấy phần phía sau dấu ":".
   */
  const symbolCodes = useMemo(() => {
    return (symbols as TickerSymbol[]).map((item) => {
      if (typeof item === "string") return item;
      const proName = item.proName || "";
      const parts = proName.split(":");
      return parts[parts.length - 1] || proName;
    });
  }, [symbols]);

  useEffect(() => {
    // Nếu không có symbol nào thì không cần fetch.
    if (!symbolCodes || symbolCodes.length === 0) {
      setTickerData([]);
      return;
    }
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const query = symbolCodes.join(",");
        const url = `https://sboard.shs.com.vn/api/v1/market/symbolLatest?symbolList=${encodeURIComponent(
          query
        )}`;
        const resp = await fetch(url, { signal: controller.signal });
        if (!resp.ok) {
          throw new Error(`HTTP error ${resp.status}`);
        }
        const json: any = await resp.json();
        // Xử lý response. API có thể trả về mảng hoặc object.  Chúng ta
        // chuyển thành mảng các item.
        let items: any[] = [];
        if (Array.isArray(json)) {
          items = json;
        } else if (json && typeof json === "object") {
          // Một số API trả về dạng { data: {...} }
          if (Array.isArray(json.data)) {
            items = json.data;
          } else {
            // Lấy mọi giá trị của object.  Bỏ qua các khóa không phải item.
            items = Object.values(json).filter((v) => v && typeof v === "object");
          }
        }
        const processed = items.map((item: any) => {
          const symbol: string = item.s || item.symbol || "";
          // Hiển thị VN thành VNIndex, các symbol khác giữ nguyên.
          const displayName = symbol === "VN" ? "VNIndex" : symbol;
          const current: number | null =
            typeof item.c === "number"
              ? item.c
              : item.last ?? item.close ?? null;
          const change: number | null =
            typeof item.ch === "number"
              ? item.ch
              : item.change ?? null;
          // Tỷ lệ biến động r được nhân 100 để thành phần trăm. Nếu không có r
          // nhưng có giá mở cửa (o) và thay đổi tuyệt đối, ta có thể tính.
          let percent: number | null = null;
          if (typeof item.r === "number") {
            percent = item.r * 100;
          } else if (typeof change === "number" && typeof item.o === "number" && item.o !== 0) {
            percent = (change / item.o) * 100;
          }
          return { symbol, displayName, current, change, percent };
        });
        setTickerData(processed);
      } catch (err) {
        // Nếu có lỗi (có thể do CORS hoặc đường mạng), giữ nguyên dữ liệu cũ
        console.error(err);
      }
    };
    fetchData();
    return () => {
      controller.abort();
    };
  }, [symbolCodes]);

  // Chuẩn hoá height: nếu là số thì chuyển sang px.
  const h = typeof height === "number" ? `${height}px` : height;

  /**
   * Tính toán các lớp màu sắc dựa trên theme và mức độ trong suốt.  Nếu
   * isTransparent=true thì chỉ set màu chữ; nếu false thì gán màu nền.
   */
  const baseTextClass = colorTheme === "dark" ? "text-white" : "text-gray-800";
  const baseBgClass = !isTransparent
    ? colorTheme === "dark"
      ? "bg-gray-900"
      : "bg-white"
    : "";

  // Không gian chừa bên phải để hiển thị phần text "made with love" nằm ngoài widget.
  const reservedSpace = "8rem";

  // Data hiển thị nhân đôi để tạo hiệu ứng lặp liên tục.
  const displayData = useMemo(() => {
    return tickerData.length > 0 ? tickerData.concat(tickerData) : [];
  }, [tickerData]);

  // Hiệu ứng ticker chạy từ phải sang trái liên tục.
  useEffect(() => {
    const el = contentRef.current;
    if (!el || displayData.length === 0) return;
    let startX = 0;
    let lastTime: number | null = null;
    let frameId: number;
    // Vận tốc dịch chuyển (px mỗi giây). Chỉnh thông số nhỏ để chậm rãi.
    const speed = 30;
    const step = (timestamp: number) => {
      if (lastTime === null) lastTime = timestamp;
      const delta = timestamp - (lastTime as number);
      lastTime = timestamp;
      if (!isPaused) {
        startX -= (speed * delta) / 1000;
        const halfWidth = el.scrollWidth / 2;
        if (-startX >= halfWidth) {
          // Khi đã dịch hết chiều rộng một nửa (một vòng), reset về 0 để lặp.
          startX = 0;
        }
        el.style.transform = `translateX(${startX}px)`;
      }
      frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [displayData, isPaused]);

  return (
    <div
      ref={wrapperRef}
      className={clsx("tradingview-widget-container w-full", className, bleed && "-mx-4 md:-mx-6")}
      // Dùng padding-right để chừa chỗ bên phải cho "made with love"
      style={{ ...(style || {})}}
    >
      {/* CSS keyframes cho ticker – loop mượt, pause on hover */}
      <style>{`
        .ticker { position: relative; }
        .ticker__viewport {
          overflow: hidden; width: 100%; height: 100%;
          /* thêm: biến viewport thành flex để căn giữa dọc */
          display: flex; align-items: center;
        }
        .ticker__track {
          display: inline-flex;
          white-space: nowrap;
          will-change: transform;
          animation: ticker-scroll var(--ticker-duration, 60s) linear infinite;
          transform: translateX(0);
          /* thêm: căn giữa dọc các item trong track */
          align-items: center;
          line-height: 1;
        }
        .ticker:hover .ticker__track { animation-play-state: paused; }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>

      <div
        className={clsx(
          "ticker",
          baseTextClass,
          baseBgClass
        )}
        style={{ height: h }}
      >
        <div className="ticker__viewport">
          <div
            className="ticker__track"
            // có thể chỉnh tốc độ ở đây: 60s, 45s, 90s...
            style={{ ["--ticker-duration" as any]: "60s" }}
          >
            {/* Track 1 */}
            {tickerData.map(({ symbol, displayName, current, change, percent }) => {
              const changePositive = typeof change === "number" && change > 0;
              const changeNegative = typeof change === "number" && change < 0;
              const changeColorClass = changePositive
                ? "text-green-500"
                : changeNegative
                ? "text-red-500"
                : "text-gray-400";
              return (
                <div
                  key={`a-${symbol}`}
                  className="flex items-center gap-1 px-3 py-1 border-r border-gray-600 cursor-pointer "
                  onClick={() => {
                    // Khi click vào một mã chỉ số, nếu có ánh xạ tới TradingView
                    // thì mở tab mới chứa biểu đồ của mã đó.  Bỏ qua nếu không có.
                    const code = symbol.toUpperCase();
                    const tvSym = tradingViewMap[code];
                    if (tvSym) {
                      const url = `https://www.tradingview.com/chart/HXqbgYu4/?symbol=${tvSym}`;
                      window.open(url, '_blank');
                    }
                  }}
                >
                  <span className="font-medium">{displayName}</span>
                  {current !== null && <span>{Number(current).toLocaleString()}</span>}
                  {change !== null && percent !== null && (
                    <span className={clsx("ml-1", changeColorClass)}>
                      {change > 0 ? "+" : change < 0 ? "" : ""}
                      {typeof change === "number" ? change.toFixed(2) : change}
                      {` (`}
                      {typeof percent === "number" ? percent.toFixed(2) : percent}
                      {`%)`}
                    </span>
                  )}
                </div>
              );
            })}

            {/* 👇 Thêm khoảng trống giữa hai track */}
            <div className="w-[140px]" aria-hidden="true" />

            {/* Track 2 (nhân đôi để loop liền mạch) */}
            {tickerData.map(({ symbol, displayName, current, change, percent }) => {
              const changePositive = typeof change === "number" && change > 0;
              const changeNegative = typeof change === "number" && change < 0;
              const changeColorClass = changePositive
                ? "text-green-500"
                : changeNegative
                ? "text-red-500"
                : "text-gray-400";
              return (
                <div
                  key={`b-${symbol}`}
                  className="flex items-center gap-1 px-3 py-1 border-r border-gray-600 cursor-pointer "
                                    onClick={() => {
                    // Khi click vào một mã chỉ số, nếu có ánh xạ tới TradingView
                    // thì mở tab mới chứa biểu đồ của mã đó.  Bỏ qua nếu không có.
                    const code = symbol.toUpperCase();
                    const tvSym = tradingViewMap[code];
                    if (tvSym) {
                      const url = `https://www.tradingview.com/chart/HXqbgYu4/?symbol=${tvSym}`;
                      window.open(url, '_blank');
                    }
                  }}
                >
                  <span className="font-medium">{displayName}</span>
                  {current !== null && <span>{Number(current).toLocaleString()}</span>}
                  {change !== null && percent !== null && (
                    <span className={clsx("ml-1", changeColorClass)}>
                      {change > 0 ? "+" : change < 0 ? "" : ""}
                      {typeof change === "number" ? change.toFixed(2) : change}
                      {` (`}
                      {typeof percent === "number" ? percent.toFixed(2) : percent}
                      {`%)`}
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
}

export default memo(TradingViewWidget);
