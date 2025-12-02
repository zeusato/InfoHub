// src/components/AlertModal.tsx
import { createPortal } from "react-dom";

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
}

export default function AlertModal({ isOpen, onClose, title = "Thông báo", message }: AlertModalProps) {
    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

            {/* Alert content */}
            <div
                className="relative bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-md border border-orange-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>

                {/* Title & Message */}
                <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                    <p className="text-sm text-zinc-200">{message}</p>
                </div>

                {/* OK Button */}
                <button
                    onClick={onClose}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:from-orange-700 hover:to-orange-600 transition"
                >
                    OK
                </button>
            </div>
        </div>,
        document.body
    );
}