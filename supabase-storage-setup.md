# Hướng dẫn Tạo Supabase Storage Buckets cho InfoHub

## 📁 Cấu trúc hiện tại

Dự án InfoHub đang lưu ảnh theo cấu trúc:
```
public/
├── hdsd/           # 97 images - hướng dẫn sử dụng
├── faqs/           # 4 images - FAQ images  
├── OG.png          # Open Graph image
└── (QR codes)      # SH Smart, SH Advisor QR codes
```

Trong `leafContent.json`, đường dẫn ảnh được lưu dạng **relative**:
```json
{
  "gallery": [
    "hdsd/HD dang ky TK bang eKYC (1).jpg",
    "hdsd/HD Dang nhap.jpg"
  ]
}
```

---

## 🎯 Chiến lược Bucket (Đơn giản hóa)

### Option 1: Single Bucket với Folders (RECOMMENDED ⭐)

**Tạo 1 bucket duy nhất**: `infohub-images`

**Cấu trúc folders**:
```
infohub-images/
├── hdsd/          # Hướng dẫn sử dụng (97 images)
├── faqs/          # FAQ images (4 images)
├── banners/       # Banner carousel images
└── workspace/     # QR codes (SH Smart, SH Advisor)
```

**Ưu điểm**:
- ✅ Đơn giản quản lý
- ✅ Dễ dàng migrate (giữ nguyên cấu trúc folder)
- ✅ Paths trong DB gần giống với paths hiện tại
- ✅ 1 bucket policy duy nhất

---

## 📋 Bước 1: Tạo Bucket trên Supabase

### 1.1. Truy cập Supabase Dashboard
1. Vào project InfoHub
2. Click **Storage** ở sidebar trái
3. Click **New bucket**

### 1.2. Tạo Bucket
```
Name: infohub-images
Public bucket: ✅ YES (checked)
File size limit: 10 MB
Allowed MIME types: image/* (hoặc để trống cho all types)
```

Click **Create bucket**

---

## 📤 Bước 2: Upload Images

### 2.1. Tạo Folders trong Bucket

Trong bucket `infohub-images`:

1. Click **Upload file**
2. Click **Create folder**
3. Nhập tên: `hdsd`
4. Click **Create folder**

Lặp lại cho các folders:
- `faqs`
- `banners`
- `workspace`

### 2.2. Upload Images vào từng Folder

**Upload HDSD images**:
1. Click vào folder `hdsd`
2. Click **Upload file**
3. Chọn TẤT CẢ files từ `d:\Quyetnm\Dev\InfoHub\public\hdsd\`
4. Click **Upload**

**Upload FAQ images**:
1. Click vào folder `faqs`
2. Upload files từ `d:\Quyetnm\Dev\InfoHub\public\faqs\`

**Upload Workspace QR codes**:
1. Click vào folder `workspace`
2. Upload `SHSmartQR.jpg`, `SHAdvisorQR.png`, etc.

**Upload Banners** (nếu có):
1. Click vào folder `banners`
2. Upload banner images

---

## 🔐 Bước 3: Setup Storage Policies

### 3.1. Enable RLS
```sql
-- Trên SQL Editor
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### 3.2. Public Read Policy
```sql
-- Allow public read access to infohub-images bucket
CREATE POLICY "Public can view infohub images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'infohub-images');
```

### 3.3. Admin Upload Policy
```sql
-- Authenticated users can upload/delete
CREATE POLICY "Authenticated users can upload infohub images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'infohub-images');

CREATE POLICY "Authenticated users can update infohub images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'infohub-images');

CREATE POLICY "Authenticated users can delete infohub images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'infohub-images');
```

---

## 🔄 Bước 4: Update Database Image Paths

### 4.1. Lấy Storage URL Pattern

Supabase Storage URL format:
```
https://YOUR-PROJECT-ID.supabase.co/storage/v1/object/public/infohub-images/{path}
```

**Ví dụ**:
```
Relative path: hdsd/HD Dang nhap.jpg
↓
Full URL: https://abcxyz.supabase.co/storage/v1/object/public/infohub-images/hdsd/HD%20Dang%20nhap.jpg
```

### 4.2. Update Gallery Paths trong Articles

