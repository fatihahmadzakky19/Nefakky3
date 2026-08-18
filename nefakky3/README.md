# 🍲 Nefakky — Artisanal Food & Culinary Marketplace

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com/)
[![Storybook](https://img.shields.io/badge/Storybook-10.5.7-FF4785?style=for-the-badge&logo=storybook)](https://storybook.js.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.12.0-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Midtrans](https://img.shields.io/badge/Midtrans-Snap_API-004B99?style=for-the-badge)](https://midtrans.com/)

**Nefakky** adalah platform *artisanal e-commerce* dan marketplace kuliner premium berbasis web modern yang dirancang untuk menghadirkan pengalaman belanja makanan tradisional khas Nusantara yang cepat, intuitif, dan aman. Platform ini dibangun dengan arsitektur modern berstandar enterprise: frontend **Next.js 14 App Router** dengan **Google Stitch AI UI System**, backend REST API **Laravel 12**, arsitektur database ganda (**Firebase Cloud Firestore DB** & **Firebase Realtime Database `asia-southeast1`**), integrasi gerbang pembayaran **Midtrans Snap API**, sistem pemetaan lokasi GPS (**Auto Map Picker Modal** & Algoritma Jarak Haversine), penangkapan foto kamera langsung (**Live Camera Capture System**), pengujian komponen UI terisolasi (**Storybook 10 Suite**), serta **Enterprise Admin Command Center** dengan modul ekspor laporan resmi Microsoft Excel (.xls) dan PDF.

---

## 📑 Daftar Isi

- [✨ Fitur Utama](#-fitur-utama)
  - [1. Modul Pelanggan (Customer Facing)](#1-modul-pelanggan-customer-facing)
  - [2. Modul Administrator (Enterprise Command Center)](#2-modul-administrator-enterprise-command-center)
- [🛠️ Arsitektur Teknologi](#️-arsitektur-teknologi)
- [📂 Struktur Direktori Proyek](#-struktur-direktori-proyek)
- [🚀 Panduan Instalasi & Menjalankan Aplikasi](#-panduan-instalasi--menjalankan-aplikasi)
  - [Prasyarat Sistem](#prasyarat-sistem)
  - [1. Menjalankan Backend Laravel](#1-menjalankan-backend-laravel)
  - [2. Menjalankan Frontend Next.js](#2-menjalankan-frontend-nextjs)
- [🌐 Daftar Endpoint API Laravel](#-daftar-endpoint-api-laravel)
- [🧪 Pengujian Otomatis & Storybook](#-pengujian-otomatis--storybook)
- [🔑 Konfigurasi Environment Variables](#-konfigurasi-environment-variables)
- [📍 Alamat Produksi Resmi](#-alamat-produksi-resmi)
- [📄 Lisensi & Hak Cipta](#-lisensi--hak-cipta)

---

## ✨ Fitur Utama

### 1. Modul Pelanggan (Customer Facing)
* 🔐 **Autentikasi Aman & Google SSO**: Login/Registrasi Email & Password serta Google OAuth 2.0 dengan penanganan pesan error interaktif Bahasa Indonesia dan sinkronisasi sesi lintas tab.
* 🍱 **Katalog Menu 3 Kategori & Varian 3-Jus (1 Halaman)**:
  - 3 Kategori bersih: *Makanan Berat*, *Minuman*, dan *Menu Hemat*.
  - Khusus minuman jus (`m6`), pelanggan dapat beralih ke 3 varian rasa (*Mangga Aromanis, Sirsak Madu, Jambu Merah*) langsung dalam 1 halaman/modal dengan galeri gambar dinamis.
  - Informasi rincian bahan, asal hidangan, estimasi porsi, dan nilai gizi/kalori.
* 📍 **Auto Map Picker & Penentuan Lokasi GPS**: Pemilihan alamat presisi via modal peta interaktif (`AutoMapPickerModal`) atau preset area populer Jabodetabek dengan kalkulasi jarak otomatis Haversine dari Dapur Pusat.
* 📷 **Live Camera Capture System**: Mengambil foto ulasan kuliner atau foto profil secara langsung via kamera peramban (`LiveCameraModal`) dengan toggle lensa depan/belakang dan fallback unggah file.
* 🛒 **Alur Checkout Multi-Step 4-Tahap**: Proses transaksi terstruktur (`1. Keranjang` $\rightarrow$ `2. Checkout & Alamat GPS` $\rightarrow$ `3. Pembayaran Midtrans Snap` $\rightarrow$ `4. Selesai`).
* 🚚 **Formula Ongkir Transparan**: Biaya kirim 15% subtotal untuk jarak $\le 3$ km + Rp 1.500 per 2 km untuk jarak $> 3$ km (tanpa biaya layanan tambahan).
* 💳 **Pembayaran Digital Midtrans Snap**: Integrasi modal pembayaran Midtrans (QRIS, GoPay, ShopeePay, Bank Transfer BCA/Mandiri/BNI Virtual Account, Credit Card 3D Secure) dan panduan simulator sandbox.
* 📦 **Pelacakan 5-Tahap Real-Time & Firebase RTDB Sync**: Visualisasi status pengiriman bergerak live (`RECEIVED` $\rightarrow$ `COOKING` $\rightarrow$ `READY` $\rightarrow$ `SHIPPING` $\rightarrow$ `COMPLETED`), hitung mundur waktu tiba, tab navigasi multi-order, dan tombol konfirmasi terima barang.
* 🔔 **Floating Real-time Order Tracker Widget**: Mini-widget mengambang di seluruh halaman web saat ada pesanan aktif.
* 📜 **Riwayat Pemesanan & Cetak Struk PDF**: Riwayat transaksi permanen di Firestore dan modal cetak **Struk Pembayaran Resmi (PDF)** via `window.print()`.
* 💬 **Live CS Chat Desk**: Panel percakapan interaktif real-time antara pelanggan di `/profile` dengan pengelola toko di `/admin`.
* ⭐ **Rating & Ulasan Komunitas**: Penilaian ulasan bintang 1-5, bukti foto hidangan, balasan admin, dan sistem ulasan kontekstual hidangan khas Indonesia (`reviews.ts`).

### 2. Modul Administrator (Enterprise Command Center)
* 📊 **Executive Dashboard & 5 Metrik KPI**: Ringkasan Total Omset Kotor, Estimasi Margin Laba Bersih (40%), Total Pesanan Selesai, Average Order Value (AOV), dan Rating Kepuasan Pelanggan.
* 📈 **Interactive Sales Chart & Custom Editor**: Grafik omset bulanan SVG interaktif dimulai dari Juni 2026 (Event Bazar >10 Juta) dengan fitur **Edit Data Grafik Modal** untuk mengubah nominal omset, laba, status bazar, dan badge catatan per bulan.
* 📥 **Export Engine Terpadu (`exportUtils.ts`)**: Ekspor data laporan bisnis lengkap ke Microsoft Excel (.xls) berformat styling resmi, CSV, dan format cetak PDF.
* 📝 **Modal Input Omset Manual (Offline/Bazar POS Logger)**: Pencatatan cepat penjualan off-grid/event bazar dengan multi-select pill checkboxes untuk menu paling laris (*Best Seller*) dan kurang laris.
* 🍳 **Kitchen Order Management**: Kontrol status pengerjaan dapur 5-tahap secara 1-klik yang otomatis terdorong ke Firebase RTDB dan Laravel API, kontrol status bayar (`PAID`, `UNPAID`, `REFUNDED`), serta pencarian & filter pesanan.
* 📦 **Manajemen Katalog Produk (CRUD)**: Tambah item, sunting harga, atur diskon persentase, persediaan stok live, kategori, dan foto utama.
* 🎟️ **Generator Voucher Promo & Auto-Expiry**: Pembuatan kupon diskon persentase dengan batasan *Minimum Spend*, kuota penggunaan, dan sistem penonaktifan otomatis jika kuota habis.
* ⭐ **Moderasi Ulasan Pelanggan**: Sematkan ulasan unggulan (*Pin Review*), balas ulasan pembeli, dan hapus/sembunyikan ulasan tidak pantas.
* ⚙️ **Pengaturan Toko & Keamanan**: Konfigurasi profil admin, jam operasional dapur, WhatsApp darurat, dan koordinat alamat produksi resmi.

---

## 🛠️ Arsitektur Teknologi

| Layer | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14.2.3 (App Router)** | Server & Client Components, Dynamic Routing, Fast Refresh |
| **UI Library & Styling** | **React 18.3.1 & Tailwind CSS 3.4.3** | Google Stitch Palette, Glassmorphism, Responsive Grid |
| **Type Safety** | **TypeScript 5.4.5 (Strict Mode)** | 100% Type Checked (`npx tsc --noEmit`) |
| **Icons & Media** | **Lucide React Icons** | Iconography modern, ringan, dan konsisten |
| **UI Testing Suite** | **Storybook 10.5.7 & Vitest** | Pengujian komponen UI terisolasi, addon a11y, docs |
| **Backend REST API** | **Laravel 12 (PHP 8.2+)** | Controllers, Eloquent ORM, Seeders, API Routes |
| **Database Persistent** | **Firebase Cloud Firestore** | NoSQL Document DB untuk data produk, pesanan, ulasan |
| **Database Real-time** | **Firebase Realtime Database (RTDB)** | Low-latency state sync (`asia-southeast1`) untuk live order & chat |
| **Payment Gateway** | **Midtrans Snap API** | Integrasi gateway pembayaran sandbox & QRIS |
| **Maps & Geocoding** | **OpenStreetMap Nominatim API** | Reverse geocoding & Algoritma Jarak Haversine |

---

## 📂 Struktur Direktori Proyek

```
UKK/
├── Laravel/                          # Backend API Engine (Laravel 12)
│   ├── app/
│   │   ├── Http/Controllers/Api/     # REST API Controllers (Product, Order, Voucher, Review, SalesReport, Midtrans, Haversine)
│   │   └── Models/                   # Eloquent Models (ProductItem, Voucher, Order, OrderItem, Review, SalesReport, User)
│   ├── database/
│   │   ├── migrations/               # Database Migrations Schema
│   │   └── seeders/                  # Master Data Seeders
│   └── routes/
│       └── api.php                   # API Endpoints Definition
└── nefakky3/                         # Frontend Application (Next.js 14 App Router)
    ├── .storybook/                   # Storybook 10 Configuration
    ├── scripts/
    │   └── run-tests.mjs             # Automated Test Runner Suite
    ├── src/
    │   ├── app/                      # Next.js App Router Pages
    │   │   ├── page.tsx              # Beranda & Hero Section
    │   │   ├── menu/                 # Katalog Menu & Detail Varian
    │   │   ├── cart/                 # Multi-step 4-Tahap Checkout
    │   │   ├── notifications/        # Live 5-Tahap Order Tracking (RTDB)
    │   │   ├── profile/              # Profil Pengguna, Riwayat & CS Chat
    │   │   ├── comments/             # Komunitas Ulasan & Testimoni
    │   │   └── admin/                # Enterprise Command Center (/admin)
    │   ├── components/               # Reusable UI & Modal Components
    │   ├── context/                  # Global React State Providers (Auth, Cart, Data)
    │   └── lib/                      # Helper Utilities & API Clients (exportUtils, firebase, laravelApi, reviews)
    ├── DESIGN.md                     # Master Design System Index
    ├── DESIGN_USER.md                # UI/UX Guideline Aplikasi Pelanggan
    ├── DESIGN_ADMIN.md               # UI/UX Guideline Admin Command Center
    ├── PRD.md                        # Product Requirement Document
    ├── README.md                     # Dokumentasi Utama Proyek
    └── TEST_REPORT.md                # Laporan Hasil Pengujian Otomatis
```

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### Prasyarat Sistem
* **Node.js**: Versi $\ge$ 18.17.0 (disarankan Node.js v20+)
* **PHP**: Versi $\ge$ 8.2
* **Composer**: Versi $\ge$ 2.x
* **NPM**: Versi $\ge$ 9.x

---

### 1. Menjalankan Backend Laravel

1. Masuk ke direktori `Laravel`:
   ```bash
   cd Laravel
   ```

2. Pasang dependensi PHP melalui Composer:
   ```bash
   composer install
   ```

3. Salin berkas environment dan generate application key:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. Jalankan migrasi database beserta seeder data produk & voucher:
   ```bash
   php artisan migrate --seed
   ```

5. Jalankan development server API Laravel:
   ```bash
   php artisan serve --port=8000
   ```
   API akan aktif di `http://127.0.0.1:8000/api`.

---

### 2. Menjalankan Frontend Next.js

1. Masuk ke direktori `nefakky3`:
   ```bash
   cd nefakky3
   ```

2. Pasang paket dependensi Node:
   ```bash
   npm install
   ```

3. Jalankan server lokal Next.js:
   ```bash
   npm run dev
   ```
   Buka peramban di `http://localhost:3000`.

---

## 🌐 Daftar Endpoint API Laravel

| HTTP Method | Endpoint Path | Controller Action | Keterangan |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Inline Closure | Cek status kesehatan server API |
| `GET` | `/api/products` | `ProductController@index` | Daftar seluruh produk |
| `GET` | `/api/products/visible` | `ProductController@visible` | Daftar produk berstatus aktif |
| `POST` | `/api/products` | `ProductController@store` | Tambah produk baru (Admin) |
| `PUT` | `/api/products/{id}` | `ProductController@update` | Perbarui data produk |
| `DELETE` | `/api/products/{id}` | `ProductController@destroy` | Hapus produk |
| `GET` | `/api/orders` | `OrderController@index` | Daftar seluruh pesanan |
| `POST` | `/api/orders` | `OrderController@store` | Buat transaksi pesanan baru |
| `POST` | `/api/orders/{id}/advance_stage` | `OrderController@advanceStage` | Majukan status pengerjaan dapur 5-tahap |
| `POST` | `/api/vouchers/validate` | `VoucherController@validateVoucher` | Validasi kode kupon diskon promo |
| `GET` | `/api/vouchers` | `VoucherController@index` | Daftar voucher promo aktif |
| `POST` | `/api/vouchers` | `VoucherController@store` | Tambah voucher baru |
| `GET` | `/api/reviews` | `ReviewController@index` | Daftar ulasan pelanggan |
| `POST` | `/api/reviews` | `ReviewController@store` | Kirim ulasan hidangan baru |
| `GET` | `/api/reports/sales` | `SalesReportController@index` | Ringkasan statistik laporan omset |
| `POST` | `/api/reports/sales` | `SalesReportController@store` | Simpan data omset bulanan |
| `POST` | `/api/midtrans/token` | `MidtransController@token` | Generate token transaksi Midtrans Snap |
| `POST` | `/api/haversine/distance` | `HaversineController@calculateDistance` | Hitung jarak KM & ongkir dari dapur pusat |

---

## 🧪 Pengujian Otomatis & Storybook

### 1. Menjalankan Automated Test Suite
Aplikasi dilengkapi skrip pengujian otomatis 6 modul utama:

```bash
npm test
```

Skrip ini akan memeriksa:
1. **TypeScript Type Compiler** (`npx tsc --noEmit`) — Memastikan 0 error tipe data.
2. **Route & Component Integrity** — Memastikan seluruh rute, halaman, dan modal utama tersedia.
3. **Product Catalog Integrity** — Memastikan ketersediaan 6 produk default di DataContext.
4. **Indonesian Review Engine** — Memvalidasi generator ulasan rasa khas Indonesia.
5. **Cart & Promo Engine** — Memverifikasi kalkulasi keranjang dan aturan voucher diskon.
6. **Firebase Cloud Connection** — Memvalidasi inisialisasi modul Auth dan Firestore.

Hasil pengujian otomatis tercatat di berkas [`TEST_REPORT.md`](file:///f:/UKK/nefakky3/TEST_REPORT.md).

### 2. Menjalankan Storybook Suite
Untuk melihat dan menguji komponen UI secara terisolasi (`AutoMapPickerModal`, `MenuDetailModal`, `Navbar`, `RealtimeOrderTracker`):

```bash
npm run storybook
```
Buka peramban di `http://localhost:6006`.

---

## 🔑 Konfigurasi Environment Variables

Buat berkas `.env.local` pada direktori `nefakky3`:

```env
# Next.js App Port & Host
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend Laravel REST API URL
NEXT_PUBLIC_LARAVEL_API_URL=http://127.0.0.1:8000/api

# Firebase Cloud Web Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.asia-southeast1.firebasedatabase.app

# Midtrans Snap Payment Gateway Client Key (Sandbox)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-your_client_key
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
```

---

## 📍 Alamat Produksi Resmi

Seluruh menu hidangan kuliner Nefakky diproduksi secara otentik di dapur pusat:

> **Nefakky Artisanal Central Kitchen**  
> *Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Provinsi Jawa Barat, Indonesia*  
> Koordinat GPS: `-6.4912, 106.7942`  
> WhatsApp Hotline: `+62 812-8888-9999`

---

## 📄 Lisensi & Hak Cipta

© 2026 **Nefakky Artisanal Kitchen** (Fatih Ahmad Zakky). Hak Cipta Dilindungi Undang-Undang.
