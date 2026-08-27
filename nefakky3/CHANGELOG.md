# Catatan Riwayat Perubahan (CHANGELOG.md) — Nefakky Marketplace

Semua pembaruan penting, penambahan fitur, perbaikan bug, dan peningkatan desain pada proyek **Nefakky Artisanal Culinary Marketplace** didokumentasikan dalam berkas ini.

Format pencatatan mengacu pada standar [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan mengikuti kaidah [Semantic Versioning](https://semver.org/).

---

## [3.6.0] — 2026-08-27 (Enterprise Modernization & Code Refactor)

### 🚀 Ditambahkan (Added)
* **Pustaka Frontend Modern**:
  * `@tanstack/react-query` untuk caching cerdas dan auto-revalidasi data API.
  * `zustand` untuk state management keranjang belanja yang cepat dan ringan.
  * `framer-motion` untuk transisi halaman dan efek mikro-animasi.
  * `embla-carousel-react` untuk slider banner responsif.
  * `react-hook-form` + `zod` + `@hookform/resolvers` untuk validasi formulir checkout type-safe.
  * `sonner` untuk notifikasi toast global yang elegan.
  * `canvas-confetti` untuk animasi perayaan saat pesanan sukses.
  * `leaflet` + `react-leaflet` untuk visualisasi peta geografis rute kurir pengantaran.
* **Pustaka Backend Laravel 12**:
  * `barryvdh/laravel-dompdf` untuk cetak struk nota dan invoice resmi PDF (`/api/orders/{id}/invoice-pdf`).
  * `rap2hpoutre/fast-excel` untuk ekspor laporan omset dan keuangan ke Excel Spreadsheet (`/api/reports/sales/export-excel`).
  * `spatie/laravel-activitylog` untuk audit trail riwayat aksi admin.
  * `spatie/laravel-query-builder` untuk filter dan sorting dinamis pada endpoint API.
  * `dedoc/scramble` untuk dokumentasi interaktif OpenAPI otomatis (`/docs/api`).
* **Dokumentasi Terpadu**: Pembuatan dokumen arsitektur komprehensif (`ARCHITECTURE.md`, `API.md`, `DATABASE.md`, `WORKFLOW.md`, `INSTALLATION.md`, `CHANGELOG.md`, `CONTRIBUTING.md`).

### 🛠️ Diperbaiki (Fixed)
* **Komentar Kode Baris per Baris**: Menambahkan penjelasan dan komentar fungsi yang sangat detail, profesional, dan berbahasa Indonesia pada seluruh barisan logika kode di kedua folder (`Laravel` dan `nefakky3`).
* **Harmonisasi Navigasi & Layout**: Mengganti seluruh `<header>` ad-hoc di halaman `menu`, `comments`, `notifications`, `profile`, dan `cart` dengan komponen `<Navbar />` dan `<Footer />` terpadu.
* **Pembersihan Ikon**: Menghapus import ikon duplikat/alias (`BagIcon`), menghapus icon ambigu, dan menstandarisasi icon semantik dari `lucide-react`.
* **Perbaikan Penutup Tag Modal**: Memperbaiki tag penutup modal dialog (`showDeliveryMapModal`, `showAddressModal`, `showSandboxModal`) yang sempat terpotong.
* **TypeScript Strict Compliance**: 100% lulus uji kompilasi tipe data (`0 error` pada `npx tsc --noEmit`).

---

## [3.5.0] — 2026-08-25 (Midtrans Sandbox & OpenStreetMap Dual Engine)

### 🚀 Ditambahkan (Added)
* Integrasi **Midtrans Snap Core API & Simulator Sandbox** dengan nomor VA riil dan deteksi otomatis pelunasan via background polling.
* Mesin peta ganda **OpenStreetMap (Dual-Engine)** dengan kalkulasi jarak matematis *Haversine Formula*.
* Layanan waktu resmi server **Realtime Calendar & Time API (WIB)**.
* Modul **3-Way Photo Studio Picker** pada halaman profil (Galeri, Kamera Langsung/Webcam, Google SSO Avatar).

---

## [3.0.0] — 2026-08-20 (Google Stitch Artisanal Luxury UI Overhaul)

### 🚀 Ditambahkan (Added)
* Redesain antarmuka menyeluruh mengadopsi filosofi *Google Stitch Artisanal Luxury* (Palet warna Deep Espresso `#25160E`, Warm Terracotta `#934B19`, dan Warm Cream `#FAF8F5`).
* Hero showcase slider dinamis dengan ulasan pelanggan dan rating bintang.
* Modal interaktif detail menu dengan pemilihan varian 3-jus tanpa reload halaman.
* Dispatcher alur pesanan dapur 5-tahap di panel Admin Command Center.

---

## [2.0.0] — 2026-08-10 (Dual Database & Realtime Sync)

### 🚀 Ditambahkan (Added)
* Integrasi basis data ganda Firebase Cloud Firestore dan Firebase Realtime Database.
* Autentikasi Google OAuth 2.0 (SSO) dan Email/Password.
* Riwayat pesanan realtime dan filter status pesanan.

---

## [1.0.0] — 2026-08-01 (Initial Release)

### 🚀 Ditambahkan (Added)
* Peluncuran perdana aplikasi web katalog menu kuliner UMKM masakan Nusantara.
* Keranjang belanja sederhana dan form checkout pemesanan.
