import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import {
  GridComponentOption,
  TooltipComponentOption,
  DataZoomComponentOption,
  MarkLineComponentOption,
  MarkAreaComponentOption,
} from "echarts/components";
import { LineSeriesOption, BarSeriesOption } from "echarts/charts";
import type { XAXisOption, YAXisOption } from "echarts/types/dist/shared";

// Tổng hợp kiểu Option
type ECOption = echarts.ComposeOption<
  | GridComponentOption
  | TooltipComponentOption
  | DataZoomComponentOption
  | XAXisOption
  | YAXisOption
  | MarkLineComponentOption
  | MarkAreaComponentOption
  | LineSeriesOption
  | BarSeriesOption
>;


type MinuteChartResponse = {
  c: number[]; // close per minute
  v: number[]; // volume per minute
  t: number[]; // timestamps (epoch seconds or ms)
  va?: number[]; // cumulative value (optional)
  vo?: number[]; // cumulative volume (optional)
  symbol?: string;
};

type Props = {
  symbol: string;
  /** Nếu đã có dữ liệu rồi thì truyền thẳng (ưu tiên). Nếu không, component sẽ fetch từ API. */
  data?: MinuteChartResponse;
  /** Bật tắt vùng tô nghỉ trưa 11:30–13:00 */
  showMiddayBreakShade?: boolean;
  /** Height tổng của chart */
  height?: number | string;
};

const TZ = "Asia/Bangkok"; // VN/ICT

