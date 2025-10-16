export type MenuNode = {
  id: string
  label: string
  path?: string
  children?: MenuNode[]
}

export const MENU_COLORS: Record<number, string> = {
  0: 'border-brand/40 bg-brand/5',
  1: 'border-emerald-400/30 bg-emerald-400/5',
  2: 'border-cyan-400/30 bg-cyan-400/5',
}


export const MENU: MenuNode[] = [
  {
    id: 'product_news',
    label: 'Thông tin sản phẩm',
    children: [
      {
        id: 'release-notes',
        label: 'Phân phối IPO',
        children: [
          {
            id: 'phan-phoi-ipo-vpbs',
            label: 'Phân phối IPO - VPBS',
            children: [
              {
                id: 'huong-dan-ang-ky-at-mua',
                label: 'HD Đăng ký đặt mua',
                path: 'tin-tuc-san-pham/phan-phoi-ipo/phan-phoi-ipo-vpbs/tin-tuc-san-pham-phan-phoi-ipo-phan-phoi-ipo-vpbs-2025-10',
              },
              {
                id: 'faq-ipo-vpbs',
                label: 'FAQ - IPO VPBS',
                path: 'tin-tuc-san-pham/phan-phoi-ipo/phan-phoi-ipo-vpbs/faq-ipo-vpbs',
              },
            ],
          },
        ],
      },
      {
        id: 'promotions',
        label: 'Sản phẩm - Dịch vụ',
        children: [
          {
            id: 'san-pham-margin',
            label: 'Sản phẩm Margin',
            children: [
              {
                id: 'goi-vay-margin-t30',
                label: 'Gói vay Margin T30',
                path: 'tin-tuc-san-pham/san-pham-dich-vu/san-pham-margin/goi-vay-margin-t30',
              },
              {
                id: 'san-pham-margin-tplus',
                label: 'Sản phẩm Margin TPLUS',
                path: 'tin-tuc-san-pham/san-pham-dich-vu/san-pham-margin/san-pham-margin-tplus',
              },
              {
                id: 'uu-dai-margin-s79',
                label: 'Ưu đãi Margin S79',
                path: 'thong-tin-san-pham/san-pham-dich-vu/san-pham-margin/uu-dai-margin-s79',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'guides',
    label: 'Hướng dẫn sử dụng',
    children: [
      {
        id: 'onboarding',
        label: 'SHSmart (MTS 2.0)',
        children: [
          {
            id: 'tai-khoan',
            label: 'Tài khoản',
            children: [
              {
                id: 'hd-mo-tk-bang-ekyc',
                label: 'Mở TK bằng eKYC',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/tai-khoan/huong-dan-su-dung-shsmart-mts-2-0-tai-khoan-2025-10',
              },
              {
                id: 'dang-nhap',
                label: 'Đăng nhập',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/tai-khoan/dang-nhap',
              },
              {
                id: 'hd-dang-ky-smart-otp',
                label: 'Đăng ký Smart OTP',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/tai-khoan/hd-dang-ky-smart-otp',
              },
              {
                id: 'hd-lay-smart-otp',
                label: 'Lấy Smart OTP',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/tai-khoan/hd-lay-smart-otp',
              },
              {
                id: 'hd-thay-doi-thong-tin-ca-nhan',
                label: 'Thay đổi thông tin cá nhân',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/tai-khoan/hd-thay-doi-thong-tin-ca-nhan',
              },
              {
                id: 'quen-mat-khau',
                label: 'Quên mật khẩu',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/tai-khoan/quen-mat-khau',
              },
            ],
          },
          {
            id: 'giao-dich',
            label: 'Giao dịch',
            children: [
              {
                id: 'lenh-dieu-kien',
                label: 'Lệnh điều kiện',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/giao-dich/lenh-dieu-kien',
              },
              {
                id: 'dat-lenh-ck-co-so',
                label: 'Giao diện đặt lệnh dọc',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/giao-dich/dat-lenh-ck-co-so',
              },
              {
                id: 'giao-dien-dat-lenh-ngang',
                label: 'Giao diện đặt lệnh ngang',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/giao-dich/giao-dien-dat-lenh-ngang',
              },
              {
                id: 'huy-sua-lenh-cho-khop',
                label: 'Hủy/sửa lệnh chờ khớp',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/giao-dich/huy-sua-lenh-cho-khop',
              },
              {
                id: 'huy-toan-bo-lenh-cho-khop',
                label: 'Hủy toàn bộ lệnh chờ khớp',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/giao-dich/huy-toan-bo-lenh-cho-khop',
              },
              {
                id: 'ban-tat-ca-danh-muc-nam-giu',
                label: 'Bán tất cả danh mục nắm giữ',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/giao-dich/ban-tat-ca-danh-muc-nam-giu',
              },
            ],
          },
          {
            id: 'tai-san',
            label: 'Tài sản',
            children: [
              {
                id: 'bo-cuc-man-hinh-tai-san',
                label: 'Bố cục màn hình Tài sản',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/tai-san/bo-cuc-man-hinh-tai-san',
              },
              {
                id: 'hd-dat-lenh-ban-ma-nam-giu',
                label: 'HD đặt lệnh Bán mã nắm giữ',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/tai-san/hd-dat-lenh-ban-ma-nam-giu',
              },
              {
                id: 'hd-ban-tat-ca-danh-muc-nam-giu',
                label: 'HD Bán tất cả danh mục nắm giữ',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/tai-san/hd-ban-tat-ca-danh-muc-nam-giu',
              },
            ],
          },
          {
            id: 'chuyen-tien-chung-khoan',
            label: 'Chuyển tiền/chứng khoán',
            children: [
              {
                id: 'nop-tien',
                label: 'Nộp tiền',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/chuyen-tien-chung-khoan/nop-tien',
              },
              {
                id: 'rut-tien',
                label: 'Rút tiền',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/chuyen-tien-chung-khoan/rut-tien',
              },
              {
                id: 'ung-tien',
                label: 'Ứng tiền',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/chuyen-tien-chung-khoan/ung-tien',
              },
              {
                id: 'chuyen-tien-noi-bo',
                label: 'Chuyển tiền nội bộ',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/chuyen-tien-chung-khoan/chuyen-tien-noi-bo',
              },
              {
                id: 'nop-ky-quy',
                label: 'Nộp ký quỹ',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/chuyen-tien-chung-khoan/nop-ky-quy',
              },
              {
                id: 'rut-ky-quy',
                label: 'Rút ký quỹ',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/chuyen-tien-chung-khoan/rut-ky-quy',
              },
              {
                id: 'them-tai-khoan-ngan-hang',
                label: 'Thêm tài khoản ngân hàng',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/chuyen-tien-chung-khoan/them-tai-khoan-ngan-hang',
              },
              {
                id: 'hd-chuyen-chung-khoan',
                label: 'Chuyển chứng khoán',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/chuyen-tien-chung-khoan/hd-chuyen-chung-khoan',
              },
            ],
          },
          {
            id: 'dang-ky-dich-vu',
            label: 'Đăng ký dịch vụ',
            children: [
              {
                id: 'dang-ky-dv-margin-phai-sinh',
                label: 'Đăng ký DV Margin/Phái sinh',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/dang-ky-dich-vu/dang-ky-dv-margin-phai-sinh',
              },
              {
                id: 'dang-ky-san-pham-margin-tplus',
                label: 'Đăng ký sản phẩm Margin TPLUS',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/dang-ky-dich-vu/dang-ky-san-pham-margin-tplus',
              },
              {
                id: 'huy-doi-goi-margin-tplus',
                label: 'Hủy/Đổi gói Margin TPLUS',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/dang-ky-dich-vu/huy-doi-goi-margin-tplus',
              },
            ],
          },
          {
            id: 'quan-ly-no-vay',
            label: 'Quản lý nợ vay',
            children: [
              {
                id: 'dang-ky-huy-thu-no-tu-dong',
                label: 'Đăng ký/Hủy thu nợ tự động',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/quan-ly-no-vay/dang-ky-huy-thu-no-tu-dong',
              },
              {
                id: 'tra-no-chu-dong',
                label: 'Trả nợ chủ động',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/quan-ly-no-vay/tra-no-chu-dong',
              },
              {
                id: 'chi-tiet-no-vay',
                label: 'Chi tiết nợ vay',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/quan-ly-no-vay/chi-tiet-no-vay',
              },
            ],
          },
          {
            id: 'tien-ich-mo-rong',
            label: 'Tiện ích mở rộng',
            children: [
              {
                id: 'xac-nhan-lenh',
                label: 'Xác nhận lệnh',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/tien-ich-mo-rong/xac-nhan-lenh',
              },
              {
                id: 'tao-bang-gia-tuy-chon',
                label: 'Tạo bảng giá tùy chọn',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/tien-ich-mo-rong/tao-bang-gia-tuy-chon',
              },
              {
                id: 'notification',
                label: 'Notification',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/tien-ich-mo-rong/notification',
              },
              {
                id: 'hd-tao-canh-bao-gia',
                label: 'HD Tạo cảnh báo giá',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/tien-ich-mo-rong/hd-tao-canh-bao-gia',
              },
            ],
          },
        ],
      },
      {
        id: 'features',
        label: 'WebTrading 2.0',
        children: [
          {
            id: 'tai-khoan-1',
            label: 'Tài khoản',
            children: [
              {
                id: 'mo-tai-khoan',
                label: 'Mở tài khoản',
                path: 'huong-dan-su-dung/webtrading-2-0/tai-khoan/mo-tai-khoan',
              },
              {
                id: 'dang-nhap-1',
                label: 'Đăng nhập',
                path: 'huong-dan-su-dung/webtrading-2-0/tai-khoan/dang-nhap',
              },
              {
                id: 'quen-mat-khau-1',
                label: 'Quên mật khẩu',
                path: 'huong-dan-su-dung/webtrading-2-0/tai-khoan/quen-mat-khau',
              },
              {
                id: 'thong-tin-ca-nhan',
                label: 'Thông tin cá nhân',
                path: 'huong-dan-su-dung/webtrading-2-0/tai-khoan/thong-tin-ca-nhan',
              },
            ],
          },
          {
            id: 'giao-dich-1',
            label: 'Giao dịch',
            children: [
              {
                id: 'man-hinh-giao-dich-co-so',
                label: 'Màn hình giao dịch Cơ sở',
                path: 'huong-dan-su-dung/webtrading-2-0/giao-dich/man-hinh-giao-dich-co-so',
              },
              {
                id: 'man-hinh-giao-dich-phai-sinh',
                label: 'Màn hình giao dịch Phái sinh',
                path: 'huong-dan-su-dung/webtrading-2-0/giao-dich/man-hinh-giao-dich-phai-sinh',
              },
              {
                id: 'lenh-cho-khop',
                label: 'Theo dõi lệnh trong ngày',
                path: 'huong-dan-su-dung/webtrading-2-0/giao-dich/lenh-cho-khop',
              },
              {
                id: 'so-lenh-lich-su',
                label: 'Sổ lệnh lịch sử',
                path: 'huong-dan-su-dung/webtrading-2-0/giao-dich/so-lenh-lich-su',
              },
              {
                id: 'xac-nhan-lenh-1',
                label: 'Xác nhận lệnh',
                path: 'huong-dan-su-dung/webtrading-2-0/giao-dich/xac-nhan-lenh',
              },
              {
                id: 'chi-tiet-ma-chung-khoan',
                label: 'Chi tiết mã chứng khoán',
                path: 'huong-dan-su-dung/webtrading-2-0/giao-dich/chi-tiet-ma-chung-khoan',
              },
              {
                id: 'tong-quan-thi-truong',
                label: 'Tổng quan thị trường',
                path: 'huong-dan-su-dung/webtrading-2-0/giao-dich/tong-quan-thi-truong',
              },
            ],
          },
          {
            id: 'tai-san-1',
            label: 'Tài sản',
            children: [
              {
                id: 'thong-tin-tai-san',
                label: 'Thông tin tài sản',
                path: 'huong-dan-su-dung/webtrading-2-0/tai-san/thong-tin-tai-san',
              },
              {
                id: 'danh-muc-nam-giu',
                label: 'Danh mục nắm giữ',
                path: 'huong-dan-su-dung/webtrading-2-0/tai-san/danh-muc-nam-giu',
              },
              {
                id: 'ban-tat-ca-danh-muc-nam-giu-1',
                label: 'Bán tất cả danh mục nắm giữ',
                path: 'huong-dan-su-dung/webtrading-2-0/tai-san/ban-tat-ca-danh-muc-nam-giu',
              },
              {
                id: 'hieu-suat-dau-tu',
                label: 'Hiệu suất đầu tư',
                path: 'huong-dan-su-dung/webtrading-2-0/tai-san/hieu-suat-dau-tu',
              },
              {
                id: 'su-kien-quyen',
                label: 'Sự kiện quyền',
                path: 'huong-dan-su-dung/webtrading-2-0/tai-san/su-kien-quyen',
              },
            ],
          },
          {
            id: 'quan-ly-tien',
            label: 'Quản lý tiền',
            children: [
              {
                id: 'nop-tien-1',
                label: 'Nộp tiền',
                path: 'huong-dan-su-dung/webtrading-2-0/quan-ly-tien/nop-tien',
              },
              {
                id: 'rut-tien-1',
                label: 'Rút tiền',
                path: 'huong-dan-su-dung/webtrading-2-0/quan-ly-tien/rut-tien',
              },
              {
                id: 'ung-tien-1',
                label: 'Ứng tiền',
                path: 'huong-dan-su-dung/webtrading-2-0/quan-ly-tien/ung-tien',
              },
              {
                id: 'chuyen-tien-noi-bo-1',
                label: 'Chuyển tiền nội bộ',
                path: 'huong-dan-su-dung/webtrading-2-0/quan-ly-tien/chuyen-tien-noi-bo',
              },
              {
                id: 'chuyen-khoan-chung-khoan',
                label: 'Chuyển khoản chứng khoán',
                path: 'huong-dan-su-dung/webtrading-2-0/quan-ly-tien/chuyen-khoan-chung-khoan',
              },
              {
                id: 'nop-ky-quy-1',
                label: 'Nộp ký quỹ',
                path: 'huong-dan-su-dung/webtrading-2-0/quan-ly-tien/nop-ky-quy',
              },
              {
                id: 'rut-ky-quy-1',
                label: 'Rút ký quỹ',
                path: 'huong-dan-su-dung/webtrading-2-0/quan-ly-tien/rut-ky-quy',
              },
              {
                id: 'tra-no-chu-dong-1',
                label: 'Trả nợ chủ động',
                path: 'huong-dan-su-dung/webtrading-2-0/quan-ly-tien/tra-no-chu-dong',
              },
            ],
          },
          {
            id: 'tien-ich-khac',
            label: 'Tiện ích khác',
            children: [
              {
                id: 'cai-dat',
                label: 'Cài đặt',
                path: 'huong-dan-su-dung/webtrading-2-0/tien-ich-khac/cai-dat',
              },
              {
                id: 'cai-dat-khac',
                label: 'Cài đặt khác',
                path: 'huong-dan-su-dung/webtrading-2-0/tien-ich-khac/cai-dat-khac',
              },
              {
                id: 'tao-canh-bao-gia',
                label: 'Tạo cảnh báo giá',
                path: 'huong-dan-su-dung/webtrading-2-0/tien-ich-khac/tao-canh-bao-gia',
              },
              {
                id: 'he-thong-bao-cao',
                label: 'Hệ thống báo cáo',
                path: 'huong-dan-su-dung/webtrading-2-0/tien-ich-khac/he-thong-bao-cao',
              },
              {
                id: 'quan-ly-dich-vu',
                label: 'Quản lý dịch vụ',
                path: 'huong-dan-su-dung/webtrading-2-0/tien-ich-khac/quan-ly-dich-vu',
              },
              {
                id: 'he-thong-thong-bao',
                label: 'Hệ thống thông báo',
                path: 'huong-dan-su-dung/webtrading-2-0/tien-ich-khac/he-thong-thong-bao',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'news',
    label: 'Tin tức',
    children: [
      {
        id: 'SHSnews',
        label: 'Tin tức SHS',
        children: [
          {
            id: 'van-hoa-doanh-nghiep-1',
            label: 'Văn hóa doanh nghiệp',
          },
          {
            id: 'thong-tin-cong-bo',
            label: 'Thông tin công bố',
          },
          {
            id: 'tin-tuc-khac',
            label: 'Tin tức khác',
            children: [
              {
                id: 'shs-bao-lai-qusy-iii-2025',
                label: 'SHS báo lãi qusy III/2025',
                path: 'tin-tuc/tin-tuc-shs/tin-tuc-khac/shs-bao-lai-qusy-iii-2025',
              },
              {
                id: 'shs-khai-truong-tru-so-moi',
                label: 'SHS khai trương trụ sở mới',
                path: 'tin-tuc/tin-tuc-shs/tin-tuc-khac/shs-khai-truong-tru-so-moi',
              },
            ],
          },
        ],
      },
      {
        id: 'tin-thi-truong',
        label: 'Tin thị trường',
        children: [
          {
            id: 'tong-quan-thi-truong-1',
            label: 'Tổng quan thị trường',
            children: [
              {
                id: 'nang-hang-thi-truong',
                label: 'Nâng hạng thị trường',
                path: 'tin-tuc/tin-thi-truong/tong-quan-thi-truong/nang-hang-thi-truong',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'others',
    label: 'Thông tin khác',
    children: [
      {
        id: 'policy',
        label: 'Chính sách',
        children: [
          {
            id: 'service-terms',
            label: 'Điều khoản dịch vụ',
            path: 'others/policy/terms',
          },
          {
            id: 'privacy',
            label: 'Bảo mật',
            path: 'others/policy/privacy',
          },
        ],
      },
      {
        id: 'contact',
        label: 'Liên hệ',
        children: [
          {
            id: 'support',
            label: 'Hỗ trợ',
            path: 'others/contact/support',
          },
        ],
      },
    ],
  },
]
