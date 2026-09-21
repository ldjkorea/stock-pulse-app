import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // GitHub Pages 서브디렉토리 및 독립 도메인 배포 모두 호환
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    proxy: {
      '/toss-api': {
        target: 'https://openapi.tossinvest.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/toss-api/, ''),
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
} as any)
