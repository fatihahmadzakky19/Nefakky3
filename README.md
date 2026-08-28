# 🍲 Nefakky Artisanal Culinary Marketplace — Monorepo Workspace

Selamat datang di repositori utama **Nefakky Artisanal Culinary Marketplace & Enterprise Operations Platform**.

Workspace ini terdiri dari dua repositori inti:
1. 🌐 **`nefakky3/`** — Aplikasi Antarmuka Pengguna & Admin Command Center (Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Leaflet, Sonner, Zustand, React Query).
2. ⚙️ **`Laravel/`** — Backend RESTful API & Realtime WebSockets Server (Laravel 12, PHP 8.2, Sanctum Auth, Laravel Reverb, FastExcel, DomPDF, Midtrans Gateway, SQLite/MySQL).

---

## 📚 Indeks Dokumentasi Lengkap Proyek

Seluruh dokumentasi komprehensif, spesifikasi desain, arsitektur, API, basis data, dan panduan kontribusi tersedia di folder `nefakky3/` dan dapat diakses melalui tautan berikut:

* 🏗️ **[ARCHITECTURE.md](nefakky3/docs/ARCHITECTURE.md)** — Arsitektur sistem menyeluruh, komponen Next.js 14, Laravel 12, Reverb, dan integrasi pihak ketiga.
* 📡 **[API.md](nefakky3/docs/API.md)** — Spesifikasi lengkap seluruh 97 endpoint REST API Laravel 12, request body, query params, response format, dan Sanctum Auth.
* 🗄️ **[DATABASE.md](nefakky3/docs/DATABASE.md)** — Skema basis data, ERD (Entity Relationship Diagram), tabel, tipe data, indeks, relasi Eloquent, dan mutator.
* 🔄 **[WORKFLOW.md](nefakky3/docs/WORKFLOW.md)** — Alur kerja bisnis (Order Lifecycle 5-Tahap, Payment Webhook, Auto-Restock saat Cancel, dan Reporting).
* 💻 **[INSTALLATION.md](nefakky3/docs/INSTALLATION.md)** — Panduan instalasi dan setup lingkungan lokal langkah-demi-langkah (Laravel 12, Next.js 14, Reverb, Composer, NPM).
* 🎨 **[DESIGN.md](nefakky3/docs/DESIGN.md)** — Master design system Google Stitch Artisanal Luxury, palet warna, tipografi, grid, dan ikonografi.
* 🛒 **[DESIGN_USER.md](nefakky3/docs/DESIGN_USER.md)** — Spesifikasi UI/UX antarmuka belanja pelanggan (Beranda, Menu, Cart, Tracking, Comments, Profile).
* 🏢 **[DESIGN_ADMIN.md](nefakky3/docs/DESIGN_ADMIN.md)** — Spesifikasi UI/UX Enterprise Admin Command Center (KPI Dashboard, Kitchen Desk, POS Logger, Settings).
* 📋 **[PRD.md](nefakky3/docs/PRD.md)** — Product Requirement Document, visi bisnis, spesifikasi fungsional, dan non-fungsional.
* 🧪 **[TEST_REPORT.md](nefakky3/docs/TEST_REPORT.md)** — Laporan hasil pengujian otomatis (*Automated Test Suite*) frontend & backend (100% Passed).
* 📜 **[CHANGELOG.md](nefakky3/docs/CHANGELOG.md)** — Catatan riwayat perubahan versi dan pembaruan fitur aplikasi dari waktu ke waktu.
* 🤝 **[CONTRIBUTING.md](nefakky3/docs/CONTRIBUTING.md)** — Panduan kontribusi, standard code style PSR-12, TypeScript strict guidelines, dan Git flow.

---

## ⚡ Panduan Cepat Menjalankan Proyek

### 1. Menjalankan Backend Laravel 12 API
```bash
cd f:\UKK\Laravel
composer install
php artisan migrate --seed
php artisan serve --port=8000
```

### 2. Menjalankan WebSocket Server (Laravel Reverb)
```bash
cd f:\UKK\Laravel
php artisan reverb:start
```

### 3. Menjalankan Frontend Next.js 14
```bash
cd f:\UKK\nefakky3
npm install
npm run dev
```

Buka peramban di: **http://localhost:3000**