```sql
-- Option 1: Simple CONCAT (nếu paths đã đúng)
UPDATE articles 
SET gallery = ARRAY(
  SELECT 'https://YOUR-PROJECT-ID.supabase.co/storage/v1/object/public/infohub-images/' || unnest(gallery)
)
WHERE gallery IS NOT NULL AND array_length(gallery, 1) > 0;

-- Option 2: Xử lý URL encoding
UPDATE articles 
SET gallery = ARRAY(
  SELECT 'https://YOUR-PROJECT-ID.supabase.co/storage/v1/object/public/infohub-images/' || 
         replace(replace(unnest(gallery), ' ', '%20'), '(', '%28')
         -- Add more replacements if needed
)
WHERE gallery IS NOT NULL AND array_length(gallery, 1) > 0;
```

### 4.3. Update Banner Images

```sql
-- Update banner_img paths
UPDATE articles 
SET banner_img = 'https://YOUR-PROJECT-ID.supabase.co/storage/v1/object/public/infohub-images/' || banner_img
WHERE banner_img IS NOT NULL AND banner_img != '';
```

### 4.4. Update Workspace Cards QR Images

```sql
-- Update workspace cards (after inserting default data)
UPDATE workspace_cards 
SET qr_image_url = 'https://YOUR-PROJECT-ID.supabase.co/storage/v1/object/public/infohub-images/workspace/' || 
  CASE 
    WHEN card_key = 'sh_smart' THEN 'sh-smart-qr.jpg'
    WHEN card_key = 'sh_advisor' THEN 'sh-advisor-qr.png'
  END;
```

---

## ✅ Bước 5: Verify Everything

### 5.1. Test Image Access
Mở browser và test URL:
```
https://YOUR-PROJECT-ID.supabase.co/storage/v1/object/public/infohub-images/hdsd/HD%20Dang%20nhap.jpg
```

Should return the image directly.

### 5.2. Verify Database
```sql
-- Check articles with gallery
SELECT path, gallery
FROM articles
WHERE gallery IS NOT NULL
LIMIT 5;

-- Verify workspace cards
SELECT card_key, qr_image_url
FROM workspace_cards;
```

---

## 📊 Storage Size Estimation

**Current images**:
- HDSD: 97 files (~50 MB estimated)
- FAQs: 4 files (~2 MB)
- Workspace QR: 2 files (~500 KB)
- **Total**: ~52 MB

**Supabase Free Tier**: 1 GB storage → đủ dư!

---

## 🚀 Alternative: Multiple Buckets (Complex)

Nếu muốn tách riêng từng loại (KHÔNG recommended):

| Bucket | Purpose | Size |
|--------|---------|------|
| `infohub-hdsd` | Hướng dẫn sử dụng | ~50 MB |
| `infohub-faqs` | FAQ images | ~2 MB |
| `infohub-banners` | Banner carousel | TBD |
| `infohub-workspace` | QR codes | ~500 KB |

**Nhược điểm**:
- ❌ Phức tạp hơn
- ❌ Phải setup 4 RLS policies riêng
- ❌ Migration phức tạp hơn

---

## 💡 Best Practices

1. **Image Naming**: 
   - Avoid spaces → use dashes: `hd-dang-nhap.jpg`
   - Hoặc URL encode khi query

2. **Folder Organization**:
   ```
   infohub-images/
   ├── hdsd/
   │   ├── tai-khoan/
   │   ├── giao-dich/
   │   └── tai-san/
   ├── faqs/
   └── ...
   ```

3. **Image Optimization** (optional):
   - Compress images trước khi upload
   - Use WebP format for better compression

---

## 🔧 Helper Script: Bulk Update

Nếu cần update paths hàng loạt:

```javascript
// scripts/update-image-paths.js
const supabaseUrl = 'YOUR-PROJECT-ID.supabase.co';

// Read from articles
const articles = await supabase.from('articles').select('*');

for (const article of articles) {
  if (article.gallery) {
    const updatedGallery = article.gallery.map(path => 
      `https://${supabaseUrl}/storage/v1/object/public/infohub-images/${path}`
    );
    
    await supabase
      .from('articles')
      .update({ gallery: updatedGallery })
      .eq('id', article.id);
  }
}
```

---

## ✨ Summary

1. ✅ Tạo bucket `infohub-images` (public)
2. ✅ Tạo folders: `hdsd/`, `faqs/`, `workspace/`, `banners/`
3. ✅ Upload images vào từng folder
4. ✅ Setup RLS policies
5. ✅ Update database paths với full URLs
6. ✅ Test image access

**Đơn giản, hiệu quả, dễ maintain!** 🎉
