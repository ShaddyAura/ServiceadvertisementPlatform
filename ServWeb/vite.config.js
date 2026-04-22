// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [
    react(),   // <-- REQUIRED for JSX !!!
    mkcert(),  // optional for HTTPS certificates
  ],
  server: {
    https: true,   // enable HTTPS
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui')) return 'vendor-mui';
            if (id.includes('recharts')) return 'vendor-recharts';
            if (id.includes('@microsoft/signalr')) return 'vendor-signalr';
            return 'vendor';
          }
        },
      },
      onwarn(warning, warn) {
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT' || 
            (warning.message && warning.message.includes('contains an annotation that Rollup cannot interpret'))) {
          return;
        }
        warn(warning);
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});

