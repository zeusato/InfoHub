// src/components/BannerCarousel.tsx
import { useEffect, useMemo, useState } from "react";
import slidesJson from "@/data/slides.json";
import { DynamicNavigation } from "@/components/lightswind/dynamic-navigation";
import { Home, CandlestickChart, BarChart, LayoutGrid} from "lucide-react";

type Slide = {
  id: string;
  title: string;
  desc: string;
  img: string;
  link: string;
};

const links = [
  { id: 'home', label: 'Homepage', href: 'https://www.shs.com.vn/', icon: <Home /> },
  { id: 'ChartCandlestick', label: 'Sboard', href: 'https://sboard.shs.com.vn/', icon: <CandlestickChart /> },
  { id: 'Trading', label: 'Trading_System', href: 'https://qr.me-qr.com/KIuncOL4', icon: <BarChart /> },
  { id: 'Utilities', label: 'Utilities', href: 'https://zeusato.github.io/Z-Utilities/', icon: <LayoutGrid /> }
];

export default function BannerCarousel() {
  const [idx, setIdx] = useState(0);

  const slides: (Slide & { imgUrl: string })[] = useMemo(() => {
    return (slidesJson as Slide[]).map((s) => ({
      ...s,
      imgUrl: new URL(`../assets/${s.img}`, import.meta.url).href,
    }));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIdx((v) => (v + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const cur = slides[idx];
  const isExternal = cur.link.startsWith("http");

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={
        {
          // ---- T U N E Ở ĐÂY ----
          // chiều cao banner, kích thước notch + dock, khoảng hở
          // (để giống hình: dock nhỏ hơn cutout 8px, tạo khe đều)
          "--banner-h": "200px",
          "--cut-w": "50%",   // chiều rộng phần bị khoét
          "--cut-h": "60px",  // chiều cao phần bị khoét
          "--gap": "8px",     // khe hở giữa cutout và dock
          "--dock-h": "48px", // chiều cao dock
        } as React.CSSProperties
      }
    >
      {/* Ảnh nền */}
      <img
        src={cur.imgUrl}
        alt={cur.title}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-auto h-auto max-h-full max-w-none z-0"
        style={{
          height: "var(--banner-h)",
          WebkitMaskImage:
            "linear-gradient(to left, black 60%, transparent 92%)",
          maskImage: "linear-gradient(to left, black 50%, transparent 92%)",
        }}
      />

      {/* Panel chữ bên trái */}
      <div
        className="absolute inset-y-0 left-0 w-[60%] min-w-[280px]"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,.4) 45%, rgba(0,0,0,.3) 70%, rgba(0,0,0,0) 100%)",
          height: "var(--banner-h)",
        }}
      />
      <a
        href={cur.link}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="absolute inset-y-0 left-0 w-[46%] min-w-[280px] p-5 flex flex-col justify-center text-left focus:outline-none"
        style={{ height: "var(--banner-h)" }}
      >
        <div className="flex flex-col h-full">
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#4ade80]">
            {cur.title}
          </h3>
          <p className="text-[#4ade80] mt-1">{cur.desc}</p>
          <div className="mt-auto"> 
            {/* chỗ để nút hoặc nội dung muốn đẩy xuống cuối */}
          </div>
        </div>
      </a>

      {/* Dots */}
      <div className="absolute bottom-3 right-5 flex gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIdx(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === idx ? "w-6 bg-brand" : "w-2.5 bg-white/40"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ======= EFFECT “KHOÉT GÓC” + DOCK ======= */}

      {/* 1) CUT-OUT: khối cùng màu nền trang để “cắt” banner, bo tròn mép còn lại */}
      <div
        aria-hidden
        className="absolute z-10 rounded-2xl pointer-events-none"
        style={{
          left: "0px",
          bottom: "0px",
          width: "var(--cut-w)",
          height: "var(--cut-h)",
          background: "var(--tw-prose-bg, #111214)", // đổi cho khớp theme nền
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.06), 0 2px 12px rgba(0,0,0,0.35)",
        }}
      />

      {/* 2) DOCK: thanh menu thật, bo tròn 4 góc, nổi tách rời */}
      <div
        className="absolute z-20 rounded-2xl flex items-center gap-5 bg-white/8 backdrop-blur shadow-[0_16px_36px_-18px_rgba(0,0,0,0.8)]"
        style={{
          left: `calc(0px + var(--gap))`,
          bottom: `calc(0px + var(--gap))`,
          width: `calc(var(--cut-w) - var(--gap)*2)`,
          height: "var(--dock-h)",
        }}
      >
        {/* ví dụ 1 nút */}
      <DynamicNavigation 
        links={links}      
        glowIntensity={5}
        onLinkClick={(id) => console.log("Clicked:", id)}
        />
        {/* thêm các nút khác ở đây */}
      </div>

      {/* Container height */}
      <div style={{ height: "var(--banner-h)" }} />
    </div>
  );
}
