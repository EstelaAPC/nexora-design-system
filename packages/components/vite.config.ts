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
        icon: fileURLToPath(new URL('./src/icon/icon.ts', import.meta.url)),
        'icon-button': fileURLToPath(new URL('./src/icon-button/icon-button.ts', import.meta.url)),
        alert: fileURLToPath(new URL('./src/alert/alert.ts', import.meta.url)),
        spinner: fileURLToPath(new URL('./src/spinner/spinner.ts', import.meta.url)),
        progress: fileURLToPath(new URL('./src/progress/progress.ts', import.meta.url)),
        toast: fileURLToPath(new URL('./src/toast/toast.ts', import.meta.url)),
        tabs: fileURLToPath(new URL('./src/tabs/tabs.ts', import.meta.url)),
        breadcrumb: fileURLToPath(new URL('./src/breadcrumb/breadcrumb.ts', import.meta.url)),
        pagination: fileURLToPath(new URL('./src/pagination/pagination.ts', import.meta.url)),
        dialog: fileURLToPath(new URL('./src/dialog/dialog.ts', import.meta.url)),
        tooltip: fileURLToPath(new URL('./src/tooltip/tooltip.ts', import.meta.url)),
        popover: fileURLToPath(new URL('./src/popover/popover.ts', import.meta.url)),
        table: fileURLToPath(new URL('./src/table/table.ts', import.meta.url))
      },
      formats: ['es']
    },
    rollupOptions: {
      external: ['lit', /^@nexora\/icons(?:\/.*)?$/]
    }
  }
});
