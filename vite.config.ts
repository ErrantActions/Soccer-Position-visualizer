import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const configuredBasePath = process.env.BASE_PATH;
const repositoryName =
  process.env.GITHUB_PAGES_REPOSITORY_NAME ?? process.env.GITHUB_REPOSITORY?.split('/')[1];

const normalizeBasePath = (value: string): string => {
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
};

const githubPagesBase = configuredBasePath
  ? normalizeBasePath(configuredBasePath)
  : repositoryName
    ? `/${repositoryName}/`
    : '/';

export default defineConfig({
  base: githubPagesBase,
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
});
