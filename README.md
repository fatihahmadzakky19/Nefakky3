# 🍲 Nefakky — Artisanal Culinary Marketplace & Enterprise Operations Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5_Strict-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Custom Icons](https://img.shields.io/badge/Anti--AI--Slop-33_Bespoke_Icons-FF5400?style=for-the-badge)](nefakky3/src/components/icons/CustomIcons.tsx)
[![Laravel 12](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com/)
[![Laravel Reverb](https://img.shields.io/badge/Laravel_Reverb-WebSockets_Active-FF2D20?style=for-the-badge)](https://laravel.com/docs/reverb)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFA611?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Midtrans](https://img.shields.io/badge/Midtrans-Snap_Sandbox-004B99?style=for-the-badge)](https://midtrans.com/)
[![Test Suite](https://img.shields.io/badge/Test_Suite-100%25_Passed_(0_Errors)-success?style=for-the-badge)](nefakky3/docs/TEST_REPORT.md)

---

## 🏷️ 1. Profil & Identitas Resto

* **Nama Brand**: **Nefakky** (*Nefakky Artisanal Culinary Marketplace & Kitchen Operations*)
* **Tagline**: *"Cita Rasa Warisan Kuliner Nusantara Otentik Tanpa Komisi Pihak Ketiga"*
* **Dapur Pusat (Central Kitchen)**: Jl. Raya Bojong Gede No. 45, Kabupaten Bogor, Jawa Barat 16922 (Koordinat: `-6.2088, 106.8456`)
* **Jam Operasional**: Setiap Hari (08.00 — 22.00 WIB)
* **Kategori Sajian**: Hidangan Tradisional Nusantara (Ayam Bakar Madu Rempah, Nasi Bakar Rempah, Bebek Betutu, Jus Tropis Alami).

---

## 📝 2. Deskripsi Platform

**Nefakky** adalah platform direct-to-consumer (D2C) marketplace kuliner dan sistem point-of-sale (POS) dapur restoran terpadu yang dirancang untuk memberikan transparansi penuh kepada pelanggan dan akuntabilitas tinggi bagi operasional restoran.

Platform ini menolak secara tegas estetika template generic buatan AI (*Anti-AI-Slop*) dengan mengimplementasikan **33 ikon vektor kustom buatan manusia** berbasis CSS mask, dipadukan dengan tipografi editorial Google Fonts Outfit.

### 🌟 Fitur Utama Platform:
1. **Arsitektur Ikon Kustom Anti-AI-Slop (33 Ikon)**: Menggantikan seluruh emoji 3D kartun dan ikon template generic dengan 33 ikon vektor presisi buatan tangan di [CustomIcons.tsx](file:///f:/UKK/nefakky3/src/components/icons/CustomIcons.tsx).
2. **Kalkulasi Jarak & Ongkir Haversine**: Menggunakan koordinat lintang/bujur riil dari OpenStreetMap Nominatim atau Google Maps untuk menghitung ongkos kirim bertingkat secara transparan.
3. **Pelacak Pesanan 5-Tahap Realtime**: Telemetri dapur sekuensial (`RECEIVED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `DELIVERING` $\rightarrow$ `DELIVERED` / `COMPLETED`) dengan dukungan mode lonjakan pesanan (*High Demand Surge*).
4. **Bukti Serah Terima Kurir via Kamera Langsung (Live Camera Snapshot POD)**: Mengakses perangkat kamera langsung melalui WebRTC untuk mengambil foto kurir saat menyerahkan makanan atau menerima uang COD.
5. **Pembayaran Ganda Terintegrasi**: Pembayaran digital instan via Midtrans Snap (QRIS, GoPay, ShopeePay, Virtual Account Bank) dan pembayaran tunai Cash on Delivery (COD).
6. **Enterprise Admin Command Studio**: Dashboard analitik omset kotor, estimasi laba bersih 40%, cetak struk kasir thermal 58mm/80mm, sensor tutup buku tahunan, serta ekspor laporan resmi **Excel (.xlsx)** & **PDF**.

---

## 🏗️ 3. Struktur Direktori Repositori

```
f:\UKK\
├── nefakky3/                  # Frontend Next.js 14 App Router (Aplikasi Utama)
│   ├── docs/                  # Dokumentasi Teknis Lengkap (PRD, Design, Arsitektur, API, DB)
│   ├── public/icons/          # 33 Aset Ikon Kustom Anti-AI-Slop (PNG Transparan 512x512)
│   ├── scripts/               # Script Otomasi (gen_icons.py)
│   └── src/
│       ├── app/               # App Router Halaman Publik, Autentikasi, & Admin Command Studio
│       ├── components/        # Komponen UI (Navbar, Modal, Tracker, LiveCameraModal, dll.)
│       │   └── icons/         # CustomIcons.tsx (Engine Mask Vektor 33 Ikon)
│       ├── context/           # Global Contexts (AuthContext, CartContext, DataContext)
│       ├── hooks/             # Custom Hooks (useRealtimeBroadcaster WebSocket)
│       └── lib/               # Layanan Klien (mapService, orderTimeUtils, annualArchive, dll.)
├── Laravel/                   # Backend REST API Laravel 12 & WebSocket Server Reverb
│   ├── app/                   # Controllers, Models, Events, & Requests
│   ├── database/              # Migrations, Factories, & Seeders
│   └── routes/                # Endpoint api.php & channels.php
└── backend_django/            # Modul Microservice Referensi Django 5
```

---

## ⚡ 4. Panduan Menjalankan Aplikasi

### Frontend (Next.js 14)
```bash
cd f:\UKK\nefakky3
npm install
python scripts/gen_icons.py
npx tsc --noEmit
npm run dev
```
Buka browser pada: **`http://localhost:3000`**

### Backend API (Laravel 12 — Opsional)
```bash
cd f:\UKK\Laravel
composer install
php artisan migrate:fresh --seed
php artisan serve --port=8000
php artisan reverb:start --port=8080
```

---

## 📚 5. Indeks Dokumentasi Teknis Terperinci

Seluruh dokumen teknis lengkap dapat diakses di dalam folder [`nefakky3/docs/`](nefakky3/docs/):
* 📋 **[PRD.md](nefakky3/docs/PRD.md)** — Product Requirement Document & Spesifikasi Fungsional.
* 🎨 **[DESIGN.md](nefakky3/docs/DESIGN.md)** — Master Design System & Arsitektur 33 Ikon Kustom.
* 🛒 **[DESIGN_USER.md](nefakky3/docs/DESIGN_USER.md)** — Spesifikasi Antarmuka Konsumen & Stepper Checkout.
* 🏢 **[DESIGN_ADMIN.md](nefakky3/docs/DESIGN_ADMIN.md)** — Spesifikasi Admin Command Studio & Kitchen Desk.
* 🏗️ **[ARCHITECTURE.md](nefakky3/docs/ARCHITECTURE.md)** — Arsitektur Sistem, Komponen, dan Aliran Data.
* 📡 **[API.md](nefakky3/docs/API.md)** — Referensi REST API, WebSocket Reverb, & Webhook Midtrans.
* 🗄️ **[DATABASE.md](nefakky3/docs/DATABASE.md)** — Skema Basis Data, ERD, dan Koleksi Firestore.
* 🔄 **[WORKFLOW.md](nefakky3/docs/WORKFLOW.md)** — Alur Kerja Bisnis, POS 5-Tahap, dan Tutup Buku.
* 💻 **[INSTALLATION.md](nefakky3/docs/INSTALLATION.md)** — Panduan Setup Lingkungan & Variabel Environment.
* 🧪 **[TEST_REPORT.md](nefakky3/docs/TEST_REPORT.md)** — Laporan Pengujian Otomatis & Manual (0 Errors).
* 📜 **[CHANGELOG.md](nefakky3/docs/CHANGELOG.md)** — Riwayat Perubahan Versi Lengkap.
* 🤝 **[CONTRIBUTING.md](nefakky3/docs/CONTRIBUTING.md)** — Standar Kontribusi & Panduan Penambahan Ikon Baru.
