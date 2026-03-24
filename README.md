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

