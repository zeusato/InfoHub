# InfoHub

InfoHub là một nền tảng quản lý thông tin nội bộ (Knowledge Base) hiện đại, được xây dựng với hệ sinh thái React, Vite và Supabase, tối ưu hóa cho trải nghiệm người dùng và hiệu suất quản trị.

## 🚀 Tính năng chính

### 1. User Workspace (`/app`)
- **Giao diện Glassmorphism**: Thiết kế hiện đại, hỗ trợ Dark/Light mode linh hoạt với hiệu ứng mượt mà.
- **Dynamic Content**: Menu 3 cấp độ được tải động từ Database, tự động cập nhật cấu hình theo thời gian thực.
- **Trải nghiệm Premium**: Tích hợp bộ thư viện **Lightswind** (Border Beam, Glowing Cards, Shiny Text, Smokey Cursor) tạo cảm giác cao cấp.
- **Công cụ hỗ trợ chuyên sâu**:
    - **QR Tools**: Bộ tạo và quản lý mã QR (Referral QR, Deposit QR, App Download).
    - **Financial Tools**: Công cụ tính toán Margin chứng khoán tích hợp.
    - **News Integration**: Theo dõi tin tức tài chính qua RSS feed (Cafebiz, Vietstock).
- **Hệ thống thông báo**: Tự động hiển thị Toast notification cho các bài viết mới hoặc bài viết cập nhật gần đây.

### 2. Content Management System (CMS)
- **Advanced Analytics**: Theo dõi lưu lượng truy cập trực quan với biểu đồ **ECharts** (Traffic theo ngày, Top bài viết phổ biến).
- **Article Editor**: Trình soạn thảo Rich Text (Quill) mạnh mẽ, hỗ trợ đa phương tiện (Video, Slide, Hình ảnh).
- **Menu Manager**: Quản lý cấu trúc cây đệ quy với cơ chế bảo mật xác thực 2 lớp.
- **Resource Management**: Quản lý Carousel, FAQ, và phân quyền người dùng tập trung.

### 3. Progressive Web App (PWA)
- **Cài đặt dễ dàng**: Hỗ trợ cài đặt như một ứng dụng native trên mobile và desktop.
- **Offline Readiness**: Cấu hình Service Worker tối ưu để đảm bảo tốc độ tải trang nhanh và khả năng truy cập cơ bản khi mất kết nối.

### 4. Backend & Infrastructure (Supabase)
- **PostgreSQL**: Lưu trữ dữ liệu cấu trúc phức tạp, hỗ trợ truy vấn hiệu năng cao.
- **Authentication**: Hệ thống đăng nhập bảo mật cho quản trị viên.
- **Storage**: CDN lưu trữ và tối ưu hóa tài nguyên hình ảnh/video.

## 🛠 Cài đặt & Chạy Local

### Yêu cầu
- Node.js 18+
- Tài khoản Supabase

### Các bước
1.  **Clone project**:
    ```bash
    git clone <repo-url>
    cd InfoHub
    ```

2.  **Cài đặt dependencies**:
    ```bash
    npm install
    ```

3.  **Cấu hình môi trường**:
    - Copy file `.env.example` thành `.env.local`.
    - Điền thông tin Supabase của bạn vào `.env.local`:
      ```env
      VITE_SUPABASE_URL=https://your-project.supabase.co
      VITE_SUPABASE_ANON_KEY=your-anon-key
      ```
    - *(Tùy chọn)* Đặt mật khẩu admin cho Menu Manager (mặc định là `admin123`):
      ```env
      VITE_ADMIN_PASSWORD=your-secure-password
      ```

4.  **Chạy Development Server**:
    ```bash
    npm run dev
    ```

## 📦 Deployment (GitHub Pages)

Project được tự động hóa quy trình CI/CD qua **GitHub Actions**.

### Cấu hình GitHub Secrets
Vào **Settings > Secrets and variables > Actions** và thêm:
- `VITE_SUPABASE_URL`: URL Supabase project.
- `VITE_SUPABASE_ANON_KEY`: Anon key của Supabase.

### Quy trình Deploy
1.  Push code lên nhánh `main`.
2.  Action `deploy.yml` sẽ tự động thực hiện build và đẩy bản build lên nhánh `gh-pages`.
3.  Cấu hình GitHub Pages từ nhánh `gh-pages` để website hoạt động.

## 📚 Tài liệu tham khảo
- [Supabase Setup Guide](./SETUP-SUPABASE.md)
- [Walkthrough & Verification](./walkthrough.md)

## Trading_System nhúng SHOne

Mục **Trading_System** trong banner mở SHOne ngay trong workspace. Nút **InfoHub** trở lại nội dung trước đó; chọn Trang chủ/bài viết ở sidebar cũng đóng khung. Đổi theme hoặc kích thước cửa sổ không tải lại iframe. Tải lại trang InfoHub trở về luồng điều hướng hiện có.

- Mặc định dùng SHOne Production, partner `infohub`, module `board`.
- URL có thể đổi bằng biến build `VITE_SHONE_EMBED_URL` trong `.env.local` hoặc GitHub **Settings → Secrets and variables → Actions → Variables**. Không đưa token/khóa phiên vào biến này.
- Trang production: `https://zeusato.github.io/InfoHub/app`; origin cần có trong Global Config `embedPartners.partners.infohub.domains`: `https://zeusato.github.io` (không có đường dẫn).
- Chạy local bằng `npm run dev -- --host 127.0.0.1 --port 5174 --strictPort`. Partner production `infohub` chỉ cho phép origin HTTPS của InfoHub; kiểm iframe production trên GitHub Pages sau deploy. Muốn test iframe local, dùng một partner Preview riêng qua biến URL build.
- Domain SHOne Production phải truy cập công khai; đăng nhập nghiệp vụ diễn ra bên trong SHOne. Không dùng URL bypass bí mật trong frontend.
- Khi đổi domain/partner, cập nhật biến build rồi build/deploy lại InfoHub.

Hồ sơ màn và checklist: [docs/screens/trading-embed.md](docs/screens/trading-embed.md). Deploy: commit/push `main`; workflow hiện có sẽ build và xuất bản GitHub Pages.
