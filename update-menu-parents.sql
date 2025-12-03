-- COMPLETE Menu Parent/Child Relationship Update
-- Based on menuData.ts hierarchy

-- Strategy: Update parent_id by matching labels in hierarchical order
-- Level 1 items have parent_id = NULL (already correct)
-- Level 2+ items need parent_id set

BEGIN;

-- ======================
-- LEVEL 2 ITEMS (children of Level 1)
-- ======================

-- Under "Thông tin sản phẩm"
UPDATE menu_items 
SET parent_id = (SELECT id FROM menu_items WHERE label = 'Thông tin sản phẩm' AND level = 1 LIMIT 1)
WHERE label IN ('Phân phối IPO', 'Sản phẩm - Dịch vụ') 
  AND level = 2;

-- Under "Hướng dẫn sử dụng"
UPDATE menu_items
SET parent_id = (SELECT id FROM menu_items WHERE label = 'Hướng dẫn sử dụng' AND level = 1 LIMIT 1)
WHERE label IN ('SHSmart (MTS 2.0)', 'SHAdvisor')
  AND level = 2;

-- Under "FAQ"
UPDATE menu_items
SET parent_id = (SELECT id FROM menu_items WHERE label = 'FAQ' AND level = 1 LIMIT 1)
WHERE label IN ('Giao dịch', 'Tài khoản VPS')
  AND level = 2;

-- ======================
-- LEVEL 3 ITEMS (children of Level 2)
-- ======================

-- Under "Phân phối IPO"
UPDATE menu_items
SET parent_id = (SELECT id FROM menu_items WHERE label = 'Phân phối IPO' AND level = 2 LIMIT 1)
WHERE label IN ('Phân phối IPO - VPBS')
  AND level = 3;

-- Under "Sản phẩm - Dịch vụ"
UPDATE menu_items
SET parent_id = (SELECT id FROM menu_items WHERE label = 'Sản phẩm - Dịch vụ' AND level = 2 LIMIT 1)
WHERE label IN ('Sản phẩm Margin', 'Sản phẩm Ứng trước tiền bán')
  AND level = 3;

-- Under "SHSmart (MTS 2.0)"
UPDATE menu_items
SET parent_id = (SELECT id FROM menu_items WHERE label = 'SHSmart (MTS 2.0)' AND level = 2 LIMIT 1)
WHERE label IN (
  'Tài khoản',
  'Khớp lệnh',
  'Lệnh điều kiện',
  'Nộp / rút tiền',
  'Danh mục',
  'Margin',
  'VSD',
  'Thông tin sản phẩm đăng ký'
) AND level = 3;

-- Under "SHAdvisor"
UPDATE menu_items
SET parent_id = (SELECT id FROM menu_items WHERE label = 'SHAdvisor' AND level = 2 LIMIT 1)
WHERE label IN (
  'Danh mục theo dõi',
  'Thông tin cổ phiếu',
  'Screener',
  'Margin',
  'Thông tin tài khoản'
) AND level = 3;

-- Under "Giao dịch" (FAQ)
UPDATE menu_items
SET parent_id = (SELECT id FROM menu_items WHERE label = 'Giao dịch' AND level = 2 LIMIT 1)
WHERE label IN ('Đặt lệnh', 'Sửa/Hủy lệnh')
  AND level = 3;

-- Under "Tài khoản VPS" (FAQ)
UPDATE menu_items
SET parent_id = (SELECT id FROM menu_items WHERE label = 'Tài khoản VPS' AND level = 2 LIMIT 1)
WHERE label IN ('Mở tài khoản', 'Margin')
  AND level = 3;

-- ======================
-- LEVEL 4 ITEMS (leaf articles - use path to match)
-- ======================

-- Under "Phân phối IPO - VPBS"
UPDATE menu_items
SET parent_id = (
  SELECT id FROM menu_items 
  WHERE label = 'Phân phối IPO - VPBS' 
    AND level = 3 
  LIMIT 1
)
WHERE path LIKE 'tin-tuc-san-pham/phan-phoi-ipo/phan-phoi-ipo-vpbs/%';

