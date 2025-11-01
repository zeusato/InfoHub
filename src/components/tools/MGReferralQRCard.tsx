// src/components/tools/MGReferralQRCard.tsx
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
// chỉnh import này theo project của đại ca nếu khác đường dẫn
import GlowingCard from "@/components/lightswind/glowing-cards";

const BASE_URL = "https://shsmart.onelink.me/Odsh/3wr4issy?remNo=";

export default function MGReferralQRCard() {
  const [input, setInput] = useState("");
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // tính kích thước QR theo ô hiển thị
  const boxRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const [qrSize, setQrSize] = useState(240);
  const [qrBgWhite, setQrBgWhite] = useState(false);

  useEffect(() => {
    const handle = () => {
      if (!boxRef.current) return;
      const rect = boxRef.current.getBoundingClientRect();
      const s = Math.max(120, Math.floor(Math.min(rect.width, rect.height)) - 24);
      setQrSize(s);
    };
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const submit = () => {
    const code = input.trim();
    if (!code) return;
    setQrValue(`${BASE_URL}${encodeURIComponent(code)}`);
    setQrBgWhite(true); // bật nền trắng cho khung QR
  };

  const handleDownload = async () => {
    if (!qrRef.current) return;
    try {
      const canvas = await html2canvas(qrRef.current);
      const link = document.createElement('a');
      link.download = 'qr-code.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  return (
    <div className="p-3 w-full">
      <div className="grid grid-cols-2 grid-cols-[2fr_1fr] items-center">
        {/* Bên trái: label + input + button */}
        <div className="flex flex-col gap-3 justify-left ml-3 item-center">
          <label className="text-sm font-medium opacity mr-auto">
            Nhập mã MG để tạo QR giới thiệu mở tài khoản:
          </label>

          <div className="flex items-center gap-3">
            <input
              type="text"
              maxLength={10}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && input.trim() && submit()}
              placeholder="VD: MG123456"
              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none
                         focus:ring-2 focus:ring-cyan-500/50 w-20"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!input.trim()}
              className="rounded-xl px-4 py-2 font-semibold bg-cyan-500 text-black
                         hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tạo QR
            </button>
          </div>

          {/* hiện link đã ghép (optional) */}
          {qrValue && (
            <div className="text-xs opacity-60 break-all mr-auto text-left">{qrValue}</div>            
          )}
          <div className="text-xs break-all mr-auto text-left w-full text-orange-400">
            Lưu ý: Không dùng Zalo để quét mã QR, vì Zalo chặn link rút gọn
          </div>
        </div>

        {/* Bên phải: khung QR vuông */}
        <div
          ref={boxRef}
          className={`w-40 ml-auto aspect-square rounded-2xl border border-white/10 flex items-center justify-center
                      ${qrBgWhite ? "bg-white" : "bg-transparent"}`}
        >
          {qrValue ? (
            <div
              ref={qrRef}
              className="relative cursor-pointer"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={handleDownload}
            >
              <QRCode value={qrValue} size={qrSize} />
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap">
                  click to download
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm opacity-50">Chưa có QR</div>
          )}
        </div>
      </div>
    </div>
  );
}
