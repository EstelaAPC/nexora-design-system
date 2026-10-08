import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    dedupe: ['lit'],
    alias: {
      '@nexora/components': fileURLToPath(new URL('../../packages/components/src/index.ts', import.meta.url)),
      '@nexora/theme': fileURLToPath(new URL('../../packages/theme/src/index.css', import.meta.url))
    }
  }
});
