import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 解决开发环境 CSP 问题
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'none';"
    }
  },
  build: {
    // 生产环境优化
    rollupOptions: {
      output: {
        // 避免在生产环境中使用 eval
        format: 'es'
      }
    }
  }
})
