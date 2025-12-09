// src/components/tools/MarginCalculator.tsx
import { useState, useMemo, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";

// Format số với dấu phân cách
const formatNumber = (val: string | number): string => {
    const num = typeof val === 'string' ? val.replace(/[^0-9]/g, '') : String(val);
    if (!num) return '';
    return Number(num).toLocaleString('vi-VN');
};

// Parse số từ string đã format
const parseNumber = (val: string): number => {
    return Number(val.replace(/[^0-9]/g, '')) || 0;
};

type InputProps = {
    label: string;
    value: string;
    onChange: (v: string) => void;
    suffix?: string;
    isPercent?: boolean;
};

function NumberInput({ label, value, onChange, suffix, isPercent = false }: InputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if (isPercent) {
            const num = Math.min(100, Math.max(0, Number(val) || 0));
            onChange(String(num));
        } else {
            onChange(val ? formatNumber(val) : '');
        }
    };

    return (
        <div className="grid grid-cols-[1fr_120px_16px] items-center gap-1">
            <label className="text-xs text-[var(--text-secondary)] whitespace-nowrap">{label}</label>
            <div>
                <input
                    type="text"
                    inputMode="numeric"
                    value={value}
                    onChange={handleChange}
                    className="w-full px-2 py-1 text-right text-sm text-[var(--text-primary)] bg-[var(--bg-glass)] border border-[var(--border-color)] rounded focus:border-orange-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
            </div>
            <div className="text-xs text-[var(--text-secondary)] text-left">
                {suffix || ''}
            </div>
        </div>
    );
}

function ResultLabel({ label, value, unit = "", highlight = false }: { label: string; value: string | number; unit?: string; highlight?: boolean }) {
    return (
        <div className={`flex items-center justify-between py-1 px-2 rounded ${highlight ? 'bg-orange-500/10' : ''}`}>
            <span className="text-xs text-[var(--text-secondary)]">{label}</span>
            <span className={`text-sm font-medium ${highlight ? 'text-orange-500' : 'text-[var(--text-primary)]'}`}>
                {typeof value === 'number' ? formatNumber(value) : value}{unit}
            </span>
        </div>
    );
}

