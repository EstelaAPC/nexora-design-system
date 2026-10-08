import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        button: fileURLToPath(new URL('./src/button/button.ts', import.meta.url)),
        input: fileURLToPath(new URL('./src/input/input.ts', import.meta.url)),
        textarea: fileURLToPath(new URL('./src/textarea/textarea.ts', import.meta.url)),
        checkbox: fileURLToPath(new URL('./src/checkbox/checkbox.ts', import.meta.url)),
        radio: fileURLToPath(new URL('./src/radio/radio.ts', import.meta.url)),
        switch: fileURLToPath(new URL('./src/switch/switch.ts', import.meta.url)),
        select: fileURLToPath(new URL('./src/select/select.ts', import.meta.url)),
        icon: fileURLToPath(new URL('./src/icon/icon.ts', import.meta.url))
      },
      formats: ['es']
    },
    rollupOptions: {
      external: ['lit', /^@nexora\/icons(?:\/.*)?$/]
    }
  }
});
