// src/components/news/RssSourcesPanel.tsx
import React from "react";
import { RSS_SOURCES } from "./RssFetcher";
import { cn } from "@/components/lib/utils";
import { ChevronRight } from "lucide-react";

type IconsMap = Partial<Record<keyof typeof RSS_SOURCES, string | React.ReactNode>>;

type Props = {
  onSelect: (source: keyof typeof RSS_SOURCES) => void;
  className?: string;
  icons?: IconsMap; // source -> img src | ReactNode
};

const ACCENT: Record<keyof typeof RSS_SOURCES, { from: string; to: string }> = {
  cafebiz:   { from: "#f43f5e", to: "#f59e0b" }, // rose → amber
  vietstock: { from: "#06b6d4", to: "#3b82f6" }, // cyan → blue
};

export default function RssSourcesPanel({ onSelect, className, icons }: Props) {
  return (
    <div className={cn("w-full h-full p-4", className)}>
      <div className="text-sm font-bold uppercase tracking-wider text-white mb-2">Đọc báo</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[calc(100%-1.5rem)]">
        {(Object.entries(RSS_SOURCES) as [keyof typeof RSS_SOURCES, (typeof RSS_SOURCES)[keyof typeof RSS_SOURCES]][])
          .map(([key, cfg]) => {
            const iconDef = icons?.[key];
            const IconNode =
              typeof iconDef === "string"
                ? <img src={iconDef} alt={cfg.label} className="w-12 h-12 object-contain" />
                : iconDef || null;

            const { from, to } = ACCENT[key];

            return (
              <button
                key={key}
                onClick={() => onSelect(key)}
                className={cn(
                  "group relative w-full h-full rounded-2xl overflow-hidden text-left",
                  "transition-transform duration-300 hover:-translate-y-[2px] focus:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-white/30"
                )}
                title={`Mở danh sách ${cfg.label}`}
                // tránh flicker: KHÔNG dùng mask composite
              >
                {/* Overlay gradient BORDER (không mask, show nhờ margin 1px của content) */}
                <div
                  aria-hidden
                  className="absolute inset-0 z-0 opacity-0 group-hover:opacity-60 transition-opacity"
                  style={{
                    background: `conic-gradient(from 0deg at 50% 50%, ${from}, ${to}, ${from})`,
                  }}
                />

                {/* Content card (đẩy cách viền 1px để lộ gradient) */}
                <div className="relative z-10 m-[1px] rounded-[1rem] border border-white/10 bg-white/[0.035] backdrop-blur-sm h-full">
                  {/* blob ánh sáng bên phải (không che viền vì ở dưới content) */}
                  <div
                    aria-hidden
                    className="absolute -right-10 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{ background: `radial-gradient(closest-side, ${to}, transparent 70%)` }}
                  />

                  <div className="relative flex items-center justify-between gap-4 p-4 h-full">
                    <div className="min-w-0 pr-2">
                      {/* <div className="text-[10px] uppercase tracking-wider text-white/55 mb-1">
                        {cfg.label}
                      </div> */}
                      <ChevronRight
                          className="block md:hidden size-4 translate-x-0 group-hover:translate-x-[2px] transition-transform"
                          aria-hidden="true"
                        />
                      <div className="hidden md:block text-[1.075rem] sm:hidden font-semibold truncate">
                        {cfg.label} News
                      </div>
                      <div className="hidden lg:block text-xs text-white/60 mt-1 sm:hidden">
                        Bấm để xem danh sách mới nhất
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="grid place-items-center w-14 h-14 rounded-xl bg-white/90 text-black shadow-sm">
                        {IconNode ?? <div className="text-base font-bold">{cfg.label?.[0] || "N"}</div>}
                      </div>

                      <div className="sm:hidden grid place-items-center w-8 h-8 rounded-full border border-white/15 hover:border-white/15 bg-white/[0.06]">
                        <ChevronRight
                          className="size-4 translate-x-0 group-hover:translate-x-[2px] transition-transform"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
