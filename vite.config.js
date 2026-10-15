import { defineConfig } from 'vite';
import { cpSync, existsSync } from 'node:fs';

// Chép font chuẩn và cmap của pdf.js vào bản build để PDF hiển thị đúng khi OFFLINE.
function copyPdfjsAssets() {
  return {
    name: 'copy-pdfjs-assets',
    closeBundle() {
      for (const dir of ['cmaps', 'standard_fonts', 'wasm', 'iccs']) {
        const from = `node_modules/pdfjs-dist/${dir}`;
        if (existsSync(from)) cpSync(from, `dist/pdfjs/${dir}`, { recursive: true });
      }
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [copyPdfjsAssets()],
  build: {
    target: 'chrome80',
    outDir: 'dist',
    chunkSizeWarningLimit: 2000,
  },
});
