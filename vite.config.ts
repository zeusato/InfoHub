import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// You can override base via env var VITE_BASE. For GH Pages set to '/<repo>/' (e.g. '/InfoHub/').
const base = process.env.VITE_BASE ?? '/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/InfoHub/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
}))
