import path from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';

function normalizeModuleId(id: string) {
  return id.replace(/\\/g, '/');
}

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = normalizeModuleId(id);

          if (!normalizedId.includes('/node_modules/')) {
            return undefined;
          }

          if (
            normalizedId.includes('/node_modules/vue/') ||
            normalizedId.includes('/node_modules/@vue/')
          ) {
            return 'vue-vendor';
          }

          if (normalizedId.includes('/node_modules/vue-router/')) {
            return 'router-vendor';
          }

          if (normalizedId.includes('/node_modules/pinia/')) {
            return 'state-vendor';
          }

          if (
            normalizedId.includes('/node_modules/socket.io-client/') ||
            normalizedId.includes('/node_modules/@socket.io/') ||
            normalizedId.includes('/node_modules/engine.io-client/') ||
            normalizedId.includes('/node_modules/engine.io-parser/') ||
            normalizedId.includes('/node_modules/socket.io-parser/')
          ) {
            return 'socket-vendor';
          }

          if (
            normalizedId.includes('/node_modules/@unovis/') ||
            normalizedId.includes('/node_modules/d3')
          ) {
            return 'chart-vendor';
          }

          if (normalizedId.includes('/node_modules/reka-ui/')) {
            return 'ui-vendor';
          }

          if (normalizedId.includes('/node_modules/lucide-vue-next/')) {
            return 'icon-vendor';
          }

          if (normalizedId.includes('/node_modules/@tanstack/')) {
            return 'table-vendor';
          }

          if (normalizedId.includes('/node_modules/axios/')) {
            return 'api-vendor';
          }

          if (
            normalizedId.includes('/node_modules/@vueuse/') ||
            normalizedId.includes('/node_modules/vue-sonner/') ||
            normalizedId.includes('/node_modules/tailwind-merge/') ||
            normalizedId.includes('/node_modules/class-variance-authority/') ||
            normalizedId.includes('/node_modules/clsx/')
          ) {
            return 'app-utils-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:5001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