export default function MarginCalculator() {
    const STORAGE_KEY = 'margin_calculator_data';

    const [tts, setTts] = useState('');
    const [tn, setTn] = useState('');
    const [tien, setTien] = useState('');
    const [tienChoVe, setTienChoVe] = useState('');
    const [tyLeVay, setTyLeVay] = useState('50');
    const [toRate, setToRate] = useState('50');
    const [gtMua, setGtMua] = useState('');

    // Load từ localStorage khi mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                if (data.tts) setTts(data.tts);
                if (data.tn) setTn(data.tn);
                if (data.tien) setTien(data.tien);
                if (data.tienChoVe) setTienChoVe(data.tienChoVe);
                if (data.tyLeVay) setTyLeVay(data.tyLeVay);
                if (data.toRate) setToRate(data.toRate);
                if (data.gtMua) setGtMua(data.gtMua);
            }
        } catch (e) {
            console.error('Error loading margin data:', e);
        }
    }, []);

    // Lưu vào localStorage khi thay đổi
    useEffect(() => {
        const data = { tts, tn, tien, tienChoVe, tyLeVay, toRate, gtMua };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [tts, tn, tien, tienChoVe, tyLeVay, toRate, gtMua]);

    const calculated = useMemo(() => {
        const ttsNum = parseNumber(tts);
        const tnNum = parseNumber(tn);
        const tienNum = parseNumber(tien);
        const tienChoVeNum = parseNumber(tienChoVe);
        const tyLeVayNum = Number(tyLeVay) || 0;
        const toRateNum = Number(toRate) || 0;
        const gtMuaNum = parseNumber(gtMua);

        const tienUngDuoc = tienChoVeNum * 0.99;
        const nav = ttsNum - tnNum;
        const cmr = ttsNum > 0 ? (nav / ttsNum) * 100 : 0;
        const toRateDecimal = toRateNum / 100;
        const tyLeVayDecimal = tyLeVayNum / 100;

        const phaiBan = toRateDecimal > 0
            ? Math.max(0, (ttsNum - tienNum - tienUngDuoc) - nav / toRateDecimal)
            : 0;
        const phaiNop = (ttsNum - tienNum - tienUngDuoc) * toRateDecimal - nav;

        const nopToiThieu = Math.max(0, gtMuaNum - tienNum - tienUngDuoc);
        const nopPhatVay = Math.max(0, (ttsNum - tienNum - tienUngDuoc) + gtMuaNum * (1 - tyLeVayDecimal) - nav);

        return {
            nav,
            cmr: cmr.toFixed(2),
            phaiBan: Math.round(phaiBan),
            phaiNop: Math.round(phaiNop),
            nopToiThieu: Math.round(nopToiThieu),
            nopPhatVay: Math.round(nopPhatVay),
        };
    }, [tts, tn, tien, tienChoVe, tyLeVay, toRate, gtMua]);

    return (
        <div className="p-2 h-full flex flex-col">
            <div className="text-[10px] text-orange-300/70 text-center font-medium">
                <h3 className="text-sm font-semibold text-orange-400 mb-2 text-center">SỐ THAM KHẢO <br /> giả định tính toán đối với chứng khoán trong danh mục</h3>
            </div>

            <div className="space-y-2 mb-3">
                <NumberInput label="Tổng tài sản (TTS)" value={tts} onChange={setTts} />
                <NumberInput label="Tổng nợ (TN)" value={tn} onChange={setTn} />
                <NumberInput label="Tiền mặt" value={tien} onChange={setTien} />
                <NumberInput label="Tiền chờ về" value={tienChoVe} onChange={setTienChoVe} />
                <NumberInput label="Tỷ lệ vay" value={tyLeVay} onChange={setTyLeVay} suffix="%" isPercent />
            </div>

            <div className="bg-[var(--bg-glass)] rounded-lg p-2 mb-3">
                <ResultLabel label="NAV" value={calculated.nav} highlight />
                <ResultLabel label="CMR" value={calculated.cmr} unit="%" highlight />
            </div>

            <Tabs.Root defaultValue="tab-ty-le" className="flex-1">
                <Tabs.List className="flex border-b border-[var(--border-color)] mb-2">
                    <Tabs.Trigger
                        value="tab-ty-le"
                        className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] data-[state=active]:text-orange-500 data-[state=active]:border-b-2 data-[state=active]:border-orange-400 transition"
                    >
                        Đưa về tỷ lệ
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="tab-nop"
                        className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] data-[state=active]:text-orange-500 data-[state=active]:border-b-2 data-[state=active]:border-orange-400 transition"
                    >
                        Tính tiền nộp
                    </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="tab-ty-le" className="space-y-2">
                    <NumberInput label="Tỷ lệ cần đưa về" value={toRate} onChange={setToRate} suffix="%" isPercent />
                    <div className="bg-[var(--bg-glass)] rounded-lg p-2 mt-2">
                        <ResultLabel label="Phải Bán" value={calculated.phaiBan > 0 ? calculated.phaiBan : 0} highlight={calculated.phaiBan > 0} />
                        <div className="text-center text-xs text-[var(--text-muted)] py-1">— hoặc —</div>
                        <ResultLabel label="Phải Nộp" value={calculated.phaiNop > 0 ? calculated.phaiNop : 0} highlight={calculated.phaiNop > 0} />
                    </div>
                </Tabs.Content>

                <Tabs.Content value="tab-nop" className="space-y-2">
                    <NumberInput label="Giá trị mua" value={gtMua} onChange={setGtMua} />
                    <div className="bg-[var(--bg-glass)] rounded-lg p-2 mt-2">
                        <ResultLabel label="Nộp tối thiểu" value={calculated.nopToiThieu} highlight={calculated.nopToiThieu > 0} />
                        <div className="text-center text-xs text-[var(--text-muted)] py-1">— hoặc —</div>
                        <ResultLabel label="Nộp phát vay" value={calculated.nopPhatVay} highlight={calculated.nopPhatVay > 0} />
                    </div>
                </Tabs.Content>
            </Tabs.Root>
        </div>
    );
}
