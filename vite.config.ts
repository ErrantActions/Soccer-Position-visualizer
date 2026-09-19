import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  base: isGitHubPagesBuild ? '/Soccer-Position-visualizer/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
});
