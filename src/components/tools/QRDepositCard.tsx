import { useEffect, useState } from "react";
import QRModal from "@/components/QRModal";

import AlertModal from "@/components/AlertModal";


export default function QRDepositCard() {
  const [stockAccount, setStockAccount] = useState("069C");
  const [subAccount, setSubAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [saveInfo, setSaveInfo] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrCreated, setQrCreated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

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
    setQrCreated(false);
  };

  // Handle sub-account input
  const handleSubAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').substring(0, 2);
    setSubAccount(value);
    setQrCreated(false);
  };

  // Handle amount input with formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val) {
      setAmount(Number(val).toLocaleString('vi-VN'));
    } else {
      setAmount('');
    }
    setQrCreated(false);
  };

  // Generate QR
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!stockAccount || !subAccount) {
      setAlertMessage('Vui lòng nhập đủ thông tin Số tài khoản chứng khoán và Tiểu khoản!');
      setShowAlert(true);
      return;
    }

    // Check max amount
    const amountRaw = amount.replace(/[^0-9]/g, '') || '0';
    if (Number(amountRaw) > 499000000) {
      setAlertMessage('Số tiền tối đa cho mỗi lần nộp 24/7 là 499.000.000 đồng');
      setShowAlert(true);
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
    setQrCreated(false);

    const stk = "SHS" + stockAccount + subAccount;
    const bank = '970443'; // SHB mặc định

    const url = `https://zeusato.github.io/qr-payment/qr.html?bank=${encodeURIComponent(bank)}&stk=${encodeURIComponent(stk)}&amount=${encodeURIComponent(amountRaw)}&t=${Date.now()}`;

    setQrUrl(url);

    setTimeout(() => {
      setLoading(false);
      setQrCreated(true);
    }, 2000);
  };

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    window.open(qrUrl, '_blank');
  };

  return (
    <div className="p-4 w-full h-full flex flex-col sm:flex-row gap-4">
      {/* Form section - full width on mobile, half on desktop */}
      <div className="w-full sm:w-1/2">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 h-full flex flex-col">
          {/* Row 1: Stock Account - always full width */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Số TK chứng khoán*
            </label>
            <input
              type="text"
              value={stockAccount}
              onChange={handleStockAccountChange}
              className="w-full rounded-lg bg-[var(--bg-glass)] border border-[var(--border-color)] px-3 py-2 text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="069Cxxxxxx"
              maxLength={10}
              required
            />
          </div>

          {/* Row 2: Sub Account - full width on mobile (separate row) */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Tiểu khoản*
            </label>
            <input
              type="text"
              value={subAccount}
              onChange={handleSubAccountChange}
              className="w-full rounded-lg bg-[var(--bg-glass)] border border-[var(--border-color)] px-3 py-2 text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="xx"
              maxLength={2}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="saveInfo"
              checked={saveInfo}
              onChange={(e) => setSaveInfo(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="saveInfo" className="text-xs text-[var(--text-secondary)]">
              Lưu thông tin tài khoản và tiểu khoản
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Số tiền (VNĐ) - Tối đa 499 triệu
            </label>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              className="w-full rounded-lg bg-[var(--bg-glass)] border border-[var(--border-color)] px-3 py-2 text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Nhập số tiền (mặc định 0)"
            />
          </div>

          <button
            type="submit"
            disabled={loading || qrCreated}
            className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition text-sm sm:text-base"
          >
            {loading ? '\u23f3 \u0110ang t\u1ea1o QR...' : (qrCreated ? '\u2713 QR \u0111\u00e3 t\u1ea1o' : '\ud83c\udfaf T\u1ea1o m\u00e3 QR')}
          </button>

          {/* Mobile: View QR button - only show when QR is fully created */}
          {qrCreated && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="sm:hidden w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-400 text-white font-semibold rounded-lg shadow-md hover:from-orange-700 hover:to-orange-500 transition"
            >
              👁️ Xem QR
            </button>
          )}
        </form>
      </div>

      {/* QR Display section - hidden on mobile */}
      <div className="hidden sm:flex w-1/2 items-center justify-center">
        {qrUrl ? (
          <iframe
            src={qrUrl}
            className="w-full h-full border border-white/20 rounded-lg"
            title="QR Code Result"
          />
        ) : (
          <div className="text-[var(--text-muted)] text-sm text-center">
            QR sẽ hiển thị ở đây sau khi tạo
          </div>
        )}
      </div>

      {/* Modal for mobile */}
      <QRModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onDownload={handleDownloadQR}
      >
        {qrUrl && (
          <iframe
            src={qrUrl}
            className="w-full h-72 border-0 rounded-lg"
            title="QR Code in Modal"
          />
        )}
      </QRModal>
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        message={alertMessage}
      />
    </div>
  );
}