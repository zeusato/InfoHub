import { useEffect, useState } from "react";

/**
 * Overlay nhắc người dùng xoay ngang điện thoại.
 * Hiện khi: width <= 900px && orientation: portrait
 */
export default function RotateOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mqlPortrait = window.matchMedia("(orientation: portrait)");
    const mqlNarrow = window.matchMedia("(max-width: 900px)");

    const check = () => setShow(mqlPortrait.matches && mqlNarrow.matches);
    check();

    // Safari cũ dùng addListener/removeListener
    const add = (mql: MediaQueryList, h: () => void) =>
      (mql as any).addEventListener
        ? mql.addEventListener("change", h)
        : (mql as any).addListener(h);
    const remove = (mql: MediaQueryList, h: () => void) =>
      (mql as any).removeEventListener
        ? mql.removeEventListener("change", h)
        : (mql as any).removeListener(h);

    add(mqlPortrait, check);
    add(mqlNarrow, check);
    window.addEventListener("resize", check);

    return () => {
      remove(mqlPortrait, check);
      remove(mqlNarrow, check);
      window.removeEventListener("resize", check);
    };
  }, []);

  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes rotatePhone {
          0%,25%   { transform: rotate(0deg); }
          55%,80%  { transform: rotate(90deg); }
          100%     { transform: rotate(90deg); }
        }
        @keyframes nudge {
          0%,100% { transform: translateX(0); }
          50%     { transform: translateX(8px); }
        }
        @keyframes pulseDot {
          0%,100% { opacity: .35; transform: scale(1); }
          50%     { opacity: 1; transform: scale(1.2); }
        }
      `}</style>

      <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-8">
        <div className="text-center max-w-sm w-full">
          {/* Phone demo */}
          <div className="relative mx-auto mb-6">
            {/* phone body */}
            <div
              className="w-24 h-40 md:w-28 md:h-44 rounded-2xl border-2 border-white/40 bg-white/5 mx-auto shadow-[0_8px_30px_rgba(0,0,0,.5)]"
              style={{ animation: "rotatePhone 2.4s ease-in-out infinite" }}
            >
              <div className="w-10 h-1.5 bg-white/30 rounded-full mx-auto mt-2" />
              <div className="absolute inset-3 rounded-xl bg-white/5 border border-white/10" />
            </div>

            {/* arrow hint */}
            <svg
              className="absolute right-[-28px] top-1/2 -translate-y-1/2 w-7 h-7 opacity-90"
              viewBox="0 0 24 24"
              fill="none"
              style={{ animation: "nudge 1.2s ease-in-out infinite" }}
            >
              <path d="M4 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" className="text-white/80"/>
            </svg>

            {/* pulse dots */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-white/60" style={{ animation: "pulseDot 1.6s ease-in-out infinite" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-white/60" style={{ animation: "pulseDot 1.6s ease-in-out .2s infinite" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-white/60" style={{ animation: "pulseDot 1.6s ease-in-out .4s infinite" }} />
            </div>
          </div>

          <div className="text-xl font-semibold">Xoay ngang thiết bị</div>
          <div className="mt-1 text-white/80 text-sm">
            Để xem Workspace đẹp & đầy đủ hơn, vui lòng quay ngang điện thoại.
          </div>

          {/* optional: vẫn muốn xem dọc */}
          {/* <button
            onClick={() => setShow(false)}
            className="mt-5 px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/5 transition"
          >
            Vẫn xem dọc
          </button> */}
        </div>
      </div>
    </>
  );
}
