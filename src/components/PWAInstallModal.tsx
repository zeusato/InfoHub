// src/components/PWAInstallModal.tsx
import { X, Download, Share, MoreVertical } from 'lucide-react'

type Props = {
    isOpen: boolean
    onClose: () => void
}

export default function PWAInstallModal({ isOpen, onClose }: Props) {
    if (!isOpen) return null

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#1a1b1e] border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center">
                        <Download className="text-brand" size={22} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Cài đặt ứng dụng</h2>
                </div>

                {/* Description */}
                <p className="text-zinc-400 text-sm mb-4">
                    Để cài đặt ứng dụng InfoHub, hãy làm theo hướng dẫn sau:
                </p>

                {/* Instructions box */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                    <p className="font-semibold text-white mb-3 flex items-center gap-2">
                        {isIOS ? (
                            <>
                                <Share size={16} className="text-brand" />
                                Trên Safari (iOS)
                            </>
                        ) : (
                            <>
                                <MoreVertical size={16} className="text-brand" />
                                Trên trình duyệt (Chrome/Edge)
                            </>
                        )}
                    </p>

                    <ol className="space-y-2 text-sm text-zinc-300">
                        {isIOS ? (
                            <>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand font-bold">1.</span>
                                    <span>Nhấn vào nút <strong className="text-white">Chia sẻ</strong> <Share size={14} className="inline text-brand" /> ở thanh công cụ</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand font-bold">2.</span>
                                    <span>Chọn <strong className="text-white">"Thêm vào Màn hình chính"</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand font-bold">3.</span>
                                    <span>Nhấn <strong className="text-white">"Thêm"</strong> để hoàn tất</span>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand font-bold">1.</span>
                                    <span>Nhấn vào nút <strong className="text-white">Menu</strong> <MoreVertical size={14} className="inline text-brand" /> (⋮) góc phải trên</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand font-bold">2.</span>
                                    <span>Chọn <strong className="text-white">"Cài đặt ứng dụng"</strong> hoặc <strong className="text-white">"Install App"</strong></span>
                                </li>
                            </>
                        )}
                    </ol>
                </div>

                {/* Note */}
                <p className="text-xs text-zinc-500 mb-5 italic">
                    Sau khi cài đặt, bạn có thể truy cập InfoHub ngay từ màn hình chính!
                </p>

                {/* Confirm button */}
                <button
                    onClick={onClose}
                    className="w-full py-3 bg-brand hover:bg-brand/90 text-white font-semibold rounded-xl transition"
                >
                    Đã hiểu
                </button>
            </div>

            {/* Animation styles */}
            <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in {
          from { transform: scale(0.95); }
          to { transform: scale(1); }
        }
        .animate-in {
          animation: fade-in 0.2s ease-out, zoom-in 0.2s ease-out;
        }
      `}</style>
        </div>
    )
}
