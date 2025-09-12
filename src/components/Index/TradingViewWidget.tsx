// src/components/TradingViewWidget.tsx
import React, { memo, useEffect, useRef } from "react";
import clsx from "clsx";

type TickerSymbol = { proName: string; title?: string };

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
  // Giữ nguyên list mã như file JSX cũ của đại ca
  symbols = [
    { proName: "SPREADEX:DJI", title: "" },
    { proName: "NASDAQ:IXIC", title: "" },
    { proName: "FXOPEN:HSI", title: "" },
    { proName: "HNX:HNXINDEX", title: "" },
  ],
  colorTheme = "dark",
  locale = "vi",
  largeChartUrl = "",
  isTransparent = true,
  showSymbolLogo = true,
  displayMode = "adaptive",
  useContainerSize = true,
  height = 46, // ticker mặc định cao ~46px
  bleed = false,
  className,
  style,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const containerIdRef = useRef(`tv_tape_${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!wrapperRef.current || !innerRef.current) return;

    // cleanup script cũ
    if (scriptRef.current && scriptRef.current.parentNode) {
      scriptRef.current.parentNode.removeChild(scriptRef.current);
      scriptRef.current = null;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;

    const config: Record<string, unknown> = {
      symbols,
      colorTheme,
      locale,
      largeChartUrl,
      isTransparent,
      showSymbolLogo,
      displayMode,
    };

    if (useContainerSize) {
      // TradingView sẽ vẽ vào đúng container này và lấy width/height theo CSS của nó
      config["container_id"] = containerIdRef.current;
      config["use_container_size"] = true;
    }

    script.innerHTML = JSON.stringify(config);
    innerRef.current.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    symbols,
    colorTheme,
    locale,
    largeChartUrl,
    isTransparent,
    showSymbolLogo,
    displayMode,
    useContainerSize,
  ]);

  // chuẩn hoá height
  const h = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      ref={wrapperRef}
      className={clsx("tradingview-widget-container w-full", className, bleed && "-mx-4 md:-mx-6")}
      style={style}
    >
      {/* Container thật sự mà widget bám vào */}
      <div
        id={containerIdRef.current}
        ref={innerRef}
        className="tradingview-widget-container__widget w-full"
        style={{ height: h }}
      />
    </div>
  );
}

export default memo(TradingViewWidget);
