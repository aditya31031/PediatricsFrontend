import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // target: 'http://localhost:5000',
        target: 'https://pediatricsbackend-4hii.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('https://pediatricsbackend-4hii.onrender.com'),
  },
})
