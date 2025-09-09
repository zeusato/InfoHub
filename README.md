# InfoHub (React + Vite + Tailwind)

Dự án khởi tạo theo yêu cầu: 2 route (`/` Intro, `/app` Workspace), sidebar 3 tầng, glass style dark mode, accent cam neon.

## Chạy dev

```bash
npm i
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy lên GitHub Pages

1. Tạo branch `gh-pages` (hoặc để script tạo sau).
2. **Quan trọng**: set biến base cho Vite để route đúng trên GH Pages.

- Cách 1 (khuyên dùng): truyền env khi build

```bash
# repo của đại ca: ví dụ SHS-InfoHub -> base /SHS-InfoHub/
VITE_BASE=/SHS-InfoHub/ npm run deploy
```

- Cách 2: tạo file `.env.production`

```
VITE_BASE=/SHS-InfoHub/
```

3. Deploy

```bash
npm run deploy
```

Script sẽ tự tạo `dist/.nojekyll` và copy `dist/index.html` -> `dist/404.html` để fix route SPA trên GH Pages.
