// src/components/BannerCarousel.tsx
import { useEffect, useMemo, useState } from "react";
import slidesJson from "@/data/slides.json";
// DynamicNavigation is no longer used because the banner menu is now collapsible.
// import { DynamicNavigation } from "@/components/lightswind/dynamic-navigation";
import { Home, CandlestickChart, BarChart, LayoutGrid, Menu as MenuIcon, ChevronRight, Download } from "lucide-react";
import { useBannerSlides } from "@/hooks/useBannerSlides";
import { getStorageUrl } from "@/lib/supabase";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import PWAInstallModal from "./PWAInstallModal";

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
  { id: 'Trading', label: 'Trading_System', href: 'https://q.me-qr.com/l/SHSmart', icon: <BarChart /> },
  { id: 'Utilities', label: 'Utilities', href: 'https://zeusato.github.io/Z-Utilities/', icon: <LayoutGrid /> }
];

export default function BannerCarousel() {
  const [idx, setIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // PWA Install hook
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  // Fetch slides from Supabase
  const { slides: supabaseSlides, loading } = useBannerSlides();

  // Fallback to local slides if Supabase is empty or loading
  const localSlides: (Slide & { imgUrl: string })[] = useMemo(() => {
    return (slidesJson as Slide[]).map((s) => ({
      ...s,
      imgUrl: new URL(`../assets/${s.img}`, import.meta.url).href,
    }));
  }, []);

  // Map Supabase slides to expected format
  const slides = useMemo(() => {
    if (loading || supabaseSlides.length === 0) {
      return localSlides;
    }
    return supabaseSlides.map(s => ({
      id: s.id,
      title: s.title,
      desc: s.title, // Use title as description
      img: s.image_url,
      imgUrl: getStorageUrl(s.image_url),
      link: s.link_url || '#'
    }));
  }, [supabaseSlides, loading, localSlides]);

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
          <div className="mt-auto">
            {/* chỗ để nút hoặc nội dung muốn đẩy xuống cuối */}
          </div>
        </div>
      </a>

      {/* Dots */}
      <div className="absolute bottom-3 right-5 flex items-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIdx(i)}
            className={`rounded-full transition-all flex-shrink-0 ${i === idx ? "bg-brand" : "bg-white/40"
              }`}
            style={{
              width: i === idx ? '24px' : '10px',
              height: '10px',
              minWidth: i === idx ? '24px' : '10px',
              minHeight: '10px'
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ======= COLLAPSIBLE NAVIGATION ======= */}

      {/* Collapsible navigation: show a single menu button with a chevron by default.
          When the user hovers over the menu area or clicks on the button,
          the navigation items expand horizontally.  The container grows to fit
          its contents rather than using a fixed width so it adapts to varying
          viewport sizes and number of links. */}
      <div
        className="absolute z-20 flex items-center bg-black/10 backdrop-blur shadow-[0_16px_36px_-18px_rgba(0,0,0,0.8)] rounded-2xl transition-all"
        style={{
          left: `calc(0px + var(--gap))`,
          bottom: `calc(0px + var(--gap))`,
          height: "var(--dock-h)",
          // The container width is driven by its contents.  No fixed width is set.
        }}
        // Expand the menu on hover.  Collapse it when the pointer leaves.
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
      >
        {/* Menu toggle button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen((v) => !v);
          }}
          /*
           * The menu toggle now consists of a hamburger icon and three right-pointing
           * chevron icons.  Each chevron has a slight animation delay so they
           * sequentially brighten, inviting the user to open the menu.  The icons
           * are scaled up (~1.5×) compared to their default size to improve
           * visibility.  The wrapper uses gap and padding for spacing.
           */
          className="flex items-center gap-1 h-full px-4 py-1.5 focus:outline-none hover:text-brand transition-colors"
          type="button"
        >
          <MenuIcon size={24} />
          <div className="flex items-center">
            {[0, 1, 2].map((i) => (
              <ChevronRight
                key={i}
                size={24}
                className={`arrow-step-${i}`}
              />
            ))}
          </div>
        </button>
        {/* Navigation items container.  When collapsed it has zero width and is fully transparent.
            When expanded it gains margin and opacity so items appear smoothly. */}
        <ul
          className={`flex items-center overflow-hidden transition-all duration-300 ${menuOpen
            ? "ml-3 opacity-100 max-w-none"
            : "ml-0 opacity-0 max-w-0"
            }`}
        >
          {links.map((link) => (
            <li key={link.id} className="px-2">
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs md:text-sm text-current hover:text-brand transition-colors"
              >
                {link.icon && (
                  <span className="text-current text-xs">{link.icon}</span>
                )}
                <span className="hidden sm:inline">{link.label}</span>
              </a>
            </li>
          ))}

          {/* PWA Install Button - ALWAYS VISIBLE */}
          <li className="px-2">
            <button
              onClick={async () => {
                // Try native install prompt first
                const result = await promptInstall();

                // If native prompt not available, show instruction modal
                if (result === 'unavailable') {
                  setShowInstallModal(true);
                }
                // If user dismissed, do nothing (they can try again)
                // If accepted, app will install
              }}
              className="flex items-center gap-1 text-xs md:text-sm text-brand hover:text-brand/80 transition-colors font-medium"
              title="Tải App về thiết bị"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Tải App</span>
            </button>
          </li>
        </ul>
      </div>

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      {/* Container height */}
      <div style={{ height: "var(--banner-h)" }} />

      {/* Animated arrow CSS.  We embed our keyframes and classes here so
          the three ChevronRight icons in the menu button pulse sequentially.
          Each arrow has a delayed animation to create a flowing CTA effect. */}
      <style>
        {`
        @keyframes arrowPulse {
          0%, 20% { opacity: 0.3; }
          40% { opacity: 1; }
          60%, 100% { opacity: 0.3; }
        }
        .arrow-step-0 {
          animation: arrowPulse 1.5s infinite;
        }
        .arrow-step-1 {
          animation: arrowPulse 1.5s infinite;
          animation-delay: 0.3s;
        }
        .arrow-step-2 {
          animation: arrowPulse 1.5s infinite;
          animation-delay: 0.6s;
        }
        `}
      </style>
    </div>
  );
}