-- Under "Sản phẩm Margin"
UPDATE menu_items
SET parent_id = (
  SELECT id FROM menu_items 
  WHERE label = 'Sản phẩm Margin' 
    AND level = 3
    AND parent_id = (SELECT id FROM menu_items WHERE label = 'Sản phẩm - Dịch vụ' LIMIT 1)
  LIMIT 1
)
WHERE path LIKE '%/san-pham-margin/%';

-- Under "Sản phẩm Ứng trước tiền bán"
UPDATE menu_items
SET parent_id = (
  SELECT id FROM menu_items 
  WHERE label = 'Sản phẩm Ứng trước tiền bán' 
    AND level = 3
  LIMIT 1
)
WHERE path LIKE '%/ung-truoc-tien-ban/%';

-- Under "Tài khoản" (SHSmart)
UPDATE menu_items
SET parent_id = (
  SELECT m.id FROM menu_items m
  INNER JOIN menu_items p ON m.parent_id = p.id
  WHERE m.label = 'Tài khoản' 
    AND m.level = 3
    AND p.label = 'SHSmart (MTS 2.0)'
  LIMIT 1
)
WHERE path LIKE 'huong-dan-su-dung/shsmart-mts-2-0/tai-khoan/%';

-- Under "Khớp lệnh"
UPDATE menu_items
SET parent_id = (
  SELECT m.id FROM menu_items m
  INNER JOIN menu_items p ON m.parent_id = p.id
  WHERE m.label = 'Khớp lệnh' 
    AND m.level = 3
    AND p.label = 'SHSmart (MTS 2.0)'
  LIMIT 1
)
WHERE path LIKE 'huong-dan-su-dung/shsmart-mts-2-0/khop-lenh/%';

-- Under "Lệnh điều kiện"
UPDATE menu_items
SET parent_id = (
  SELECT m.id FROM menu_items m
  INNER JOIN menu_items p ON m.parent_id = p.id
  WHERE m.label = 'Lệnh điều kiện' 
    AND m.level = 3
    AND p.label = 'SHSmart (MTS 2.0)'
  LIMIT 1
)
WHERE path LIKE 'huong-dan-su-dung/shsmart-mts-2-0/lenh-dieu-kien/%';

-- Under "Nộp / rút tiền"
UPDATE menu_items
SET parent_id = (
  SELECT m.id FROM menu_items m
  INNER JOIN menu_items p ON m.parent_id = p.id
  WHERE m.label = 'Nộp / rút tiền' 
    AND m.level = 3
    AND p.label = 'SHSmart (MTS 2.0)'
  LIMIT 1
)
WHERE path LIKE 'huong-dan-su-dung/shsmart-mts-2-0/nop-rut-tien/%';

-- Under "Danh mục" (SHSmart)
UPDATE menu_items
SET parent_id = (
  SELECT m.id FROM menu_items m
  INNER JOIN menu_items p ON m.parent_id = p.id
  WHERE m.label = 'Danh mục' 
    AND m.level = 3
    AND p.label = 'SHSmart (MTS 2.0)'
  LIMIT 1
)
WHERE path LIKE 'huong-dan-su-dung/shsmart-mts-2-0/danh-muc/%';

-- Under "Margin" (SHSmart)
UPDATE menu_items
SET parent_id = (
  SELECT m.id FROM menu_items m
  INNER JOIN menu_items p ON m.parent_id = p.id
  WHERE m.label = 'Margin' 
    AND m.level = 3
    AND p.label = 'SHSmart (MTS 2.0)'
  LIMIT 1
)
WHERE path LIKE 'huong-dan-su-dung/shsmart-mts-2-0/margin/%';

