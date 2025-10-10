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
    id: 'news',
    label: 'Tin tức sản phẩm',
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
            id: 'feature-a',
            label: 'Tài sản',
            path: 'guides/features/a',
          },
          {
            id: 'feature-b',
            label: 'Tính năng B',
            path: 'guides/features/b',
          },
          {
            id: 'man-hinh-tai-san',
            label: 'Màn hình tài sản',
            path: 'huong-dan-su-dung/webtrading-2-0/man-hinh-tai-san',
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
