import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        button: fileURLToPath(new URL('./src/button/button.ts', import.meta.url))
      },
      formats: ['es']
    },
    rollupOptions: {
      external: ['lit']
    }
  }
});
