import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#ff7a18', // neon-ish orange
          50: '#fff4e8',
          100: '#ffe7cf',
          200: '#ffca9c',
          300: '#ffac69',
          400: '#ff8f36',
          500: '#ff7a18',
          600: '#e8660f',
          700: '#bf4e0b',
          800: '#953c0b',
          900: '#76300a',
          950: '#3f1704'
        }
      },
      boxShadow: {
        'neon': '0 0 20px rgba(255, 122, 24, 0.45), 0 0 40px rgba(255, 122, 24, 0.25)'
      },
      backgroundImage: {
        'grid-dots': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)'
      },
      backgroundSize: {
        'grid-dots': '24px 24px'
      }
    },
  },
  plugins: [],
} satisfies Config
