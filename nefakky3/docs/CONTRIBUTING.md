# Panduan Berkontribusi (CONTRIBUTING.md) — Nefakky Marketplace

Terima kasih atas minat Anda untuk berkontribusi pada pengembangan **Nefakky Artisanal Culinary Marketplace**! Dokumen ini memuat panduan, standar penulisan kode, dan etika kolaborasi agar seluruh codebase tetap bersih, konsisten, dan mudah dipelihara.

---

## 1. Kode Etik & Standar Pengembangan

Kami berkomitmen untuk menyediakan lingkungan kolaborasi yang profesional, ramah, dan inklusif. Seluruh kontributor diharapkan mematuhi standar berikut:
* Bersikap saling menghargai dan terbuka terhadap masukan teknis konstruktif.
* Mengutamakan kualitas kode, keamanan data, dan kepuasan pengalaman pengguna (*User Experience*).
* Menjaga integritas dokumentasi dan kelengkapan komentar kode fungsi berbahasa Indonesia.

---

## 2. Standar Gaya Penulisan Kode (Coding Guidelines)

### 2.1 Kebijakan Desain "Anti-AI-Slop" (Ketat)
* **Dilarang Keras**: Menambahkan emoji kartun 3D murahan (`📦`, `🍳`, `🛵`, `📍`, `🎉`) atau ikon generator AI generik yang merusak estetika editorial restoran artisanal.
* **Standar Ikon**: Seluruh ikon baru wajib melalui script generator `scripts/gen_icons.py` dan didaftarkan di `src/components/icons/CustomIcons.tsx` dengan teknik rendering CSS `mask-image`.

### 2.2 Frontend Next.js & React (TypeScript)
* **TypeScript Strict Mode**: Kode harus 100% type-safe. Dilarang meninggalkan linting error atau tipe data implisit `any`.
* **Kompilasi Valid**: Sebelum commit, wajib menjalankan `npx tsc --noEmit` dan memastikan **0 errors**.
* **Penamaan Komponen & File**:
  * Komponen UI: **PascalCase** (misal: `LiveCameraModal.tsx`, `AdminOrdersTab.tsx`).
  * Hooks Kustom: **camelCase** dengan awalan `use` (misal: `useAuth.ts`, `useRealtimeBroadcaster.ts`).
  * Utilitas: **camelCase** (misal: `mapService.ts`, `annualArchive.ts`).
* **Styling Tailwind CSS**:
  * Gunakan token desain yang seragam (*Nordic Citrus Orange* `#FF5400`, *Gold Amber* `#FFB703`, *Deep Navy* `#0B0F19`, *Slate Canvas* `#F8FAFC`).
* **Aksesibilitas (WCAG 2.1 AA)**: Seluruh tombol ikon interaktif wajib menyertakan atribut `aria-label` deskriptif.

### 2.3 Backend Laravel (PHP)
* **Standar PSR**: Wajib mematuhi standar **PSR-12** dan **PSR-4**.
* **Type Hinting & Return Types**: Gunakan *explicit type declarations* pada seluruh argumen fungsi dan nilai balik.
* **Form Requests**: Validasi request mutasi (`POST`, `PUT`, `PATCH`) wajib menggunakan class `FormRequest` khusus.

---

## 3. Alur Penambahan Ikon Kustom Baru

Jika Anda ingin menambahkan icon kustom baru ke platform:
1. Simpan gambar PNG transparan beresolusi tinggi (disarankan siluet garis hitam bersih 512x512) ke folder aset.
2. Buka berkas generator `scripts/gen_icons.mjs`.
3. Daftarkan mapping nama berkas baru pada dictionary `mapping`.
4. Jalankan script generator di terminal:
   ```bash
   npm run icons
   # Atau: node scripts/gen_icons.mjs
   ```
5. Buka `src/components/icons/CustomIcons.tsx` dan pastikan ekspor komponen baru beserta alias drop-in yang relevan telah terdaftar rapi.
6. Uji kompilasi proyek:
   ```bash
   npx tsc --noEmit
   ```

---

## 4. Alur Kerja Git & Format Pesan Commit

### 4.1 Format Pesan Commit (Conventional Commits)
Gunakan format standar deskriptif:
```
<tipe>(<cakupan opsional>): <deskripsi singkat perubahan>
```
* **Contoh Tipe Commit**:
  - `feat`: Penambahan fitur baru (misal: `feat(icons): add 3 bespoke cooking, megaphone and settings icons`)
  - `fix`: Perbaikan bug atau broken import (misal: `fix(orders): resolve courier camera capture permission`)
  - `docs`: Pembaruan dokumentasi (misal: `docs: update PRD and architecture to v4.5.0`)
  - `refactor`: Perapian kode tanpa mengubah perilaku fitur (misal: `refactor(navbar): migrate utensils to custom icon`)
  - `chore`: Pemeliharaan dependensi atau konfigurasi CI/CD.

### 4.2 Prosedur Pull Request (PR)
1. Fork repositori dan buat branch fitur baru dari branch `main`:
   ```bash
   git checkout -b feat/nama-fitur-baru
   ```
2. Lakukan perubahan kode dan pastikan `npx tsc --noEmit` lolos bersih.
3. Commit dan push branch Anda ke remote repository:
   ```bash
   git push origin feat/nama-fitur-baru
   ```
4. Buka Pull Request di GitHub dengan rincian pengujian yang jelas dan tangkapan layar antarmuka.
