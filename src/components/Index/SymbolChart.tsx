// src/components/SymbolChart.tsx
import React, { useEffect, useRef } from 'react';

// We import the charting primitives from TradingView's lightweight-charts.  This
// library is expected to be available in the host environment.  If you do not
// already have it installed, please add it to your project (e.g. via npm
// install lightweight-charts).  The main entrypoint exports the createChart
// function used below.
import { createChart, type IChartApi, type ISeriesApi } from 'lightweight-charts';

/**
 * Props for the SymbolChart component.  Only the symbol is required.  You can
 * optionally specify a height and a color theme.  The width will always
 * stretch to 100% of the parent container.
 */
export interface SymbolChartProps {
  /**
   * The market symbol to fetch minute chart data for (e.g. "VN", "VN30", etc.).
   */
  symbol: string;
  /**
   * Height of the chart.  Can be a number (pixels) or any valid CSS length.
   * Defaults to 300.
   */
  height?: number | string;
  /**
   * Color theme of the chart.  Dark theme yields white/gray text on a dark
   * background, while light theme uses dark text on a light background.
   */
  colorTheme?: 'light' | 'dark';
}

/**
 * SymbolChart renders an intraday price chart using the minuteChart API
 * provided by SHS (https://sboard.shs.com.vn/api/v1/market/minuteChart?symbol=...).
 * It utilises the lightweight-charts library from TradingView to display a
 * smooth, responsive line/area chart.  The component automatically handles
 * fetching, parsing and feeding data into the chart, as well as resizing
 * behaviour when the parent container changes size.
 */
export default function SymbolChart({
  symbol,
  height = 300,
  colorTheme = 'dark',
}: SymbolChartProps) {
  // Ref to the container element into which the chart will be mounted.
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  // Ref to the chart instance so we can clean it up on unmount.
  const chartRef = useRef<IChartApi | null>(null);
  // Ref to the series instance (we're using an area series).
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  useEffect(() => {
    const container = chartContainerRef.current;
    // Do nothing on the server or if no container is present yet.
    if (!container) return;
    // If a chart already exists (due to a previous render), remove it before creating
    // a new one.  This ensures that theme or height changes do not cause
    // overlapping charts.
    if (chartRef.current) {
      if (seriesRef.current) {
        chartRef.current.removeSeries(seriesRef.current);
      }
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }
    // Clear any existing child nodes (protects against duplicate charts when
    // React refreshes this component).
    container.innerHTML = '';
    // Create a new chart instance with options based on the current theme.
    const chart = createChart(container, {
      width: container.clientWidth,
      height: typeof height === 'number' ? height : undefined,
      layout: {
        textColor: colorTheme === 'dark' ? '#f5f5f5' : '#2c2c2c',
        background: {
          type: 'solid' as any,
          color: colorTheme === 'dark' ? '#0a0e23' : '#ffffff',
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        visible: true,
      },
      grid: {
        horzLines: {
          color: colorTheme === 'dark'
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(0,0,0,0.05)',
        },
        vertLines: {
          color: colorTheme === 'dark'
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(0,0,0,0.05)',
        },
      },
    });
    chartRef.current = chart;
    // Add an area series to display price values.  Area charts look nice
    // against dark backgrounds; adjust the colours for light themes.
    const areaSeries = chart.addAreaSeries({
      lineColor: colorTheme === 'dark' ? '#4fd1c5' : '#2c7be5',
      topColor: colorTheme === 'dark'
        ? 'rgba(79, 209, 197, 0.4)'
        : 'rgba(44, 123, 229, 0.4)',
      bottomColor: colorTheme === 'dark'
        ? 'rgba(79, 209, 197, 0.05)'
        : 'rgba(44, 123, 229, 0.05)',
    });
    seriesRef.current = areaSeries;
    // Resize handling: update chart width whenever the container resizes.
    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current && container) {
        chartRef.current.applyOptions({ width: container.clientWidth });
      }
    });
    resizeObserver.observe(container);
    // Cleanup on unmount or dependency change.
    return () => {
      resizeObserver.disconnect();
      if (seriesRef.current) {
        chartRef.current?.removeSeries(seriesRef.current);
      }
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [colorTheme, height]);

  useEffect(() => {
    if (!symbol) return;
    // Abort controller to cancel fetch if symbol changes quickly.
    const controller = new AbortController();
    (async () => {
      try {
        const url = `https://sboard.shs.com.vn/api/v1/market/minuteChart?symbol=${encodeURIComponent(
          symbol
        )}`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        const json: any = await response.json();
        /**
         * The minuteChart API returns an object whose properties are arrays of
         * equal length.  Typical fields include:
         *  - t: array of timestamps (epoch seconds)
         *  - v: array of index values (giá trị chỉ số) or close prices
         *  - c: array of close prices (alternative to v)
         *  - vo: array of traded volume (khối lượng khớp lệnh)
         *  - va: array of traded value (giá trị khớp lệnh)
         *
         * We only care about time and the index value to draw the chart.
         */
        let transformed: { time: number; value: number }[] = [];
        if (json && typeof json === 'object') {
          const times: number[] | undefined = Array.isArray(json.t)
            ? json.t
            : undefined;
          // Prefer the `v` array for values if present; fallback to `c`.
          const values: number[] | undefined = Array.isArray(json.v)
            ? json.v
            : Array.isArray(json.c)
            ? json.c
            : undefined;
          if (times && values && times.length === values.length) {
            transformed = times
              .map((tVal: any, idx: number) => {
                const timeNum = typeof tVal === 'number' ? tVal : null;
                const val = values[idx];
                if (timeNum == null || val == null || isNaN(val)) {
                  return null;
                }
                // The API provides timestamps in epoch seconds.  We can pass
                // them directly to lightweight-charts.
                return { time: timeNum, value: val };
              })
              .filter((p): p is { time: number; value: number } => p !== null);
          }
        }
        // Update the series if available.  Clear if no data.
        if (seriesRef.current) {
          seriesRef.current.setData(transformed as any);
        }
      } catch (error) {
        // Network or parsing error; silently ignore and keep existing chart
        console.error(error);
      }
    })();
    return () => {
      controller.abort();
    };
  }, [symbol]);

  // Render a container div with inline height and full width.  The chart will
  // fill this element completely.
  return (
    <div
      ref={chartContainerRef}
      style={{
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        // Use relative positioning to allow the chart to size correctly.
        position: 'relative',
      }}
    />
  );
}