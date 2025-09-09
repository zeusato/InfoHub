/// <reference types="vite/client" />

// (tuỳ chọn) nếu muốn khai báo thêm biến môi trường VITE_*
interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
