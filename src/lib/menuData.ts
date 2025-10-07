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
                id: 'Huong-dan-dang-ky',
                label: 'HD đăng ký CTV',
                path: 'tin-tuc-san-pham/phan-phoi-ipo/tin-tuc-san-pham-phan-phoi-ipo-2025-10',
              },
              {
                id: 'huong-dan-ang-ky-at-mua',
                label: 'HD Đăng ký đặt mua',
                path: 'tin-tuc-san-pham/phan-phoi-ipo/phan-phoi-ipo-vpbs/tin-tuc-san-pham-phan-phoi-ipo-phan-phoi-ipo-vpbs-2025-10',
              },
            ],
          },
        ],
      },
      {
        id: 'promotions',
        label: 'Ưu đãi',
        children: [
          {
            id: 'promo-sh69',
            label: 'Gói SH69',
            path: 'news/promotions/sh69',
          },
          {
            id: 'test',
            label: 'test',
            path: 'tin-tuc-san-pham/uu-ai/test4',
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
                label: 'HD Mở TK bằng eKYC',
                path: 'huong-dan-su-dung/shsmart-mts-2-0/tai-khoan/huong-dan-su-dung-shsmart-mts-2-0-tai-khoan-2025-10',
              },
            ],
          },
        ],
      },
      {
        id: 'features',
        label: 'Tính năng',
        children: [
          {
            id: 'feature-a',
            label: 'Tính năng A',
            path: 'guides/features/a',
          },
          {
            id: 'feature-b',
            label: 'Tính năng B',
            path: 'guides/features/b',
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