-- Under "VSD"
UPDATE menu_items
SET parent_id = (
  SELECT m.id FROM menu_items m
  INNER JOIN menu_items p ON m.parent_id = p.id
  WHERE m.label = 'VSD' 
    AND m.level = 3
    AND p.label = 'SHSmart (MTS 2.0)'
  LIMIT 1
)
WHERE path LIKE 'huong-dan-su-dung/shsmart-mts-2-0/vsd/%';

-- Under "Thông tin sản phẩm đăng ký"
UPDATE menu_items
SET parent_id = (
  SELECT m.id FROM menu_items m
  INNER JOIN menu_items p ON m.parent_id = p.id
  WHERE m.label = 'Thông tin sản phẩm đăng ký' 
    AND m.level = 3
    AND p.label = 'SHSmart (MTS 2.0)'
  LIMIT 1
)
WHERE path LIKE 'huong-dan-su-dung/shsmart-mts-2-0/thong-tin-san-pham-dang-ky/%';

-- SHAdvisor sections
-- Under "Danh mục theo dõi" (SHAdvisor)
UPDATE menu_items
SET parent_id = (
  SELECT m.id FROM menu_items m
  INNER JOIN menu_items p ON m.parent_id = p.id
  WHERE m.label = 'Danh mục theo dõi' 
    AND m.level = 3
    AND p.label = 'SHAdvisor'
  LIMIT 1
)
WHERE path LIKE 'huong-dan-su-dung/shadvisor/danh-muc-theo-doi/%';

-- Under "Thông tin cổ phiếu"
UPDATE menu_items
SET parent_id = (
  SELECT m.id FROM menu_items m
  INNER JOIN menu_items p ON m.parent_id = p.id
  WHERE m.label = 'Thông tin cổ phiếu' 
    AND m.level = 3
    AND p.label = 'SHAdvisor'
  LIMIT 1
)
WHERE path LIKE 'huong-dan-su-dung/shadvisor/thong-tin-co-phieu/%';

-- Under "Screener"
UPDATE menu_items
SET parent_id = (
  SELECT m.id FROM menu_items m
  INNER JOIN menu_items p ON m.parent_id = p.id
  WHERE m.label = 'Screener' 
    AND m.level = 3
    AND p.label = 'SHAdvisor'
  LIMIT 1
)
WHERE path LIKE 'huong-dan-su-dung/shadvisor/screener/%';

-- Under "Margin" (SHAdvisor)
UPDATE menu_items
SET parent_id = (
  SELECT m.id FROM menu_items m
  INNER JOIN menu_items p ON m.parent_id = p.id
  WHERE m.label = 'Margin' 
    AND m.level = 3
    AND p.label = 'SHAdvisor'
  LIMIT 1
)
WHERE path LIKE 'huong-dan-su-dung/shadvisor/margin/%';

-- Under "Thông tin tài khoản"
UPDATE menu_items
SET parent_id = (
  SELECT m.id FROM menu_items m
  INNER JOIN menu_items p ON m.parent_id = p.id
  WHERE m.label = 'Thông tin tài khoản' 
    AND m.level = 3
    AND p.label = 'SHAdvisor'
  LIMIT 1
)
WHERE path LIKE 'huong-dan-su-dung/shadvisor/thong-tin-tai-khoan/%';

COMMIT;

-- Verification query
SELECT 
  m.id,
  m.label,
  m.level,
  m.path,
  p.label as parent_label,
  CASE 
    WHEN m.parent_id IS NULL AND m.level > 1 THEN '❌ Missing parent'
    WHEN m.parent_id IS NOT NULL AND m.level = 1 THEN '❌ Should be null'
    ELSE '✅ OK'
  END as status
FROM menu_items m
LEFT JOIN menu_items p ON m.parent_id = p.id
ORDER BY m.order_index;

-- Count missing parents
SELECT 
  level,
  COUNT(*) as total,
  SUM(CASE WHEN parent_id IS NULL THEN 1 ELSE 0 END) as null_parents
FROM menu_items
WHERE level > 1
GROUP BY level;
