# 🍲 Nefakky — Artisanal Food & Culinary Marketplace

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-10.12.0-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Midtrans](https://img.shields.io/badge/Midtrans-Snap_API-004B99?style=for-the-badge)](https://midtrans.com/)

**Nefakky** adalah platform e-commerce dan toko kuliner *artisanal* berbasis web modern yang dirancang untuk menghadirkan pengalaman belanja makanan premium yang cepat, intuitif, dan aman. Platform ini dilengkapi dengan fitur integrasi gerbang pembayaran otomatis (**Midtrans Snap API**), alur checkout multi-step 4-tahap, sistem penentuan lokasi pengiriman presisi via GPS & Haversine Distance Engine, pelacakan ganda multi-order, cetak struk PDF resmi, autentikasi Firebase, serta dashboard pengelola toko terpusat dengan pengeditan grafik omset penjualan.

---

## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
  - [Modul Pelanggan (Customer Facing)](#1-modul-pelanggan-customer-facing)
  - [Modul Administrator (Admin Panel)](#2-modul-administrator-admin-panel)
- [Teknologi & Modul Utama](#-teknologi--modul-utama)
- [Struktur Proyek](#-struktur-proyek)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Panduan Instalasi & Penggunaan](#-panduan-instalasi--penggunaan)
- [Pengujian Otomatis (Automated Testing)](#-pengujian-otomatis-automated-testing)
- [Lisensi & Hak Cipta](#-lisensi--hak-cipta)

---

## ✨ Fitur Utama

### 1. Modul Pelanggan (Customer Facing)
* 🔐 **Autentikasi Aman & SSO**: Login/Registrasi Email & Password serta Google OAuth 2.0 dengan penanganan error interaktif dan sinkronisasi sesi lintas tab.
* 🍱 **Katalog Menu 3 Kategori**: Filter kategori (*Makanan Berat*, *Minuman*, *Menu Hemat*), rincian bahan, serta informasi kalori & gizi lengkap.
* 📍 **Penentuan Lokasi Pengiriman GPS**: Pemilihan alamat presisi berbasis lokasi GPS atau preset Jabodetabek dengan perhitungan jarak Haversine dari Dapur Pusat.
* 🛒 **Alur Checkout Multi-Step 4-Tahap**: Proses transaksi terstruktur (`1. Keranjang` $\rightarrow$ `2. Checkout & Alamat` $\rightarrow$ `3. Payment Midtrans` $\rightarrow$ `4. Selesai`).
* 🚚 **Formula Ongkir Transparan**: Biaya pengiriman 15% subtotal untuk jarak $\le 3$ km + Rp 1.500 per 2 km untuk jarak $> 3$ km (0 biaya layanan).
* 💳 **Pembayaran Midtrans Snap**: Integrasi modal pembayaran Midtrans (QRIS, E-Wallet, Bank Transfer, Credit Card 3D Secure).
* 📦 **Pelacakan Multi-Order Live**: Visualisasi alur pesanan 5-tahap (`RECEIVED` $\rightarrow$ `COOKING` $\rightarrow$ `READY` $\rightarrow$ `SHIPPING` $\rightarrow$ `COMPLETED`), tab switcher untuk beberapa pesanan aktif, dan tombol konfirmasi terima barang.
* 📜 **Riwayat Pemesanan & Struk PDF**: Riwayat transaksi permanen di Firestore real-time dan modal cetak **Struk Pembayaran Resmi (PDF)** via `window.print()`.
* ⭐ **Rating & Ulasan Pelanggan**: Penilaian ulasan bintang 1-5, bukti foto, serta sistem ulasan kontekstual hidangan Indonesia.

### 2. Modul Administrator (Admin Panel)
* 📊 **Dashboard Analitik & Editable Sales Chart**: Grafik omset kotor dan laba bersih yang dimulai dari Juni 2026 (Event Bazar >10 Juta) dengan fitur **Edit Data Grafik Modal** per bulan.
* 📝 **Modal Input Omset Manual (Offline/Bazar)**: Input transaksi offline menggunakan daftar produk katalog presisi dan multi-select pill checkboxes untuk menu terlaris & kurang laris (>1 item).
* 🛠️ **Kelola Katalog Produk (CRUD)**: Tambah, edit harga/diskon, manajemen persediaan stok, galeri foto, dan visibilitas produk.
* 📝 **Manajemen Pesanan Masuk**: Mengubah status pesanan 5-tahap dan memantau status validasi pembayaran Midtrans.
* 🎟️ **Generator Voucher Promo**: Pembuatan kupon diskon persentase dengan batasan minimal transaksi (*Minimum Spend*).
* 💬 **Moderasi Ulasan**: Penyematan ulasan unggulan (*Pinning*) dan balasan ulasan pelanggan.

---

## 🛠️ Teknologi & Modul Utama

* **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS v3, TypeScript (Strict Mode), Lucide React Icons.
* **Backend API**: Python 3.13 & Django 5.2 (Django REST Framework) dengan arsitektur PBO/OOP.
* **Database & Cloud**: Firebase Cloud Firestore DB (NoSQL Document Store) dengan 6 koleksi real-time sync.
* **Payment Engine**: Midtrans Snap Payment Gateway API.
* **Location & Distance**: OpenStreetMap Nominatim API & Algoritma Haversine Distance Engine.

---

## 🧪 Pengujian Otomatis (Automated Testing)

Aplikasi dilengkapi dengan skrip penguji otomatis 6 modul utama:

```bash
npm test
```

Skrip ini akan memeriksa:
1. **TypeScript Type Compiler** (`npx tsc --noEmit`) - Lulus 0 error.
2. **Route & Component Integrity** - Verifikasi ketersediaan seluruh rute utama.
3. **Product Catalog & Master Data** - Verifikasi data 6 produk utama.
4. **Indonesian Review Engine** - Generasi ulasan otomatis khas Indonesia.
5. **Cart & Promo Engine** - Logika kalkulasi keranjang & voucher promo.
6. **Firebase Cloud Connection** - Inisialisasi Auth & Firestore DB.

---

## 📄 Lisensi & Hak Cipta

© 2026 **Nefakky Artisanal Kitchen** (Fatih Ahmad Zakky). Hak Cipta Dilindungi Undang-Undang.
