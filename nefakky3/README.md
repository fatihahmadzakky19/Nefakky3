# 🍲 Nefakky — Artisanal Culinary Marketplace & Enterprise Operations Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com/)
[![Laravel Reverb](https://img.shields.io/badge/Laravel_Reverb-WebSockets_Active-FF2D20?style=for-the-badge)](https://laravel.com/docs/reverb)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?style=for-the-badge&logo=leaflet)](https://leafletjs.com/)
[![Midtrans](https://img.shields.io/badge/Midtrans-Snap_Sandbox-004B99?style=for-the-badge)](https://midtrans.com/)
[![Test Suite](https://img.shields.io/badge/Test_Suite-8%2F8_Passed-success?style=for-the-badge)](docs/TEST_REPORT.md)

---

## 📖 Ringkasan Eksekutif & Gambaran Umum

**Nefakky** adalah platform *artisanal e-commerce* dan marketplace kuliner terpadu yang dirancang untuk menghadirkan pengalaman belanja masakan tradisional khas Nusantara secara cepat, interaktif, transparan, dan aman.

Aplikasi ini menggabungkan frontend modern berbasis **Next.js 14 App Router** dengan **Google Stitch AI UI System**, backend layanan RESTful API **Laravel 12 (PHP 8.2)**, integrasi komunikasi WebSocket dua arah via **Laravel Reverb & Pusher**, integrasi gerbang pembayaran **Midtrans Snap SDK & Sandbox Simulator**, pemetaan rute pengiriman interaktif **Leaflet & OpenStreetMap (Dual-Engine)**, sistem validasi form type-safe (**React Hook Form + Zod**), state management ultra-ringan (**Zustand**), toast notification modern (**Sonner**), serta modul **Enterprise Admin Command Center** dengan kemampuan ekspor laporan resmi **Microsoft Excel (.xlsx via FastExcel)** dan **PDF (DomPDF)**.

---

## 📚 Indeks Dokumentasi Lengkap Proyek (`/docs`)

Seluruh dokumen teknis, spesifikasi, dan panduan proyek tersimpan rapi di dalam folder [`docs/`](docs/):

| Dokumen | Deskripsi & Cakupan |
| :--- | :--- |
| 🏗️ **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Arsitektur sistem menyeluruh, komponen frontend, backend Laravel 12, Reverb, dan integrasi pihak ketiga. |
| 📡 **[API.md](docs/API.md)** | Spesifikasi lengkap seluruh 97 endpoint REST API Laravel 12, request body, query params, response JSON, dan Sanctum Auth. |
| 🗄️ **[DATABASE.md](docs/DATABASE.md)** | Skema basis data, ERD (Entity Relationship Diagram), tabel, tipe data, indeks, relasi Eloquent, dan mutator. |
| 🔄 **[WORKFLOW.md](docs/WORKFLOW.md)** | Alur kerja bisnis (Order Lifecycle 5-Tahap, Payment Webhook, Auto-Restock saat Cancel, dan Reporting). |
| 💻 **[INSTALLATION.md](docs/INSTALLATION.md)** | Panduan instalasi dan menjalankan lingkungan lokal (Laravel 12, Next.js 14, Reverb, Composer, NPM). |
| 🎨 **[DESIGN.md](docs/DESIGN.md)** | Master design system Google Stitch Artisanal Luxury, palet warna, tipografi, grid, dan ikonografi. |
| 🛒 **[DESIGN_USER.md](docs/DESIGN_USER.md)** | Spesifikasi UI/UX antarmuka belanja pelanggan (Beranda, Menu, Cart, Tracking, Comments, Profile). |
| 🏢 **[DESIGN_ADMIN.md](docs/DESIGN_ADMIN.md)** | Spesifikasi UI/UX Enterprise Admin Command Center (KPI Dashboard, Kitchen Desk, POS Logger, Settings). |
| 📋 **[PRD.md](docs/PRD.md)** | Product Requirement Document, visi bisnis, spesifikasi fungsional, dan non-fungsional. |
| 🧪 **[TEST_REPORT.md](docs/TEST_REPORT.md)** | Laporan hasil pengujian otomatis (*Automated Test Suite*) frontend & backend (100% Passed). |
| 📜 **[CHANGELOG.md](docs/CHANGELOG.md)** | Catatan riwayat perubahan versi dan pembaruan fitur aplikasi dari waktu ke waktu. |
| 🤝 **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** | Panduan kontribusi, standard code style PSR-12, TypeScript strict guidelines, dan Git flow. |

---

## 🚀 Fitur Utama

### 🛒 1. Modul Pelanggan (Customer Facing)
* **Hero Showcase Carousel**: Slider hidangan nusantara otentik dengan ulasan pelanggan dan navigasi instan.
* **Katalog Menu & Live Search**: Filter kategori (*Makanan Berat*, *Minuman*, *Menu Hemat*), live search, dan sorting dinamis.
* **Modal Varian Rasa & Nutrisi**: Informasi kalori, protein, lemak, level kepedasan, dan pilihan 3 varian rasa jus.
* **Checkout 4-Tahap & Midtrans Snap**: Pembayaran instan via Virtual Account (BCA/BNI/Mandiri/BRI), QRIS, Kartu Kredit, atau Cash on Delivery (COD).
* **Live GPS Tracking (OpenStreetMap)**: Visualisasi rute kurir bergerak dari Dapur Pusat (*Bojong Gede, Bogor*) ke lokasi pembeli dengan kalkulator jarak Haversine.
* **Cetak Struk Resmi (Invoice PDF)**: Unduh nota transaksi dan struk digital resmi siap cetak.
* **Ulasan Rasa & Komunitas**: Form ulasan dengan rating bintang interaktif, lampiran foto, dan balasan resmi admin resto.
* **3-Way Avatar Studio**: Pemilihan foto profil via galeri file, live webcam capture, atau sinkronisasi Google SSO.

### 🏢 2. Modul Admin Command Center (`/admin`)
* **Executive Dark Header**: Jam kalender digital realtime WIB berdetak tanpa lag dan indikator telemetri server.
* **Dashboard KPI & Analitik**: Omset kotor, estimasi laba bersih 40%, volume pesanan, AOV, dan skor CSAT.
* **Interactive SVG Sales Chart**: Grafik batang omset bulanan dinamis dan modal edit data pembukuan.
* **Kitchen Order Dispatcher 5-Tahap**: Kontrol status dapur 1-klik (`RECEIVED` $\rightarrow$ `COOKING` $\rightarrow$ `READY` $\rightarrow$ `DELIVERING` $\rightarrow$ `COMPLETED`) dengan broadcast WebSocket otomatis.
* **POS Logger (Bazar Offline)**: Pencatatan cepat omset bazar kuliner offline dengan tagging menu terlaris.
* **Reporting Engine**: Ekspor laporan keuangan ke format Microsoft Excel (.xlsx via FastExcel) dan cetak PDF (DomPDF).
* **Live Support Desk Chat**: Obrolan dua arah langsung antara admin dapur dan pelanggan via WebSockets.

---

## 💻 Panduan Cepat Menjalankan Aplikasi

### 1. Prasyarat Sistem
* **PHP**: Versi `>= 8.2` dengan ekstensi `pdo_sqlite`, `pdo_mysql`, `gd` / `imagick`, `mbstring`, `fileinfo`.
* **Composer**: Versi `>= 2.7`
* **Node.js**: Versi `>= 18.18` atau `>= 20.x`
* **NPM**: Versi `>= 10.x`

### 2. Menjalankan Backend Laravel 12 API
```bash
cd f:\UKK\Laravel
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```

### 3. Menjalankan Server WebSocket Laravel Reverb (Opsional untuk Realtime)
```bash
cd f:\UKK\Laravel
php artisan reverb:start
```

### 4. Menjalankan Frontend Next.js 14
```bash
cd f:\UKK\nefakky3
npm install
npm run dev
```
Buka browser di: **http://localhost:3000**

---

## 🧪 Pengujian Otomatis (Automated Tests)

* **Pengujian Frontend (`nefakky3`)**:
  ```bash
  npm test
  # Menjalankan 8 automated integration & flow tests (100% Passed)
  ```
* **Type-Check TypeScript (`nefakky3`)**:
  ```bash
  npx tsc --noEmit
  # 0 Error (100% Type-Safe)
  ```
* **Pengujian Backend (`Laravel`)**:
  ```bash
  php artisan test
  # Menjalankan PHPUnit feature & unit tests
  ```

---

## ⚖️ Lisensi & Hak Cipta

Seluruh hak cipta dilindungi undang-undang.  
Dibuat dengan ❤️ oleh **Fatih Ahmad Zakky** untuk **Nefakky Artisanal Culinary Marketplace**.
