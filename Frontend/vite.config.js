import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/vtu': {
        target: 'https://vtuapi.internyet.in',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/vtu/, '')
      }
    }
  },
  plugins: [react()],
})
