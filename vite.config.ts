import { defineConfig } from 'vite';

const BASE_PATH = (globalThis as any).process?.env?.BASE_PATH ?? '/';

export default defineConfig({
  base: BASE_PATH,
  build: {
    target: 'es2020'
  },
  assetsInclude: ['**/*.ttf']
});
