import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      // Example: frontend calls backend via http://localhost:3000
      // Use /api when backend exposes prefixed routes
      // '/api': 'http://localhost:3000'
    }
  }
});
