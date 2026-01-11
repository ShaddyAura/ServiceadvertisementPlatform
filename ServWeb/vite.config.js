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
});
