# Trading_System trong workspace InfoHub

## Phạm vi và nguồn

Menu banner Trading_System thay link QR ngoài bằng button, mở một iframe trong vùng nội dung. Không tạo phiên SHOne ở InfoHub; không đọc/lưu token, tài khoản hoặc payload giao dịch. Contract nguồn: SHOne commit 5235bd8, apps/web/src/infrastructure/embed-bridge.ts và tests/features/embed/manual/host.html; tích hợp qua URL/postMessage, không copy source nghiệp vụ.

## Luồng UI → dữ liệu

| Sự kiện/trường UI | Nguồn / transport | Dữ liệu và hành vi | Ca kiểm |
|---|---|---|---|
| Trading_System | State local tradingOpen | Giữ activeLeaf trước đó; mở frame; đóng drawer mobile; aria-pressed phản ánh đang mở | IH-EMB-01 |
| Khung SHOne | GET HTTPS /embed/infohub/board?theme=dark hoặc light ở SHOne Production | iframe tự gọi BFF /api/embed/* và nguồn public theo contract SHOne; InfoHub không gọi API nghiệp vụ | IH-EMB-02 |
| Đang kết nối / SHOne / Chưa kết nối được | postMessage từ đúng origin và đúng contentWindow | Chỉ source shs-embed, version 1, type ready xác nhận tải ứng dụng; không suy từ onLoad. Sau 20 giây chưa ready hiện thông báo trong thanh cố định, giữ khung để đọc lỗi; ready muộn phục hồi | IH-EMB-03 |
| Theme | useTheme → query lần đầu, sau đó postMessage set_theme | payload {theme: dark hoặc light}; targetOrigin chính xác; giữ src và phiên khi đổi theme | IH-EMB-04 |
| InfoHub / chọn bài / Trang chủ | State local | Đóng và unmount iframe; nút InfoHub phục hồi activeLeaf trước đó. Không gửi logout; việc đóng không đồng nghĩa đăng xuất SHOne | IH-EMB-05 |
| Tải lại SHOne | Remount iframe do người dùng bấm | Bắt đầu lại timeout; không tự retry, không phát lệnh giao dịch từ host | IH-EMB-06 |
| URL sai | Biến build VITE_SHONE_EMBED_URL | Chỉ HTTPS, không credentials trong URL; cấu hình lỗi thì hiển thị thông báo, không tạo iframe | IH-EMB-07 |

## Responsive và sandbox

Desktop giữ sidebar 300px, iframe dùng toàn bộ cột còn lại (minmax(0,1fr)); tablet/phone sidebar là drawer như cũ, iframe full width. Chiều cao workspace tối thiểu 520px, tự tăng theo viewport; bảng/biểu mẫu cuộn bên trong iframe. Toolbar 44px, status truncate để không làm nở chiều ngang. Resize và theme không remount iframe. Giữ banner và ticker hiện tại.

Sandbox cho script, same-origin, form, popup và popup thoát sandbox phục vụ login; không cho top-navigation. storage-access và allow-storage-access-by-user-activation dành cho fallback Storage Access. Referrer strict-origin-when-cross-origin giữ host origin để bridge chạy cả trình duyệt không có ancestorOrigins. Không lưu/log payload phiên hoặc lệnh ở host.

## Cấu hình và triển khai

- Host thực: https://zeusato.github.io/InfoHub/app; allowlist origin https://zeusato.github.io, partner infohub (quyền giữ nguyên cấu hình hiện có).
- Src mặc định: https://shone-platform.vercel.app/embed/infohub/board.
- Sử dụng domain production; không cần tắt Vercel Authentication của Preview. Partner infohub chỉ có origin HTTPS công khai của InfoHub.
- InfoHub deploy bởi chủ dự án qua push main/GitHub Actions. Theo yêu cầu tiếp theo của chủ dự án, SHOne embed được chuẩn bị và deploy production từ SHOne repo riêng.

## Kiểm thử

Checklist IH-EMB-01..07: menu mở trong trang; quay lại bài/trang chủ; ready thật, timeout và tải lại; theme không reload; rộng desktop/tablet/phone; URL invalid; message sai origin/source/version bị bỏ qua. Tài khoản thật, OTP, giao dịch và tiền thuộc nghiệm thu riêng của SHOne, chưa chạy trong thay đổi host.

## Kết quả kiểm tại thời điểm chuyển production (17/10/2026)

- Build InfoHub thành công; 4 tests URL/protocol pass với `node --experimental-strip-types --test tests/trading-embed.test.mjs` (Node 22.18+).
- Typecheck các file thay đổi: 0 diagnostic. Typecheck toàn repo đang fail do lỗi có sẵn trong `src/utils/supabase-helpers.ts`; không coi toàn repo đã pass.
- Browser local: menu mở iframe trong trang, quay lại InfoHub, timeout khi bị Vercel Authentication chặn; phone 390 và tablet 900 không overflow ngang trong workspace iframe.
- Tải module production từ trang host thật cần bản InfoHub chứa URL production được deploy. Login/OTP và giao dịch thật chưa thực hiện.

## Smoke production và lỗi host còn dùng URL cũ (17/10/2026)

SHOne commit 41821fb đã READY trên production. Entry /embed/infohub/board trả200, CSP frame-ancestors chỉ cho https://zeusato.github.io; config và session guest trả200; mở trực tiếp entry có đủ 5 tab và bảng giá có dữ liệu. Không đăng nhập hay gửi nghiệp vụ thật.

Bản InfoHub công khai khi kiểm vẫn tải shone-git-embed-mode-manhquyet88-gmailcoms-projects.vercel.app/embed/demo/board, bị chuyển đến Vercel Authentication và hiện vercel.com refused to connect. Chủ dự án cần commit/push các sửa đổi production hiện có để workflow deploy lại. Nếu GitHub Actions variable VITE_SHONE_EMBED_URL đã được đặt thì để trống hoặc đổi thành https://shone-platform.vercel.app/embed/infohub/board; biến build có ưu tiên hơn mặc định trong source. Kiểm iframe end-to-end sau khi workflow xong, rồi tải lại InfoHub.
