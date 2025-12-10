/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Use Terser for minification to enable console removal
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove all console.* statements in production builds
        // This prevents sensitive data (payment info, order details, etc.) from being logged
        drop_console: true,
        drop_debugger: true,
      },
    },
    // TODO: Setup Sentry for error tracking in production
    // 1. Install: npm install @sentry/react @sentry/vite-plugin
    // 2. Add Sentry Vite plugin for source maps
    // 3. Initialize Sentry in src/main.tsx with Sentry.init()
    // 4. Replace console.error calls with Sentry.captureException()
    // 5. Add error boundaries with Sentry.ErrorBoundary
    // See: https://docs.sentry.io/platforms/javascript/guides/react/
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/types/**',
        'src/utils/mockDataGenerators.ts',
      ],
    },
  },
});
