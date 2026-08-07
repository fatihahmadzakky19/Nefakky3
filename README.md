# 🍲 Nefakky — Artisanal Food & Culinary Marketplace

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-10.12.0-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Midtrans](https://img.shields.io/badge/Midtrans-Snap_API-004B99?style=for-the-badge)](https://midtrans.com/)

**Nefakky** adalah platform e-commerce dan toko kuliner *artisanal* berbasis web modern yang dirancang untuk menghadirkan pengalaman belanja makanan premium yang cepat, intuitif, dan aman. Platform ini dilengkapi dengan fitur integrasi gerbang pembayaran otomatis (**Midtrans Payment Gateway**), sistem penentuan lokasi pengiriman presisi via GPS & Haversine Distance Engine, autentikasi Firebase, serta dashboard pengelola toko terpusat.

---

## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
  - [Modul Pelanggan (Customer Facing)](#1-modul-pelanggan-customer-facing)
  - [Modul Administrator (Admin Panel)](#2-modul-administrator-admin-panel)
- [Teknologi & Modul Utama](#-teknologi--modul-utama)
- [Struktur Proyek](#-struktur-proyek)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Panduan Instalasi & Penggunaan](#-panduan-instalasi--penggunaan)
- [Konfigurasi Environment Variable](#-konfigurasi-environment-variable)
- [Akun Uji Coba (Testing Credentials)](#-akun-uji-coba-testing-credentials)
- [Lisensi & Hak Cipta](#-lisensi--hak-cipta)

---

## ✨ Fitur Utama

### 1. Modul Pelanggan (Customer Facing)
* 🔐 **Autentikasi Aman & SSO**: Login/Registrasi Email & Password serta Google OAuth 2.0 dengan penanganan error interaktif dan sinkronisasi sesi lintas tab (*Cross-Tab Sync*).
* 🍱 **Katalog Menu Interaktif**: Filter kategori (*Makanan Berat*, *Menu Hemat*, *Minuman*, *Cemilan*), instant live search, badge produk (*TERPOPULER*, *BEST SELLER*), serta rincian kalori & gizi lengkap.
* 📍 **Penentuan Lokasi Pengiriman GPS**: Pemilihan alamat presisi berbasis lokasi GPS atau preset Jabodetabek dengan perhitungan jarak Haversine dari Dapur Pusat.
* 🛒 **Keranjang Belanja Scoped**: Keranjang terisolasi secara otomatis berdasarkan UID pengguna (`nefakky_cart_${user.uid}`) dengan klaim voucher promo instan.
* 💳 **Pembayaran Midtrans Snap**: Integrasi modal pembayaran Midtrans (QRIS, E-Wallet, Bank Transfer, Credit Card) beserta *Countdown Timer* 24 Jam real-time.
* 📦 **Pelacakan Pesanan Live**: Visualisasi alur pesanan (`RECEIVED` $\rightarrow$ `COOKING` $\rightarrow$ `SHIPPING` $\rightarrow$ `COMPLETED`) dan tombol konfirmasi terima barang.
* ⭐ **Rating & Ulasan Pelanggan**: Penilaian ulasan bintang 1-5, bukti foto, serta sistem diskusi ulasan.
* 💬 **Live Customer Support Chat**: Fitur obrolan langsung antara pelanggan dan tim customer service toko.

### 2. Modul Administrator (Admin Panel)
* 📊 **Dashboard Analitik Operasional**: Pemantauan KPI Omset Penjualan, Total Pesanan, Pelanggan Aktif, dan Produk Terlaris.
* 🛠️ **Kelola Katalog Produk (CRUD)**: Tambah, edit harga/diskon, manajemen persediaan stok, galeri foto, dan batasan jarak pengiriman maksimum (Km).
* 📝 **Manajemen Pesanan Masuk**: Mengubah status pesanan dan memantau status validasi pembayaran Midtrans.
* 🎟️ **Generator Voucher Promo**: Pembuatan kupon diskon persentase dengan batasan minimal transaksi (*Minimum Spend*) dan tanggal kadaluarsa.
* 💬 **Pusat Chat & Moderasi Ulasan**: Penyematan ulasan unggulan (*Pinning*), moderasi ulasan, dan balasan chat pelanggan secara langsung.

---

## 🛠️ Teknologi & Modul Utama

| Kategori | Teknologi |
| :--- | :--- |
| **Frontend Framework** | [Next.js 14](https://nextjs.org/) (App Router, React 18) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v3](https://tailwindcss.com/), Vanilla CSS, [Lucide Icons](https://lucide.dev/) |
| **Authentication** | [Firebase Authentication](https://firebase.google.com/docs/auth) (Email/Pass & Google SSO) |
| **State Management** | React Context API (`AuthContext`, `CartContext`, `DataContext`) |
| **Payment Gateway** | [Midtrans Snap API](https://snap-docs.midtrans.com/) (Sandbox & Production) |
| **Maps & Geolocation** | Web Geolocation API & OpenStreetMap / Nominatim API |

---

## 📁 Struktur Proyek

```text
nefakky3/
├── public/                  # Asset Statis (Gambar Makanan, Logo, Favicon)
├── src/
│   ├── app/                 # Next.js App Router Pages & API Routes
│   │   ├── admin/           # Dashboard Management Admin (/admin)
│   │   ├── api/             # API Route Handlers (Midtrans Token Generator)
│   │   ├── cart/            # Halaman Keranjang Belanja & Checkout (/cart)
│   │   ├── comments/        # Halaman Ulasan & Rating Produk (/comments)
│   │   ├── forgot-password/ # Halaman Lupa Password (/forgot-password)
│   │   ├── login/           # Halaman Masuk Akun (/login)
│   │   ├── menu/            # Katalog Menu & Detail Produk (/menu)
│   │   ├── notifications/   # Halaman Pusat Notifikasi (/notifications)
│   │   ├── profile/         # Profil Pelanggan & Riwayat Pesanan (/profile)
│   │   ├── register/        # Halaman Pendaftaran Akun (/register)
│   │   ├── globals.css      # Custom Global CSS Styles & Utilities
│   │   ├── layout.tsx       # Root Layout Component & Context Providers
│   │   └── page.tsx         # Landing Page Utama
│   ├── components/          # Reusable UI Components
│   │   ├── AutoMapPickerModal.tsx  # Modal Map Location Picker & Haversine Engine
│   │   ├── MenuDetailModal.tsx     # Modal Detail Nutrisi & Galeri Produk
│   │   └── Navbar.tsx              # Header Navigasi Global & Drawer
│   ├── context/             # Global Application State Contexts
│   │   ├── AuthContext.tsx  # Sesi Autentikasi & Role Access Control
│   │   ├── CartContext.tsx  # Keranjang Belanja & Kalkulator Promo
│   │   └── DataContext.tsx  # State Produk, Pesanan, Ulasan, Chat & Storage Sync
│   └── lib/
│       └── firebase.ts      # Inisialisasi Firebase Client SDK
├── .env.example             # Template Environment Variables
├── PRD.md                   # Product Requirement Document
├── README.md                # Dokumentasi Utama Proyek
├── DESIGN.md                # Design System & UI/UX Guidelines
├── next.config.js           # Konfigurasi Next.js
├── tailwind.config.ts       # Konfigurasi Tailwind CSS
└── package.json             # Manifest Dependensi & Scripts Node.js
```

---

## ⚙️ Persyaratan Sistem

* **Node.js**: `v18.x` atau `v20.x` (LTS direkomendasikan)
* **Package Manager**: `npm` v9+ atau `yarn` / `pnpm`
* **Browser**: Chrome, Edge, Safari, atau Firefox versi terbaru

---

## 🚀 Panduan Instalasi & Penggunaan

### 1. Clone Repository & Install Dependensi

```bash
git clone https://github.com/fatihahmadzakky19/Nefakky3.git
cd Nefakky3
npm install
```

### 2. Konfigurasi Environment Variable

Buat file `.env.local` di akar direktori proyek dengan menyalin isi `.env.example`:

```bash
cp .env.example .env.local
```

Isi variabel environment berikut pada `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyYourFirebaseApiKeyHere
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-app-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Midtrans Payment Gateway Configuration
MIDTRANS_SERVER_KEY=Mid-server-YourServerKeyHere
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-YourClientKeyHere
NEXT_PUBLIC_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js
```

### 3. Jalankan Mode Pengembang (Development)

```bash
npm run dev
```

Buka peramban dan akses alamat `http://localhost:3000`.

### 4. Build Proyek untuk Produksi

```bash
npm run build
npm run start
```

---

## 🔑 Akun Uji Coba (Testing Credentials)

Untuk menguji fitur administrator dan pelanggan:

| Peran (Role) | Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Administrator** | `fatihahmadzakky19@gmail.com` | `Fatih123` | Akses penuh ke `/admin` & Panel Operasional |
| **Customer** | Registrasi Baru / Google Auth | bebas | Akses Katalog, Checkout, Profil, Ulasan |

---

## 📝 Lisensi & Hak Cipta

Hak Cipta © 2026 **Nefakky (Fatih Ahmad Zakky)**. Seluruh hak cipta dilindungi undang-undang.
