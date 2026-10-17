# Trading_System trong workspace InfoHub

## Phạm vi và nguồn

Menu banner Trading_System thay link QR ngoài bằng button, mở một iframe trong vùng nội dung. Không tạo phiên SHOne ở InfoHub; không đọc/lưu token, tài khoản hoặc payload giao dịch. Contract nguồn: SHOne commit 5235bd8, apps/web/src/infrastructure/embed-bridge.ts và tests/features/embed/manual/host.html; tích hợp qua URL/postMessage, không copy source nghiệp vụ.

## Luồng UI → dữ liệu

| Sự kiện/trường UI | Nguồn / transport | Dữ liệu và hành vi | Ca kiểm |
|---|---|---|---|
| Trading_System | State local tradingOpen | Giữ activeLeaf trước đó; mở frame; đóng drawer mobile; aria-pressed phản ánh đang mở | IH-EMB-01 |
| Khung SHOne | GET HTTPS /embed/demo/board?theme=dark hoặc light ở SHOne Preview | iframe tự gọi BFF /api/embed/* và nguồn public theo contract SHOne; InfoHub không gọi API nghiệp vụ | IH-EMB-02 |
| Đang kết nối / SHOne / Chưa kết nối được | postMessage từ đúng origin và đúng contentWindow | Chỉ source shs-embed, version 1, type ready xác nhận tải ứng dụng; không suy từ onLoad. Sau 20 giây chưa ready hiện thông báo trong thanh cố định, giữ khung để đọc lỗi; ready muộn phục hồi | IH-EMB-03 |
| Theme | useTheme → query lần đầu, sau đó postMessage set_theme | payload {theme: dark hoặc light}; targetOrigin chính xác; giữ src và phiên khi đổi theme | IH-EMB-04 |
| InfoHub / chọn bài / Trang chủ | State local | Đóng và unmount iframe; nút InfoHub phục hồi activeLeaf trước đó. Không gửi logout; việc đóng không đồng nghĩa đăng xuất SHOne | IH-EMB-05 |
| Tải lại SHOne | Remount iframe do người dùng bấm | Bắt đầu lại timeout; không tự retry, không phát lệnh giao dịch từ host | IH-EMB-06 |
| URL sai | Biến build VITE_SHONE_EMBED_URL | Chỉ HTTPS, không credentials trong URL; cấu hình lỗi thì hiển thị thông báo, không tạo iframe | IH-EMB-07 |

## Responsive và sandbox

Desktop giữ sidebar 300px, iframe dùng toàn bộ cột còn lại (minmax(0,1fr)); tablet/phone sidebar là drawer như cũ, iframe full width. Chiều cao workspace tối thiểu 520px, tự tăng theo viewport; bảng/biểu mẫu cuộn bên trong iframe. Toolbar 44px, status truncate để không làm nở chiều ngang. Resize và theme không remount iframe. Giữ banner và ticker hiện tại.

Sandbox cho script, same-origin, form, popup và popup thoát sandbox phục vụ login; không cho top-navigation. storage-access và allow-storage-access-by-user-activation dành cho fallback Storage Access. Referrer strict-origin-when-cross-origin giữ host origin để bridge chạy cả trình duyệt không có ancestorOrigins. Không lưu/log payload phiên hoặc lệnh ở host.

## Cấu hình và triển khai

- Host thực: https://zeusato.github.io/InfoHub/app; allowlist origin https://zeusato.github.io, partner demo (quyền giữ nguyên cấu hình hiện có).
- Src mặc định: https://shone-git-embed-mode-manhquyet88-gmailcoms-projects.vercel.app/embed/demo/board.
- Preview hiện có Vercel Authentication; cần xử lý trước khi nghiệm thu iframe từ site công khai. Thêm allowlist không bỏ qua lớp bảo vệ này.
- InfoHub deploy bởi chủ dự án qua push main/GitHub Actions. Không deploy SHOne trong thay đổi này.

## Kiểm thử

Checklist IH-EMB-01..07: menu mở trong trang; quay lại bài/trang chủ; ready thật, timeout và tải lại; theme không reload; rộng desktop/tablet/phone; URL invalid; message sai origin/source/version bị bỏ qua. Tài khoản thật, OTP, giao dịch và tiền thuộc nghiệm thu riêng của SHOne, chưa chạy trong thay đổi host.
