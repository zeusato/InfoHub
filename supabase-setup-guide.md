# Hướng dẫn Setup Supabase cho InfoHub

## Bước 1: Tạo Supabase Project

### 1.1. Đăng ký/Đăng nhập Supabase
1. Truy cập [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** hoặc **"Sign in"**
3. Đăng nhập bằng GitHub account (recommended)

### 1.2. Tạo Project mới
1. Sau khi login, click **"New Project"**
2. Chọn Organization (hoặc tạo mới)
3. Điền thông tin:
   - **Name**: `infohub-production` (hoặc tên bạn muốn)
   - **Database Password**: Tạo password mạnh (lưu lại để sau này dùng)
   - **Region**: Chọn `Southeast Asia (Singapore)` (gần VN nhất)
   - **Pricing Plan**: Chọn **Free** ($0/month)
4. Click **"Create new project"**
5. Đợi ~2 phút để Supabase provision database

---

## Bước 2: Chạy SQL Migration Script

### 2.1. Mở SQL Editor
1. Trong Supabase Dashboard, click **"SQL Editor"** ở sidebar bên trái
2. Click **"New query"**

### 2.2. Copy & Run Migration Script
1. Mở file `supabase-migration.sql` (đã tạo)
2. Copy toàn bộ nội dung
3. Paste vào SQL Editor
4. Click **"Run"** (hoặc Ctrl+Enter)
5. Kiểm tra kết quả:
   - ✅ Success: Hiển thị "Success. No rows returned"
   - ❌ Error: Đọc error message và fix

### 2.3. Verify Tables
1. Click **"Table Editor"** ở sidebar
2. Kiểm tra các tables đã được tạo:
   - ✅ `articles`
   - ✅ `slides` (3 rows)
   - ✅ `menu_items`
   - ✅ `faq_items`
   - ✅ `workspace_cards` (2 rows)
   - ✅ `banner_links`

---

## Bước 3: Setup Storage Buckets

### 3.1. Tạo Storage Buckets
1. Click **"Storage"** ở sidebar
2. Click **"New bucket"**
3. Tạo 4 buckets (lặp lại 4 lần):

**Bucket 1: article-images**
- Name: `article-images`
- Public bucket: ✅ **YES** (checked)
- File size limit: `50 MB`
- Allowed MIME types: `image/*`
- Click "Create bucket"

**Bucket 2: banner-images**
- Name: `banner-images`
- Public bucket: ✅ **YES**
- File size limit: `10 MB`
- Allowed MIME types: `image/*`

**Bucket 3: workspace-images**
- Name: `workspace-images`
- Public bucket: ✅ **YES**
- File size limit: `5 MB`
- Allowed MIME types: `image/*`

**Bucket 4: faq-images**
- Name: `faq-images`
- Public bucket: ✅ **YES**
- File size limit: `10 MB`
- Allowed MIME types: `image/*`

### 3.2. Upload Images (Optional - có thể làm sau)
1. Click vào bucket `article-images`
2. Click **"Upload files"**
3. Select hình ảnh từ `public/hdsd/`
4. Upload tất cả

> **Lưu ý**: Bạn có thể upload sau khi develop CMS

---

## Bước 4: Migrate Data với Tool

### 4.1. Sử dụng JSON to SQL Converter
1. Mở file `json-to-sql-converter.html` trong browser
2. Drag & drop file `src/data/leafContent.json` vào tool
3. Tool sẽ generate SQL INSERT statements
4. Copy SQL từ tab **"Articles"**
5. Paste vào SQL Editor và Run
6. Verify: Check Table Editor → `articles` table

### 4.2. Upload Images to Storage
1. Sau khi insert articles, upload images:
   - Vào Storage → `article-images`
   - Upload tất cả images từ `public/hdsd/` và `public/faqs/`
2. Note down Supabase Storage URL pattern:
   ```
   https://YOUR-PROJECT-ID.supabase.co/storage/v1/object/public/article-images/filename.jpg
   ```

### 4.3. Update Image Paths
1. Quay lại SQL Editor
2. Run update query (replace `YOUR-PROJECT-ID`):
   ```sql
   -- Replace YOUR-PROJECT-ID với project ID thật
   UPDATE articles 
   SET banner_img = 'https://YOUR-PROJECT-ID.supabase.co/storage/v1/object/public/article-images/' || banner_img
   WHERE banner_img IS NOT NULL AND banner_img != '';
   
   UPDATE articles
   SET gallery = ARRAY(
     SELECT 'https://YOUR-PROJECT-ID.supabase.co/storage/v1/object/public/article-images/' || unnest(gallery)
   )
   WHERE gallery IS NOT NULL;
   ```

---

## Bước 5: Tạo Admin User

### 5.1. Add User qua Dashboard
1. Click **"Authentication"** ở sidebar
2. Click **"Users"** tab
3. Click **"Add user"** → **"Create new user"**
4. Điền thông tin:
   - **Email**: `admin@infohub.local` (hoặc email thật)
   - **Password**: Tạo password mạnh
   - **Auto Confirm User**: ✅ **YES** (checked)
5. Click **"Create user"**

### 5.2. Test Login (sau khi develop CMS)
- Dùng email/password này để login vào `/cms/login`

---

## Bước 6: Lấy API Keys

### 6.1. Copy Project Credentials
1. Click **"Settings"** (icon ⚙️) ở sidebar
2. Click **"API"**
3. Copy 2 values sau:

**Project URL**:
```
https://abcdefgh.supabase.co
```

**anon/public key** (API Key):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
```

> ⚠️ **QUAN TRỌNG**: 
> - Copy `anon public` key, KHÔNG phải `service_role` key
> - `anon public` key là an toàn để commit vào code
> - `service_role` key TUYỆT ĐỐI không được public

---

## Bước 7: Setup Environment Variables

### 7.1. Tạo `.env.local` (Development)
1. Trong project InfoHub, tạo file `.env.local`:
   ```bash
   VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
   ```
2. Replace bằng values thật từ bước 6.1

### 7.2. Update `.gitignore`
Ensure `.gitignore` có:
```
.env.local
.env*.local
```

### 7.3. Setup GitHub Secrets (cho Production)
1. Vào GitHub repository
2. Settings → Secrets and variables → Actions
3. Click **"New repository secret"**
4. Tạo 2 secrets:

**Secret 1**:
- Name: `VITE_SUPABASE_URL`
- Value: `https://YOUR-PROJECT-ID.supabase.co`

**Secret 2**:
- Name: `VITE_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....`

---

## Bước 8: Test Connection

### 8.1. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### 8.2. Test với Simple Script
Tạo file `test-supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://YOUR-PROJECT-ID.supabase.co',
  'YOUR-ANON-KEY'
)

// Test fetch articles
const { data, error } = await supabase
  .from('articles')
  .select('*')
  .limit(5)

if (error) {
  console.error('Error:', error)
} else {
  console.log('Success! Articles:', data)
}
```

Run:
```bash
node test-supabase.js
```

Expected output: List of 5 articles

---

## Bước 9: Configure CORS (nếu cần)

### 9.1. Add Allowed Origins
1. Settings → API → "URL Configuration"
2. Scroll to **"Site URL"**
3. Add your domains:
   ```
   http://localhost:5173
   https://YOUR-USERNAME.github.io
   ```
4. Click "Save"

---

## Bước 10: Verify Everything

### ✅ Checklist
- [ ] Tables created (articles, slides, menu_items, faq_items, workspace_cards, banner_links)
- [ ] RLS policies enabled và working
- [ ] Storage buckets created (4 buckets)
- [ ] Admin user created
- [ ] Images uploaded (hoặc sẽ upload sau)
- [ ] Articles data migrated
- [ ] Environment variables configured
- [ ] Test connection successful

---

## Troubleshooting

### Lỗi "relation does not exist"
➡️ Tables chưa được tạo, re-run migration script

### Lỗi "permission denied"
➡️ RLS policies chưa đúng, check policies trong SQL Editor

### Lỗi "Invalid API key"
➡️ Check lại ANON_KEY, đảm bảo copy đúng key

### Images không load
➡️ Check bucket là PUBLIC và path đúng

---

## 🎉 Hoàn thành!

Bây giờ bạn đã có:
- ✅ Supabase project running
- ✅ Database schema ready
- ✅ Storage configured
- ✅ Admin user created
- ✅ API credentials

**Next steps**: 
1. Develop frontend integration (ContentHost, BannerCarousel)
2. Build CMS interface
3. Deploy to GitHub Pages