function toMs(ts: number) {
  // Chuẩn hóa về ms
  return ts < 2_000_000_000 ? ts * 1000 : ts;
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function fmtHHmm(tsMs: number) {
  const d = new Date(tsMs);
  const hh = d.getHours();
  const mm = d.getMinutes();
  return `${pad(hh)}:${pad(mm)}`;
}

/** Lấy ngày (YYYY, M, D) theo mốc t đầu tiên để dựng mốc phiên giao dịch VN */
function sessionAnchors(tsMs: number) {
  const d = new Date(tsMs);
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();

  const mk = (h: number, min = 0) => new Date(y, m, day, h, min, 0, 0).getTime();
  return {
    morningStart: mk(9, 0),    // 09:00
    morningEnd: mk(11, 30),    // 11:30
    afternoonStart: mk(13, 0), // 13:00
    atcEnd: mk(14, 45),        // 14:45
  };
}

/** Map dữ liệu API -> mảng [time, value] cho ECharts */
function mapSeries(data: MinuteChartResponse) {
  const { c, v, t } = data;
  const price: [number, number][] = [];
  const volume: Array<{ value: [number, number]; itemStyle?: any }> = [];

  for (let i = 0; i < t.length; i++) {
    const ts = toMs(t[i]);
    const close = c[i];
    const vol = v[i];

    price.push([ts, close]);

    // tô màu volume: xanh nếu tăng so với điểm trước, đỏ nếu giảm
    const prevClose = i > 0 ? c[i - 1] : c[i];
    const up = close >= prevClose;
    volume.push({
      value: [ts, vol],
      itemStyle: { color: up ? "#26a69a" : "#ef5350" },
    });
  }
  return { price, volume };
}

/** Tooltip formatter: hiện thời gian, giá, volume, (vo/va nếu có) */
function buildTooltip(data?: MinuteChartResponse) {
  return (params: any) => {
    // params là mảng (line + bar) khi trigger='axis'
    if (!params || params.length === 0) return "";
    const p = Array.isArray(params) ? params : [params];

    // Tìm point theo seriesName
    const line = p.find((x) => x.seriesName === "Price");
    const bar = p.find((x) => x.seriesName === "Volume");

    const tMs = line ? line.value[0] : bar?.value?.[0];
    if (!tMs) return "";

    const idx = (() => {
      if (!data) return undefined;
      // khớp index gần nhất theo t
      const tms = data.t.map(toMs);
      const pos = tms.findIndex((x) => x === tMs);
      return pos >= 0 ? pos : undefined;
    })();

    const timeStr = fmtHHmm(tMs);
    const price = line ? line.value[1] : idx !== undefined ? data!.c[idx] : undefined;
    const vol = bar ? bar.value[1] : idx !== undefined ? data!.v[idx] : undefined;
    const vo = idx !== undefined && data?.vo ? data.vo[idx] : undefined;
    const va = idx !== undefined && data?.va ? data.va[idx] : undefined;

    return [
      `<div style="min-width:160px">`,
      `<div><b>${timeStr}</b></div>`,
      price !== undefined ? `<div>Price: <b>${price}</b></div>` : "",
      vol !== undefined ? `<div>Volume: <b>${vol.toLocaleString()}</b></div>` : "",
      vo !== undefined ? `<div>Vol (cum): <b>${vo.toLocaleString()}</b></div>` : "",
      va !== undefined ? `<div>Value (cum): <b>${va.toLocaleString()}</b></div>` : "",
      `</div>`,
    ].join("");
  };
}

const IntradayChart: React.FC<Props> = ({
  symbol,
  data,
  showMiddayBreakShade = true,
  height = 420,
}) => {
  const [payload, setPayload] = useState<MinuteChartResponse | undefined>(data);
  const ecRef = useRef<ReactECharts>(null);

  useEffect(() => {
    let mounted = true;
    if (data) {
      setPayload(data);
      return;
    }
    // Fetch trực tiếp; nếu bị CORS ở môi trường dev, cần proxy qua server của mình.
    const url = `https://sboard.shs.com.vn/api/v1/market/minuteChart?symbol=${encodeURIComponent(
      symbol
    )}`;
    (async () => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!mounted) return;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as MinuteChartResponse;
        setPayload(json);
      } catch (e) {
        console.error("Fetch minuteChart failed:", e);
        // Không crash UI; giữ empty
      }
    })();

    return () => {
      mounted = false;
    };
  }, [symbol, data]);

  const option = useMemo(() => {
    if (!payload || !payload.t || payload.t.length === 0) {
      return {
        backgroundColor: "transparent",
        title: { text: `Intraday ${symbol}`, left: 12, top: 6, textStyle: { fontSize: 12 } },
        grid: [{ left: 56, right: 18, top: 36, height: "60%" }, { left: 56, right: 18, top: "72%", height: "22%" }],
        xAxis: [{ type: "time" }, { type: "time", gridIndex: 1 }],
        yAxis: [{ type: "value", scale: true }, { type: "value", gridIndex: 1 }],
        series: [],
      } as echarts.EChartsOption;
    }

    const { price, volume } = mapSeries(payload);
    const firstTs = toMs(payload.t[0]);
    const { morningStart, morningEnd, afternoonStart, atcEnd } = sessionAnchors(firstTs);

    const markLines = [
      { xAxis: morningStart, name: "Open 09:00" },
      { xAxis: morningEnd, name: "11:30" },
      { xAxis: afternoonStart, name: "13:00" },
      { xAxis: atcEnd, name: "ATC 14:45" },
    ];

    const breakArea =
      showMiddayBreakShade
        ? [
            {
              xAxis: morningEnd,
              xAxis2: afternoonStart,
            },
          ]
        : [];

    const opt: echarts.EChartsOption = {
      backgroundColor: "transparent",
      animation: false,
      title: {
        text: `${payload.symbol ?? symbol} — Intraday`,
        left: 12,
        top: 6,
        textStyle: { fontSize: 12, fontWeight: 500 },
      },
      grid: [
        { left: 56, right: 18, top: 36, height: "60" + "%" },
        { left: 56, right: 18, top: "72%", height: "22%" },
      ],
      axisPointer: {
        // đường dóng thẳng đồng bộ giữa 2 pane
        link: [{ xAxisIndex: [0, 1] }],
        label: { backgroundColor: "#6a7985" },
        snap: true,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
        confine: true,
        backgroundColor: "rgba(0,0,0,0.8)",
        borderWidth: 0,
        textStyle: { color: "#fff" },
        formatter: buildTooltip(payload),
      },
      dataZoom: [
        { type: "inside", xAxisIndex: [0, 1] },
        { type: "slider", xAxisIndex: [0, 1], height: 18, top: "96%" },
      ],
    xAxis: [
    {
        type: "time",
        boundaryGap: [0, 0], // ✅ time axis yêu cầu tuple
        axisLabel: { formatter: (val: number) => fmtHHmm(val) },
        axisPointer: { show: true },
    },
    {
        type: "time",
        gridIndex: 1,
        boundaryGap: [0, 0], // ✅
        axisLabel: { formatter: (val: number) => fmtHHmm(val) },
    },
    ],

      yAxis: [
        {
          type: "value",
          scale: true,
          position: "right",
          splitLine: { show: true, lineStyle: { type: "dashed", opacity: 0.3 } },
          axisLabel: { formatter: (v: number) => v.toString() },
        },
        {
          type: "value",
          gridIndex: 1,
          position: "right",
          splitNumber: 2,
          axisLabel: {
            formatter: (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`),
          },
          splitLine: { show: true, lineStyle: { type: "dashed", opacity: 0.3 } },
        },
      ],
      series: [
        {
          name: "Price",
          type: "line",
          data: price,
          showSymbol: false,
          smooth: true,
          lineStyle: { width: 1.6 },
          markLine: {
            symbol: "none",
            label: { show: true, formatter: (p: any) => p.name ?? "" },
            lineStyle: { type: "dashed", opacity: 0.6 },
            data: markLines,
          },
          markArea: showMiddayBreakShade
            ? {
                silent: true,
                itemStyle: { color: "rgba(128,128,128,0.08)" },
                data: breakArea,
              }
            : undefined,
          tooltip: { valueFormatter: (val: any) => `${val}` },
        },
        {
          name: "Volume",
          type: "bar",
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: volume,
          barWidth: "60%",
          tooltip: {
            valueFormatter: (val: any) => val?.toLocaleString?.() ?? `${val}`,
          },
        },
      ],
    };

    return opt;
  }, [payload, symbol, showMiddayBreakShade]);

  return (
    <div style={{ width: "100%", height }}>
      <ReactECharts
        ref={ecRef}
        option={option}
        notMerge={true}
        lazyUpdate={true}
        style={{ width: "100%", height: "100%" }}
        opts={{ renderer: "canvas", locale: "en", devicePixelRatio: window.devicePixelRatio || 1 }}
      />
    </div>
  );
};

export default IntradayChart;
