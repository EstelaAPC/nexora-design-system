import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const iconEntries = [
  'check',
  'close',
  'plus',
  'minus',
  'chevron-down',
  'chevron-up',
  'arrow-left',
  'arrow-right',
  'info',
  'warning',
  'search'
];

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        ...Object.fromEntries(
          iconEntries.map((name) => [
            name,
            fileURLToPath(new URL(`./src/icons/${name}.ts`, import.meta.url))
          ])
        )
      },
      formats: ['es']
    }
  }
});
