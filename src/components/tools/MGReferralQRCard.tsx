// src/components/tools/MGReferralQRCard.tsx
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import QRModal from "@/components/QRModal";

const BASE_URL = "https://shsmart.onelink.me/Odsh?remNo=";

export default function MGReferralQRCard() {
  const [input, setInput] = useState("");
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // tính kích thước QR theo ô hiển thị
  const boxRef = useRef<HTMLDivElement>(null);
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
    if (!qrValue) return;

    try {
      // Import qrcode library dynamically
      const QRCodeLib = (await import('qrcode')).default;

      // Create a temporary canvas
      const canvas = document.createElement('canvas');

      // Generate QR code directly to canvas
      await QRCodeLib.toCanvas(canvas, qrValue, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Convert canvas to Blob
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Không thể tạo file QR. Vui lòng thử lại!');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'qr-mg-ekyc.png';
        link.href = url;
        link.click();

        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Không thể tải QR. Vui lòng chụp màn hình nếu cần lưu lại!');
    }
  };

  return (
    <div className="p-3 w-full">
      <div className="flex flex-col sm:grid sm:grid-cols-[2fr_1fr] items-center gap-4">
        {/* Bên trái: label + input + button */}
        <div className="flex flex-col gap-3 w-full">
          <label className="text-sm font-medium text-[var(--text-primary)]">
            Nhập mã MG để tạo QR giới thiệu mở tài khoản:
          </label>

          <div className="flex items-center gap-2 sm:gap-3 w-full">
            <input
              type="text"
              maxLength={10}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && input.trim() && submit()}
              placeholder="VD: MG123456"
              className="flex-1 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-color)] px-3 py-2 text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none
                         focus:ring-2 focus:ring-cyan-500/50"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!input.trim()}
              className="rounded-xl px-3 sm:px-4 py-2 font-semibold bg-cyan-500 text-black text-sm sm:text-base
                         hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Tạo QR
            </button>
          </div>

          {/* Mobile: View QR button */}
          {qrValue && (
            <button
              onClick={() => setShowModal(true)}
              className="sm:hidden w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-400 text-white font-semibold rounded-lg shadow-md hover:from-cyan-700 hover:to-cyan-500 transition"
            >
              👁️ Xem QR
            </button>
          )}

          {/* hiện link đã ghép (optional) */}
          {qrValue && (
            <div className="text-xs text-[var(--text-muted)] break-all hidden sm:block">{qrValue}</div>
          )}
          <div className="text-xs break-all text-orange-400">
            Lưu ý: Không dùng Zalo để quét mã QR, vì Zalo chặn link rút gọn
          </div>
        </div>

        {/* Bên phải: khung QR vuông - hidden on mobile */}
        <div
          ref={boxRef}
          className={`hidden sm:flex w-40 ml-auto aspect-square rounded-2xl border border-[var(--border-color)] items-center justify-center
                      ${qrBgWhite ? "bg-white" : "bg-transparent"}`}
        >
          {qrValue ? (
            <div
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
            <div className="text-sm text-[var(--text-muted)]">Chưa có QR</div>
          )}
        </div>
      </div>

      {/* Modal for mobile */}
      <QRModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onDownload={handleDownload}
      >
        {qrValue && <QRCode value={qrValue} size={240} />}
      </QRModal>
    </div>
  );
}
