import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@nexora/components': fileURLToPath(new URL('./packages/components/src/index.ts', import.meta.url)),
      '@nexora/design-tokens': fileURLToPath(new URL('./packages/design-tokens/src/index.css', import.meta.url)),
      '@nexora/theme': fileURLToPath(new URL('./packages/theme/src/index.css', import.meta.url))
    }
  }
});
