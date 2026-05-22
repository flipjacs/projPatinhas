import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    cssMinify: 'lightningcss',
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router') || id.includes('@remix-run')) return 'router';
            if (id.includes('react-dom') || id.includes('scheduler')) return 'react-dom';
            if (id.includes('/react/')) return 'react';
          }
          return undefined;
        },
      },
    },
  },
});
