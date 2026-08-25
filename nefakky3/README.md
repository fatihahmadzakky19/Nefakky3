# 🍲 Nefakky — Artisanal Culinary Marketplace & Enterprise Operations Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com/)
[![Firebase](https://img.shields.io/badge/Firebase-10.12.0-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-Dual_Engine_Active-7EBC6F?style=for-the-badge&logo=openstreetmap)](https://www.openstreetmap.org/)
[![Midtrans](https://img.shields.io/badge/Midtrans-Sandbox_Core_API-004B99?style=for-the-badge)](https://midtrans.com/)
[![Test Suite](https://img.shields.io/badge/Test_Suite-8%2F8_Passed-success?style=for-the-badge)](TEST_REPORT.md)

---

## 📖 Ringkasan Eksekutif & Gambaran Umum

**Nefakky** adalah platform *artisanal e-commerce* dan marketplace kuliner terpadu yang dirancang untuk menghadirkan pengalaman belanja masakan tradisional khas Nusantara secara cepat, interaktif, transparan, dan aman.

Aplikasi ini mengintegrasikan frontend modern berbasis **Next.js 14 App Router** dengan **Google Stitch AI UI System**, backend layanan RESTful API **Laravel 12**, arsitektur basis data ganda (**Firebase Cloud Firestore DB** & **Firebase Realtime Database `asia-southeast1`**), integrasi gerbang pembayaran **Midtrans Core API & Snap Sandbox Simulator**, sistem pemetaan rute pengiriman interaktif **OpenStreetMap (Dual-Engine)**, layanan kalender dan jam server-authoritative **Realtime Calendar & Time API (WIB)**, serta modul **Enterprise Admin Command Center** dengan kemampuan ekspor laporan resmi Microsoft Excel (.xls) dan PDF.

---

## 📑 Daftar Isi Lengkap

1. [Arsitektur Sistem & Diagram Alur](#1-arsitektur-sistem--diagram-alur)
2. [Fitur Lengkap Modul Pelanggan (Customer Facing)](#2-fitur-lengkap-modul-pelanggan-customer-facing)
3. [Fitur Lengkap Modul Administrator (Enterprise Command Center)](#3-fitur-lengkap-modul-administrator-enterprise-command-center)
4. [Spesifikasi Teknologi & Dependencies Matrix](#4-spesifikasi-teknologi--dependencies-matrix)
5. [Struktur Direktori Proyek](#5-struktur-direktori-proyek)
6. [Panduan Instalasi & Menjalankan Aplikasi](#6-panduan-instalasi--menjalankan-aplikasi)
7. [Integrasi & Panduan Pengujian Pembayaran Midtrans Sandbox](#7-integrasi--panduan-pengujian-pembayaran-midtrans-sandbox)
8. [Formula Matematis Kalkulasi Ongkos Kirim Berbasis Jarak](#8-formula-matematis-kalkulasi-ongkos-kirim-berbasis-jarak)
9. [Layanan Peta & Geolocation (OpenStreetMap Dual Mode)](#9-layanan-peta--geolocation-openstreetmap-dual-mode)
10. [Layanan Jam & Kalender Realtime (Realtime Calendar API)](#10-layanan-jam--kalender-realtime-realtime-calendar-api)
11. [Skema Basis Data & Sinkronisasi](#11-skema-basis-data--sinkronisasi)
12. [Pengujian Otomatis (Automated Test Suite)](#12-pengujian-otomatis-automated-test-suite)
13. [Konfigurasi Environment Variables](#13-konfigurasi-environment-variables)
14. [Informasi Produksi & Legalitas](#14-informasi-produksi--legalitas)

---

## 1. Arsitektur Sistem & Diagram Alur

### 1.1 Diagram Arsitektur Komponen

```mermaid
graph TD
    Client["Browser Klien (Next.js 14 App Router)"]
    
    subgraph Frontend_App ["Frontend Core Layer (src/)"]
        Contexts["State Contexts (Auth, Cart, Data)"]
        Components["Stitch UI Components & Admin Tabs"]
        APIRoutes["Next.js API Routes (/api/midtrans, /api/calendar)"]
    end

    subgraph External_Services ["Layanan Eksternal & API"]
        Midtrans["Midtrans Sandbox Core API & Simulator"]
        OSM["OpenStreetMap & Nominatim Geocoding Engine"]
        FirebaseFirestore["Firebase Cloud Firestore (Master Documents)"]
        FirebaseRTDB["Firebase Realtime Database (Live Sync)"]
    end

    subgraph Backend_Engine ["Backend Engine Layer"]
        Laravel["Laravel 12 API (PHP 8.2+ / Artisan)"]
        Sanctum["Laravel Sanctum Authentication"]
        Eloquent["Eloquent ORM & MySQL / Local Storage"]
    end

    Client --> Frontend_App
    Frontend_App --> Contexts
    Frontend_App --> APIRoutes
    APIRoutes --> Midtrans
    Frontend_App --> OSM
    Contexts --> FirebaseFirestore
    Contexts --> FirebaseRTDB
    Frontend_App --> Laravel
    Laravel --> Sanctum
    Laravel --> Eloquent
```

---

## 2. Fitur Lengkap Modul Pelanggan (Customer Facing)

### 2.1 Autentikasi Ganda & Manajemen Sesi
* **Email & Password**: Registrasi akun baru dengan validasi format email, kekuatan kata sandi, dan pesan galat berbahasa Indonesia.
* **Google OAuth 2.0 (SSO)**: Login instan 1-klik menggunakan akun Google dengan sinkronisasi otomatis avatar profil pengguna.
* **Manajemen Profil & 3-Way Photo Studio (`/profile`)**:
  1. *Unggah Berkas Galeri*: Memilih gambar foto profil dari penyimpanan lokal.
  2. *Live Webcam Capture*: Mengaktifkan kamera secara langsung melalui MediaStream API dan mengambil foto via canvas beresolusi tinggi.
  3. *Google SSO Avatar*: Memulihkan avatar resmi akun Google.

### 2.2 Katalog Menu 3 Kategori & Varian Rasa 3-Jus
* **3 Kategori Menu**:
  1. *Makanan Berat* (Ayam Bakar Madu Rempah, Nasi Bakar Cumi Pedas, Gudeg Komplit).
  2. *Menu Hemat* (Krecek Gurih Santan, Garang Asam Segar).
  3. *Minuman* (Jus Buah Alami Segar).
* **Varian 3-Jus dalam 1 Halaman**:
  - Pada produk jus (`m6`), pelanggan dapat beralih antara 3 varian rasa: **Mangga Aromanis**, **Sirsak Madu**, dan **Jambu Merah**.
  - Pergantian varian mengubah galeri foto, deskripsi, dan komposisi gizi secara instan tanpa perlu memuat ulang halaman.

### 2.3 Alur Checkout 4-Tahap & Pilihan Pembayaran (`/cart`)
1. **Tahap 1: Keranjang Belanja**:
   - Kontrol kuantitas bertahap (+/-), penghapusan item, dan kolom klaim kupon promo diskon.
2. **Tahap 2: Detail Alamat & Catatan**:
   - Pemilihan alamat tersimpan atau input alamat baru dengan pemilih peta GPS.
   - Pilihan chip label cepat (*Rumah*, *Kantor*, *Apartemen*).
   - Catatan instruksi pengantaran kurir dan catatan rasa ke dapur.
3. **Tahap 3: Pembayaran Midtrans Snap & COD**:
   - Pilihan *Virtual Account BCA, BNI, Mandiri, QRIS Instant, E-Wallet, Kartu Kredit*, atau *Cash on Delivery (COD)*.
   - Perhitungan otomatis ongkir bertingkat dan transparansi rincian harga.
   - Konsol simulasi Midtrans Sandbox dengan tombol salin kode VA dan tautan langsung ke *Midtrans Payment Simulator*.
   - Radar pengecekan status pelunasan otomatis (*background polling*) setiap 2.5 detik.
4. **Tahap 4: Konfirmasi Sukses & Struk Digital**:
   - Penomoran invoice resmi berformat `NFK-XXXXXX`.
   - Ringkasan pesanan dan tombol cetak nota PDF resmi (`window.print()`).

### 2.4 Pelacakan Pesanan & Rute OpenStreetMap (`/notifications`)
* **Peta Rute OpenStreetMap Interaktif**: Menampilkan titik dapur keberangkatan dan alamat pelanggan.
* **Mode Switcher**: Beralih antara tampilan peta geografis *OpenStreetMap* dan animasi ilustrasi kurir meluncur *Rute Dapur*.
* **Modal Peta Penuh**: Tampilan peta resolusi tinggi dengan informasi telemetri kurir, kecepatan estimasi, dan rute eksternal.
* **Konfirmasi Penerimaan Barang**: Tombol konfirmasi penerimaan yang seketika memperbarui status pesanan menjadi selesai.

---

## 3. Fitur Lengkap Modul Administrator (Enterprise Command Center)

### 3.1 Executive Dashboard & Metrik Finansial
* **5 Metrik Finansial Utama**: Total Omset Kotor, Estimasi Margin Laba Bersih (40%), Total Pesanan Berhasil, Average Order Value (AOV), dan Rating Kepuasan Pelanggan.
* **Grafik Penjualan Bulanan Interaktif SVG**:
  - Menampilkan tren omset dari Juni 2026 (Bazar >10 Juta) hingga Desember 2026.
  - Dilengkapi fitur **Modal Edit Data Grafik** untuk menyesuaikan data finansial per bulan secara mandiri.
* **Jam Kalender Realtime (WIB Clock)**:
  - Komponen jam digital berdetak pada header dashboard yang mendeteksi Hari, Tanggal, Bulan, Tahun, Jam, Menit, dan Detik secara server-authoritative.

### 3.2 Manajemen Pesanan Dapur (Kitchen Desk)
* Alur status pesanan 5-tahap: `DITERIMA` $\rightarrow$ `DIMASAK` $\rightarrow$ `MENUNGGU KURIR` $\rightarrow$ `DIANTAR` $\rightarrow$ `SELESAI`.
* Pembaruan status cepat 1-klik dengan notifikasi audit log.
* Verifikasi bukti foto pengantaran kurir dan bukti penerimaan uang tunai COD via WhatsApp.

### 3.3 Pencatatan Omset Manual (POS / Bazar Logger)
* Modul pencatatan penjualan offline/bazar dengan input nama event, tanggal, omset, dan multi-select pill checkboxes untuk menentukan menu paling laris (*Best Seller*) dan kurang laris.

### 3.4 Manajemen Katalog Menu & Promosi
* **CRUD Menu**: Menambah, menyunting harga, persentase diskon, kuota stok langsung, dan kategori menu.
* **Generator Voucher Diskon**: Pembuatan kode kupon promo dengan batasan *Minimum Spend*, kuota pemakaian, dan periode kedaluwarsa otomatis.

### 3.5 Export Engine Laporan Resmi (`exportUtils.ts`)
* **Ekspor Microsoft Excel (.xls)**: Menghasilkan berkas spreadsheet berstandar korporat lengkap dengan styling warna brand, tabel metrik, data bulanan, dan log pesanan.
* **Ekspor PDF & CSV**: Format cetak laporan ringkas siap presentasi.

### 3.6 Pengaturan Sistem & Peta Geolocation
* Konfigurasi mesin peta: Pilihan beralih antara **OpenStreetMap (Gratis Default)** dan **Google Maps**.
* Pengaturan koordinat dapur pusat, radius jangkauan maksimal kurir (default 25 Km), dan tarif pengiriman per Km.

---

## 4. Spesifikasi Teknologi & Dependencies Matrix

| Komponen | Teknologi | Versi | Fungsi / Peran |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **Next.js** | `14.2.3` | App Router, Server Components, API Routes |
| **UI Library** | **React** | `18.3.1` | Komponen reaktif, State Hooks, Context API |
| **Bahasa Pemrograman** | **TypeScript** | `5.4.5` | Type-safety penuh (Strict Mode) |
| **CSS Engine** | **Tailwind CSS** | `3.4.3` | Styling modern, Stitch Design Tokens, Glassmorphism |
| **Backend REST API** | **Laravel** | `12.x` | Backend engine utama, Sanctum Auth, Eloquent ORM |
| **Database Dokumen** | **Cloud Firestore** | `10.12.0` | Penyimpanan dokumen produk, pesanan, ulasan |
| **Database Realtime** | **Firebase RTDB** | `10.12.0` | Sinkronisasi status order dan live chat |
| **Payment Gateway** | **Midtrans API** | Sandbox Core | Virtual Account, QRIS, Credit Card, Settlement Check |
| **Peta & Geocoding** | **OpenStreetMap** | Leaflet/Embed | Peta rute kurir, Nominatim reverse geocoding |
| **Icon Library** | **Lucide React** | `0.378.0` | Ikonografi antarmuka yang bersih dan konsisten |

---

## 5. Struktur Direktori Proyek

```
UKK/
├── Laravel/                                # Backend REST API Engine (Laravel 12)
│   ├── app/
│   │   ├── Http/Controllers/Api/           # API Controllers (Product, Order, Voucher, SalesReport)
│   │   └── Models/                         # Eloquent Models
│   └── routes/api.php                      # Endpoint REST API
└── nefakky3/                               # Frontend Application (Next.js 14)
    ├── backend_django/                     # Arsip Django (Status: Nonaktif / Disabled)
    │   └── STATUS.md                       # Status nonaktif backend Django
    ├── src/
    │   ├── app/                            # Halaman & Rute Aplikasi Next.js
    │   │   ├── cart/                       # Alur Checkout 4-Tahap & Midtrans Snap
    │   │   ├── notifications/              # Pelacakan Pesanan & Rute OpenStreetMap
    │   │   ├── profile/                    # Profil Pengguna & 3-Way Photo Studio
    │   │   ├── products/                   # Katalog Detail Menu & Varian 3-Jus
    │   │   ├── admin/                      # Enterprise Admin Command Center
    │   │   └── api/                        # Next.js API Routes (Midtrans, Calendar, Maps)
    │   ├── components/                     # Komponen Modular & Tab Admin
    │   ├── context/                        # Global State (AuthContext, CartContext, DataContext)
    │   └── lib/                            # Service Utilities
    │       ├── laravelApi.ts               # Konektor REST API Laravel
    │       ├── mapService.ts               # Dual-Engine OpenStreetMap & Haversine
    │       ├── realtimeCalendarApi.ts      # Deteksi Kalender & Jam Realtime WIB
    │       └── exportUtils.ts              # Engine Ekspor Excel (.xls) & PDF
    ├── scripts/
    │   └── run-tests.mjs                   # Automated Test Suite Runner
    ├── PRD.md                              # Product Requirement Document
    ├── DESIGN.md                           # Master Design System Guidelines
    ├── DESIGN_ADMIN.md                     # Spesifikasi Antarmuka Admin Command Center
    ├── DESIGN_USER.md                      # Spesifikasi Antarmuka Pelanggan
    └── TEST_REPORT.md                      # Laporan Hasil Pengujian Otomatis
```

---

## 6. Panduan Instalasi & Menjalankan Aplikasi

### 6.1 Prasyarat Sistem
* **Node.js**: Versi `18.18.0` atau yang lebih baru.
* **PHP**: Versi `8.2` atau lebih baru dengan ekstensi `pdo_mysql`, `mbstring`, `openssl`.
* **Composer**: Versi `2.x`.
* **NPM**: Versi `9.x` atau lebih baru.

### 6.2 Langkah Menjalankan Backend Laravel
```bash
# 1. Masuk ke direktori Laravel
cd f:/UKK/Laravel

# 2. Install dependensi composer jika belum terpasang
composer install

# 3. Jalankan server backend pada port 8000
php artisan serve --port=8000
```
Backend Laravel akan aktif di `http://localhost:8000/api`.

### 6.3 Langkah Menjalankan Frontend Next.js
```bash
# 1. Masuk ke direktori Next.js
cd f:/UKK/nefakky3

# 2. Install dependensi Node.js
npm install

# 3. Jalankan server development pada port 3000
npm run dev
```
Buka peramban di alamat `http://localhost:3000`.

---

## 7. Integrasi & Panduan Pengujian Pembayaran Midtrans Sandbox

1. Buka halaman menu dan tambahkan produk ke keranjang di `/cart`.
2. Klik **"Lanjut ke Pengiriman"**, isi alamat pengantaran, lalu klik **"Lanjut ke Pembayaran"**.
3. Pilih metode pembayaran online (misal: **Virtual Account BCA** atau **QRIS**).
4. Klik tombol **"BAYAR SEKARANG VIA MIDTRANS SNAP"**.
5. Modal konsol simulasi Midtrans Sandbox akan muncul menampilkan nomor Virtual Account riil.
6. Klik tombol **"Buka Midtrans Payment Simulator"** untuk membuka halaman resmi simulator Midtrans di tab baru.
7. Tempelkan nomor Virtual Account dan klik tombol **"Inquire & Pay"**.
8. Aplikasi Nefakky akan mendeteksi pelunasan secara otomatis via *background polling* dalam waktu < 2.5 detik dan mengalihkan status ke pesanan lunas.

---

## 8. Formula Matematis Kalkulasi Ongkos Kirim Berbasis Jarak

Perhitungan ongkos kirim pengantaran hidangan dari Dapur Utama Nefakky (*Bojong Gede, Bogor*) ke lokasi pembeli dihitung secara transparan:

$$\text{Ongkos Kirim} = \begin{cases} 
\text{Rp } 10.000 & \text{jika } \text{Jarak} \le 10\text{ Km} \\ 
\text{Rp } 10.000 + \left\lceil \dfrac{\text{Jarak} - 10}{2} \right\rceil \times \text{Rp } 2.500 & \text{jika } \text{Jarak} > 10\text{ Km} 
\end{cases}$$

### Contoh Perhitungan:
* **Jarak 4.2 Km** $\le 10$ Km $\rightarrow$ Ongkos Kirim = **Rp 10.000**.
* **Jarak 13.5 Km** $> 10$ Km $\rightarrow$ Selisih = 3.5 Km $\rightarrow \lceil 3.5/2 \rceil = 2$ interval $\rightarrow$ **Rp 10.000 + (2 \times Rp 2.500) = Rp 15.000**.

---

## 9. Layanan Peta & Geolocation (OpenStreetMap Dual Mode)

* **OpenStreetMap Engine**: Aktif secara bawaan (*default*) tanpa biaya dan tanpa memerlukan kartu kredit. Menggunakan OpenStreetMap Embed Tiles dan *Nominatim API* untuk reverse geocoding alamat.
* **Haversine Distance Formula**: Menghitung jarak garis lurus bola bumi antara koordinat Dapur Pusat ($-6.2088, 106.8456$) dan koordinat pelanggan:
  $$d = 2R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta \text{lon}}{2}\right)}\right)$$
* **Google Maps API**: Opsi cadangan yang dapat diaktifkan kapan saja melalui panel Pengaturan Admin.

---

## 10. Layanan Jam & Kalender Realtime (Realtime Calendar API)

* **Endpoint**: `GET /api/calendar/time`
* **Format Waktu**: Waktu Indonesia Barat (*WIB / Asia/Jakarta*)
* **Output Payload JSON**:
  ```json
  {
    "timestamp": 1787645000000,
    "dayName": "Selasa",
    "dateNum": 25,
    "monthName": "Agustus",
    "year": 2026,
    "timeStr": "14:15:00 WIB",
    "formattedFull": "Selasa, 25 Agustus 2026 • 14:15:00 WIB"
  }
  ```
* Menjamin setiap transaksi yang terjadi mencatat waktu dan tanggal kalender resmi secara akurat.

---

## 11. Skema Basis Data & Sinkronisasi

Aplikasi menggunakan arsitektur basis data ganda terisolasi:

1. **Firebase Cloud Firestore**: Menyimpan data master produk (`products`), pesanan pelanggan (`orders`), riwayat promosi (`promotions`), voucher diskon (`vouchers`), dan ulasan produk (`reviews`).
2. **Firebase Realtime Database (`asia-southeast1`)**: Menyediakan sinkronisasi latensi rendah untuk live telemetry status kurir, konfirmasi penerimaan pesanan pelanggan, dan pesan live chat.
3. **Browser localStorage Cache**: Memastikan aplikasi dapat beroperasi secara *offline-tolerant* dan memuat data antarmuka secara instan (*Zero Layout Shift*).

---

## 12. Pengujian Otomatis (Automated Test Suite)

Untuk menjalankan seluruh suite pengujian otomatis proyek:
```bash
node scripts/run-tests.mjs
```

### Rekapitulasi Modul Uji:
1. **TypeScript Type Safety**: `npx tsc --noEmit` $\rightarrow$ 0 Error (Passed).
2. **Route Integrity**: Pemeriksaan eksistensi rute `/cart`, `/notifications`, `/profile`, `/products`, `/admin`.
3. **Product Master Data**: Integritas 6 item menu master lengkap.
4. **Review System**: Helper ulasan produk berbahasa Indonesia.
5. **Cart & Promo Calculation**: Kalkulasi subtotal, diskon voucher, dan batas minimum belanja.
6. **Firebase Configuration**: Inisialisasi Firebase Auth & Database.
7. **Midtrans API Engine**: Rute API `/api/midtrans/charge` & `/api/midtrans/status`.
8. **Shipping Distance Engine**: Akurasi formula matematis ongkos kirim.

*Status*: **8 / 8 Modul Passed (100% Sukses)**. Laporan lengkap: [TEST_REPORT.md](TEST_REPORT.md).

---

## 13. Konfigurasi Environment Variables

File `.env.local` pada direktori root berisi variabel konfigurasi berikut:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCP1_JAH-yhHXWPH6EeTK-TnnYzTl59S0E
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nefakky3.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nefakky3
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nefakky3.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=903118383042
NEXT_PUBLIC_FIREBASE_APP_ID=1:903118383042:web:84d5cb1b6863a51be7585b
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://nefakky3-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-R2ZTLDN2R9

# Midtrans Sandbox Payment Gateway
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-8T4q9uw1fIGB-pla
MIDTRANS_SERVER_KEY=Mid-server-Exgl2wTl6V1_om6_RMlFPpiS
MIDTRANS_MERCHANT_ID=M664001757

# Backend REST API (Laravel 12 Engine)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_LARAVEL_API_URL=http://localhost:8000/api
```

---

## 14. Informasi Produksi & Legalitas

* **Nama Usaha / Brand**: Nefakky Artisanal Marketplace
* **Pemilik & Pengembang Utama**: Fatih Ahmad Zakky
* **Alamat Dapur Pusat**: *Puri Bojong Lestari AF No 41, RT 10 / RW 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Provinsi Jawa Barat 16921, Indonesia.*
* **Kontak Operasional**: WhatsApp Dapur & Kurir: `+62 812-3456-7890`

Hak Cipta © 2026 **Nefakky Culinary Marketplace**. Seluruh hak cipta dilindungi undang-undang.
