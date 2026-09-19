import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const repositoryName =
  process.env.GITHUB_PAGES_REPOSITORY_NAME ?? process.env.GITHUB_REPOSITORY?.split('/')[1];
const githubPagesBase = repositoryName ? `/${repositoryName}/` : '/';

export default defineConfig({
  base: githubPagesBase,
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
});
