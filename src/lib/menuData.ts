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
        label: 'Release Notes',
        children: [
          {
            id: 'rn-2025-09',
            label: 'Bản phát hành 09/2025',
            path: 'news/release-notes/2025-09',
          },
          {
            id: 'rn-2025-08',
            label: 'Bản phát hành 08/2025',
            path: 'news/release-notes/2025-08',
          },
          {
            id: 'test2',
            label: 'Test2',
            path: 'tin-tuc-san-pham/release-notes/e2',
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
        label: 'Bắt đầu nhanh',
        children: [
          {
            id: 'quick-start',
            label: 'Quick Start',
            path: 'guides/quick-start',
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
