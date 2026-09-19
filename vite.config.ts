import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@soccer-position-visualizer/core': path.resolve(rootDir, 'packages/core/src/index.ts'),
      '@soccer-position-visualizer/core/engine': path.resolve(rootDir, 'packages/core/src/engine'),
      '@soccer-position-visualizer/core/types': path.resolve(rootDir, 'packages/core/src/types'),
      '@soccer-position-visualizer/core/utils': path.resolve(rootDir, 'packages/core/src/utils'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
});
