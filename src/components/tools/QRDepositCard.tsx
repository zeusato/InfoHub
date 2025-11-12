// src/components/tools/QRDepositCard.tsx
import { useEffect, useState } from "react";

export default function QRDepositCard() {
  const [stockAccount, setStockAccount] = useState("069C");
  const [subAccount, setSubAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [saveInfo, setSaveInfo] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedStock = localStorage.getItem('savedStockAccount');
    const savedSub = localStorage.getItem('savedSubAccount');
    const saveChecked = localStorage.getItem('saveInfoChecked') === 'true';
    if (saveChecked && savedStock && savedSub) {
      setStockAccount(savedStock);
      setSubAccount(savedSub);
      setSaveInfo(true);
    }
  }, []);

  // Handle stock account input
  const handleStockAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('069C')) {
      value = '069C' + value.replace(/^069C/, '');
    }
    const afterPrefix = value.substring(4);
    const cleaned = afterPrefix.replace(/[^0-9]/g, '');
    setStockAccount('069C' + cleaned.substring(0, 6));
  };

  // Handle sub-account input
  const handleSubAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').substring(0, 2);
    setSubAccount(value);
  };

  // Handle amount input with formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val) {
      setAmount(Number(val).toLocaleString('vi-VN'));
    } else {
      setAmount('');
    }
  };

  // Generate QR
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!stockAccount || !subAccount) {
      alert('Vui lòng nhập đủ thông tin Số tài khoản chứng khoán và Tiểu khoản!');
      return;
    }

    // Save to localStorage if checked
    if (saveInfo) {
      localStorage.setItem('savedStockAccount', stockAccount);
      localStorage.setItem('savedSubAccount', subAccount);
      localStorage.setItem('saveInfoChecked', 'true');
    } else {
      localStorage.removeItem('savedStockAccount');
      localStorage.removeItem('savedSubAccount');
      localStorage.setItem('saveInfoChecked', 'false');
    }

    setLoading(true);

    const stk = "SHS" + stockAccount + subAccount;
    const bank = '970443'; // SHB mặc định
    const amountRaw = amount.replace(/[^0-9]/g, '') || '0';

    const url = `https://zeusato.github.io/qr-payment/qr.html?bank=${encodeURIComponent(bank)}&stk=${encodeURIComponent(stk)}&amount=${encodeURIComponent(amountRaw)}&t=${Date.now()}`;

    setQrUrl(url);

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="p-4 w-full h-full flex">
      <div className="w-1/2 pr-4">
        <form onSubmit={handleSubmit} className="space-y-4 h-full flex flex-col">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">
                Số TK chứng khoán*
              </label>
              <input
                type="text"
                value={stockAccount}
                onChange={handleStockAccountChange}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-zinc-200 placeholder-zinc-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="069Cxxxxxx"
                maxLength={10}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">
                Tiểu khoản*
              </label>
              <input
                type="text"
                value={subAccount}
                onChange={handleSubAccountChange}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-zinc-200 placeholder-zinc-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="xx"
                maxLength={2}
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="saveInfo"
              checked={saveInfo}
              onChange={(e) => setSaveInfo(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="saveInfo" className="text-xs text-zinc-400">
              Lưu thông tin tài khoản và tiểu khoản
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-1">
              Số tiền (VNĐ)
            </label>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-zinc-200 placeholder-zinc-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Nhập số tiền (mặc định 0)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            {loading ? '⏳ Đang tạo QR...' : '🎯 Tạo mã QR'}
          </button>
        </form>
      </div>

      <div className="w-1/2 flex items-center justify-center">
        {qrUrl ? (
          <iframe
            src={qrUrl}
            className="w-full h-full border border-white/20 rounded-lg"
            // title="QR Code Result"
          />
        ) : (
          <div className="text-zinc-400 text-sm text-center">
            QR sẽ hiển thị ở đây sau khi tạo
          </div>
        )}
      </div>
    </div>
  );
}