// src/components/QRModal.tsx
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface QRModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    onDownload?: () => void;
}

export default function QRModal({ isOpen, onClose, children, onDownload }: QRModalProps) {
    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
            return () => document.removeEventListener("keydown", handleEsc);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Render modal at body level using Portal
    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

            {/* Modal content */}
            <div
                className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-white/60 hover:text-white transition"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* QR Display */}
                <div className="flex flex-col items-center gap-4">
                    <h3 className="text-lg font-semibold">Mã QR của bạn</h3>
                    <div className="bg-white p-4 rounded-xl">
                        {children}
                    </div>
                    {onDownload && (
                        <button
                            onClick={onDownload}
                            className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-400 text-white font-semibold rounded-lg shadow-md hover:from-orange-700 hover:to-orange-500 transition"
                        >
                            📥 Tải QR về máy
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
