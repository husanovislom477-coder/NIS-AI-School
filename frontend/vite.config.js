import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const nid = id.replace(/\\/g, '/');
          if (nid.includes('node_modules/react/') || nid.includes('node_modules/react-dom/') || nid.includes('node_modules/react-router-dom/')) {
            return 'react-vendor';
          }
          if (nid.includes('node_modules/framer-motion/')) {
            return 'framer-motion';
          }
          if (nid.includes('node_modules/react-icons/') || nid.includes('node_modules/lucide-react/')) {
            return 'ui-icons';
          }
          if (nid.includes('node_modules/@tanstack/react-query/')) {
            return 'query-vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})
