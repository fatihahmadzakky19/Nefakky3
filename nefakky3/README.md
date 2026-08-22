# 🍲 Nefakky — Artisanal Food & Culinary Marketplace

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com/)
[![Firebase](https://img.shields.io/badge/Firebase-10.12.0-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Midtrans](https://img.shields.io/badge/Midtrans-Sandbox_API-004B99?style=for-the-badge)](https://midtrans.com/)
[![Test Suite](https://img.shields.io/badge/Test_Suite-6%2F6_Passed-success?style=for-the-badge)](TEST_REPORT.md)

**Nefakky** adalah platform *artisanal e-commerce* dan marketplace kuliner premium berbasis web modern yang dirancang untuk menghadirkan pengalaman belanja makanan tradisional khas Nusantara yang cepat, intuitif, dan aman. Platform ini dibangun dengan arsitektur modern berstandar enterprise: frontend **Next.js 14 App Router** dengan **Google Stitch AI UI System**, backend REST API **Laravel 12**, arsitektur database ganda (**Firebase Cloud Firestore DB** & **Firebase Realtime Database `asia-southeast1`**), integrasi gerbang pembayaran **Midtrans Core API & Snap Engine** dengan integrasi resmi Midtrans Sandbox Simulator, sistem ongkos kirim berbasis jarak, pelacakan armada kurir visual 2-kolom (**Animated SVG Live Courier Fleet Map**), penangkapan foto kamera langsung (**3-Way Photo Studio Picker**), serta **Enterprise Admin Command Center** dengan modul ekspor laporan resmi Microsoft Excel (.xls) dan PDF.

---

## 📑 Daftar Isi

- [✨ Fitur Utama](#-fitur-utama)
  - [1. Modul Pelanggan (Customer Facing)](#1-modul-pelanggan-customer-facing)
  - [2. Modul Administrator (Enterprise Command Center)](#2-modul-administrator-enterprise-command-center)
- [🛠️ Arsitektur Teknologi](#️-arsitektur-teknologi)
- [📂 Struktur Direktori Proyek](#-struktur-direktori-proyek)
- [🚀 Panduan Instalasi & Menjalankan Aplikasi](#-panduan-instalasi--menjalankan-aplikasi)
- [💳 Panduan Pengujian Pembayaran Midtrans Sandbox](#-panduan-pengujian-pembayaran-midtrans-sandbox)
- [🚚 Formula Perhitungan Ongkos Kirim Berdasarkan Jarak](#-formula-perhitungan-ongkos-kirim-berdasarkan-jarak)
- [🧪 Pengujian Otomatis](#-pengujian-otomatis)
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
* 💳 **Pembayaran Digital Midtrans Sandbox & Simulator Interaktif**:
  - Menghasilkan nomor Virtual Account (BCA/BNI/BRI/Permata), Mandiri Bill, dan QRIS secara riil dari API Midtrans Sandbox.
  - Modal konsol pembayaran interaktif dengan tombol **Salin Kode** dan tombol langsung **"🌐 Buka Midtrans Payment Simulator ↗"**.
  - Pengecekan status otomatis di latar belakang (*background polling*) setiap 2,5 detik mendeteksi pelunasan dari simulator Midtrans.
  - Pop-up notifikasi perayaan berhasil instan saat pembayaran diverifikasi lunas oleh Midtrans Gateway.
  - Pilihan transaksi tunai **Cash on Delivery (COD)** tanpa pembayaran awal.
* 🚚 **Formula Ongkos Kirim Berbasis Jarak**:
  - Jarak $\le 10$ km: Flat **Rp 10.000**.
  - Jarak $> 10$ km: **Rp 10.000 + $\lceil(\text{jarak} - 10)/2\rceil \times \text{Rp } 2.500$**.
  - Transparansi 100% pada rincian biaya (Subtotal, Ongkos Kirim, Diskon, Total).
* 📦 **Pelacakan 5-Tahap & Peta Rute Kurir Animasi 2-Kolom (`/notifications`)**:
  - **Kolom Kiri**: Header estimasi waktu tiba, stepper 5-tahap dengan timestamp riil, dan kartu interaktif **"✅ Konfirmasi Pesanan Telah Sampai (Tiba Tepat Waktu)"**.
  - **Kolom Kanan**: Peta rute animasi SVG bergerak dari Dapur Pusat ke Alamat Pembeli, profil kurir (*"Karyawan Nefakky"*), dan ringkasan pesanan.
* 📜 **Riwayat Pesanan Realtime (Newest-First)**:
  - Seluruh riwayat transaksi diurutkan dari yang paling baru ke yang paling lama dan tersinkronisasi otomatis via Firestore `onSnapshot`.
  - Kartu riwayat interaktif dapat diklik untuk langsung memantau pesanan tersebut di tracker bagian atas.
  - Modal cetak **Struk Pembayaran Resmi (PDF)** via `window.print()`.
* 📷 **3-Way Photo Studio Picker (`/profile`)**:
  - Pilihan foto profil dari Galeri, Jepretan Kamera Langsung (Webcam Live Stream & Canvas Capture), atau Google SSO Avatar.
* 🏠 **Siklus Alamat & Label Dinamis**:
  - Pengguna baru memulai dengan alamat kosong; alamat pertama saat checkout otomatis tersimpan ke profil.
  - Label alamat dapat dipilih dari chip preset (*Rumah*, *Kantor*, *Apartemen*) atau diketik secara bebas.

### 2. Modul Administrator (Enterprise Command Center)
* 📊 **Executive Dashboard & 5 Metrik KPI**: Ringkasan Total Omset Kotor, Estimasi Margin Laba Bersih (40%), Total Pesanan Selesai, Average Order Value (AOV), dan Rating Kepuasan Pelanggan.
* 📈 **Interactive Sales Chart & Custom Editor**: Grafik omset bulanan SVG interaktif dimulai dari Juni 2026 (Event Bazar >10 Juta) dengan fitur **Edit Data Grafik Modal** untuk mengubah nominal omset, laba, status bazar, dan badge catatan per bulan.
* 📥 **Export Engine Terpadu (`exportUtils.ts`)**: Ekspor data laporan bisnis lengkap ke Microsoft Excel (.xls) berformat styling resmi, CSV, dan format cetak PDF.
* 📝 **Modal Input Omset Manual (Offline/Bazar POS Logger)**: Pencatatan cepat penjualan off-grid/event bazar dengan multi-select pill checkboxes untuk menu paling laris (*Best Seller*) dan kurang laris.
* 🍳 **Kitchen Order Management**: Kontrol status pengerjaan dapur 5-tahap secara 1-klik, notifikasi real-time saat pesanan dikonfirmasi pelanggan, serta verifikasi bukti foto makanan dan uang tunai COD kurir via WhatsApp.
* 📦 **Manajemen Katalog Produk (CRUD)**: Tambah item, sunting harga, atur diskon persentase, persediaan stok live, kategori, dan foto utama.
* 🎟️ **Generator Voucher Promo & Auto-Expiry**: Pembuatan kupon diskon dengan batasan *Minimum Spend*, kuota penggunaan, dan sistem penonaktifan otomatis.
* ⭐ **Moderasi Ulasan Pelanggan**: Sematkan ulasan unggulan (*Pin Review*), balas ulasan pembeli, dan moderasi ulasan.

---

## 🛠️ Arsitektur Teknologi

| Layer | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14.2.3 (App Router)** | Server & Client Components, Dynamic Routing, Fast Refresh |
| **UI Library & Styling** | **React 18.3.1 & Tailwind CSS 3.4.3** | Google Stitch Palette, Glassmorphism, Responsive Grid |
| **Type Safety** | **TypeScript 5.4.5 (Strict Mode)** | 100% Type Checked (`npx tsc --noEmit` $\rightarrow$ 0 error) |
| **Icons & Media** | **Lucide React Icons** | Iconography modern, ringan, dan konsisten |
| **Backend REST API** | **Laravel 12 (PHP 8.2+)** | Controllers, Eloquent ORM, Seeders, API Routes |
| **Database Persistent** | **Firebase Cloud Firestore** | NoSQL Document DB untuk data produk, pesanan, ulasan |
| **Database Real-time** | **Firebase Realtime Database (RTDB)** | Low-latency state sync (`asia-southeast1`) untuk live order & chat |
| **Payment Gateway** | **Midtrans Core API & Snap Sandbox** | Integrasi gateway pembayaran sandbox, charge API, status polling |

---

## 📂 Struktur Direktori Proyek

```
UKK/
├── Laravel/                          # Backend API Engine (Laravel 12)
│   ├── app/
│   │   ├── Http/Controllers/Api/     # REST API Controllers (Product, Order, Voucher, Review, SalesReport, Midtrans)
│   │   └── Models/                   # Eloquent Models
│   └── routes/api.php                # API Endpoints Definition
└── nefakky3/                         # Frontend Application (Next.js 14 App Router)
    ├── scripts/
    │   └── run-tests.mjs             # Automated Test Runner Suite
    ├── src/
    │   ├── app/                      # Next.js App Router Pages
    │   │   ├── api/midtrans/charge/  # Midtrans Real Sandbox Charge API
    │   │   ├── api/midtrans/status/  # Midtrans Realtime Status Polling API
    │   │   ├── api/midtrans/token/   # Midtrans Snap Token API
    │   │   ├── cart/                 # 4-Step Checkout & Midtrans Sandbox Console
    │   │   ├── notifications/        # 2-Column Live Tracking & Newest-First History
    │   │   ├── menu/                 # Product Catalog & 3-Juice Switcher
    │   │   ├── profile/              # 3-Way Photo Studio, Addresses & Settings
    │   │   ├── admin/                # Enterprise Admin Command Center
    │   │   └── comments/             # Community Reviews & Ratings
    │   ├── context/                  # React Contexts (Auth, Cart, Data)
    │   ├── components/               # Reusable UI Components
    │   └── lib/                      # Firebase & Third-Party Helpers
    ├── DESIGN.md                     # Master Design System Documentation
    ├── PRD.md                        # Product Requirement Document
    ├── TEST_REPORT.md                # Automated Test Suite Report
    └── README.md                     # Project Overview & Setup Guide
```

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### Prasyarat Sistem
* **Node.js**: v18.17.0 atau lebih tinggi
* **npm**: v9.0.0 atau lebih tinggi
* **PHP**: v8.2+ (opsional untuk backend Laravel)
* **Composer**: v2.5+ (opsional untuk backend Laravel)

### Menjalankan Frontend Next.js
```bash
# 1. Masuk ke direktori frontend
cd nefakky3

# 2. Pasang dependensi
npm install

# 3. Jalankan server pengembangan
npm run dev
```
Aplikasi akan aktif di **`http://localhost:3000`**.

---

## 💳 Panduan Pengujian Pembayaran Midtrans Sandbox

1. Buka keranjang belanja di [http://localhost:3000/cart](http://localhost:3000/cart).
2. Lanjutkan ke langkah **Pembayaran** dan pilih metode pembayaran online (misal: **Virtual Account BCA** atau **QRIS**).
3. Klik tombol **"BAYAR SEKARANG VIA MIDTRANS SNAP"**.
4. Konsol Pembayaran Midtrans Sandbox akan muncul menampilkan Nomor Virtual Account riil (misal: `01757917992610117704681`).
5. Klik tombol **"Salin Kode"**, lalu klik tombol **"🌐 Buka Midtrans Payment Simulator ↗"** (membuka tab baru).
6. Di simulator Midtrans, tempelkan nomor VA tersebut, lalu klik **"Inquire"** dan **"Pay"**.
7. Kembali ke tab web Nefakky: Web akan **seketika mendeteksi pelunasan transaksi secara otomatis**, menampilkan notifikasi sukses **"🎉 Pembayaran Berhasil!"**, dan mengarahkan Anda ke *Live Tracker 5-Tahap*!

---

## 🚚 Formula Perhitungan Ongkos Kirim Berdasarkan Jarak

Ongkos kirim pada aplikasi Nefakky dihitung secara otomatis dan transparan berdasarkan jarak pengantaran:

$$\text{Ongkos Kirim} = \begin{cases} \text{Rp } 10.000 & \text{jika } \text{jarak} \le 10\text{ km} \\ \text{Rp } 10.000 + \left\lceil \dfrac{\text{jarak} - 10}{2} \right\rceil \times \text{Rp } 2.500 & \text{jika } \text{jarak} > 10\text{ km} \end{cases}$$

### Contoh Perhitungan:
* **Jarak 4.2 km**: $\le 10$ km $\rightarrow$ **Rp 10.000**
* **Jarak 10.0 km**: $\le 10$ km $\rightarrow$ **Rp 10.000**
* **Jarak 12.0 km**: $> 10$ km $\rightarrow$ Rp 10.000 + $\lceil(12 - 10)/2\rceil \times \text{Rp } 2.500 = \text{Rp } 10.000 + (1 \times 2.500) =$ **Rp 12.500**
* **Jarak 15.0 km**: $> 10$ km $\rightarrow$ Rp 10.000 + $\lceil(15 - 10)/2\rceil \times \text{Rp } 2.500 = \text{Rp } 10.000 + (3 \times 2.500) =$ **Rp 17.500**

---

## 🧪 Pengujian Otomatis

Untuk menjalankan suite pengujian otomatis proyek:

```bash
# Jalankan seluruh test suite otomatis
npm test

# Jalankan pengecekan TypeScript tanpa kompilasi
npx tsc --noEmit
```

Laporan pengujian terbaru dapat dilihat secara detail di file **`TEST_REPORT.md`**.

---

## 🔑 Konfigurasi Environment Variables

Buat file `.env.local` di root direktori `nefakky3/`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nefakky-resto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nefakky-resto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nefakky-resto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://nefakky-resto-default-rtdb.asia-southeast1.firebasedatabase.app

# Midtrans Payment Gateway Configuration
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-8T4q9uw1fIGB-pla
MIDTRANS_SERVER_KEY=Mid-server-Exgl2wTl6V1_om6_RMlFPpiS
MIDTRANS_MERCHANT_ID=M664001757
```

---

## 📍 Alamat Produksi Resmi

Seluruh hidangan diproduksi secara higienis dan terpusat di:
> **Dapur Pusat Nefakky Resto**  
> Puri Bojong Lestari AF No 41, Rt 10 Rw 14,  
> Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor,  
> Provinsi Jawa Barat 16921, Indonesia.

---

## 📄 Lisensi & Hak Cipta

© 2026 **Nefakky Marketplace**. Seluruh hak cipta dilindungi undang-undang.  
Didesain dan dikembangkan dengan penuh dedikasi oleh **Fatih Ahmad Zakky** bersama **Google Stitch AI Design System**.
