var _a;
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
// You can override base via env var VITE_BASE. For GH Pages set to '/<repo>/' (e.g. '/InfoHub/').
var base = (_a = process.env.VITE_BASE) !== null && _a !== void 0 ? _a : '/';
export default defineConfig({
    base: '/InfoHub/',
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    }
});
