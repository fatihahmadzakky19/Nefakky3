// Mengimpor module 'path' dari Node.js untuk manipulasi lokasi direktori
import path from 'node:path';
// Mengimpor 'fileURLToPath' untuk mengonversi URL module ES ke path lokal sistem berkas
import { fileURLToPath } from 'node:url';

// Mengimpor fungsi 'defineConfig' dari kerangka kerja pengujian Vitest
import { defineConfig } from 'vitest/config';

// Mengimpor plugin pengujian Storybook Vitest
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

// Mengimpor provider pengujian browser Playwright untuk Vitest
import { playwright } from '@vitest/browser-playwright';

// Menentukan direktori utama tempat file vitest.config.ts berada
const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Konfigurasi utama Vitest untuk pengujian komponen UI & Storybook
export default defineConfig({
  test: {
    projects: [
      {
        extends: true, // Mewarisi konfigurasi pengujian dasar
        plugins: [
          // Plugin storybookTest akan menguji cerita (stories) yang didefinisikan dalam Storybook
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook', // Nama proyek pengujian
          browser: {
            enabled: true, // Mengaktifkan pengujian berbasis browser sungguhan
            headless: true, // Menjalankan browser di latar belakang tanpa UI window
            provider: playwright({}), // Menggunakan Playwright sebagai pengendali otomatisasi browser
            instances: [{ browser: 'chromium' }], // Menjalankan pengujian di engine browser Chromium (Google Chrome)
          },
        },
      },
    ],
  },
});

