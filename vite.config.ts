import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

// You can override base via env var VITE_BASE. For GH Pages set to '/<repo>/' (e.g. '/InfoHub/').
const base = process.env.VITE_BASE ?? '/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/InfoHub/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon-192x192.png'],
      manifest: {
        name: 'InfoHub - Knowledge Base',
        short_name: 'InfoHub',
        description: 'Nền tảng quản lý thông tin nội bộ SHS',
        theme_color: '#fb923c',
        background_color: '#0b0b0d',
        display: 'standalone',
        start_url: '/InfoHub/',
        scope: '/InfoHub/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
}))
