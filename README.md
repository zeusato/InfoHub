# InfoHub

InfoHub là một nền tảng quản lý thông tin nội bộ (Knowledge Base) hiện đại, được xây dựng với React, Vite, Tailwind CSS và Supabase.

## 🚀 Tính năng chính

### 1. User Workspace (`/app`)
- **Giao diện Glassmorphism**: Thiết kế hiện đại, dark mode, tối ưu trải nghiệm đọc.
- **Dynamic Menu**: Menu 3 cấp độ được tải động từ Database.
- **Nội dung đa dạng**: Hỗ trợ bài viết, video, slide, FAQ.

### 2. Content Management System (CMS)
- **Dashboard**: Thống kê tổng quan.
- **Article Editor**: Soạn thảo bài viết với Rich Text Editor (Quill), hỗ trợ upload ảnh, video.
- **Menu Manager**: Quản lý cấu trúc menu (kéo thả, xóa đệ quy).
    - **An toàn**: Có mật khẩu bảo vệ và modal xác nhận 2 lớp khi xóa.
- **FAQ Manager**: Quản lý câu hỏi thường gặp.
- **Carousel Manager**: Quản lý banner/slide trang chủ.

### 3. Backend & Infrastructure (Supabase)
- **Database**: PostgreSQL lưu trữ bài viết, menu, FAQ.
- **Authentication**: Đăng nhập quản trị viên.
- **Storage**: Lưu trữ hình ảnh, video.

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

Project đã được cấu hình để deploy tự động qua GitHub Actions.

### Cấu hình GitHub Secrets
Vào **Settings > Secrets and variables > Actions** và thêm 2 biến:
- `VITE_SUPABASE_URL`: URL Supabase project.
- `VITE_SUPABASE_ANON_KEY`: Anon key của Supabase.

### Deploy
1.  Push code lên nhánh `main`.
2.  GitHub Action sẽ tự động build và deploy lên nhánh `gh-pages`.
3.  Vào **Settings > Pages**, chọn source là `Deploy from a branch` và chọn nhánh `gh-pages`.

## 📚 Tài liệu tham khảo
- [Supabase Setup Guide](./SETUP-SUPABASE.md)
- [Walkthrough](./walkthrough.md)
