# 🍲 Nefakky — Artisanal Culinary Marketplace & Enterprise Operations Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_RTDB-FFA611?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Midtrans](https://img.shields.io/badge/Midtrans-Snap_Sandbox-004B99?style=for-the-badge)](https://midtrans.com/)
[![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-GPS_Realtime-7EBC6F?style=for-the-badge&logo=openstreetmap)](https://www.openstreetmap.org/)

---

## 🏷️ 1. Profil & Identitas Toko

* **Nama Toko**: **Nefakky** (*Nefakky Artisanal Culinary Marketplace & Resto*)
* **Tagline**: *"Cita Rasa Warisan Kuliner Nusantara Otentik & Berkualitas Premium"*
* **Lokasi Dapur Pusat (Central Kitchen)**: Jl. Raya Bojong Gede No. 45, Kabupaten Bogor, Jawa Barat 16922
* **Jam Operasional**: Setiap Hari (08.00 — 22.00 WIB)

---

## 📝 2. Deskripsi Toko

**Nefakky** adalah platform e-commerce kuliner modern dan resto marketplace terpadu yang menyajikan aneka hidangan otentik khas Nusantara berkualitas tinggi yang dimasak dengan resep warisan tradisional. 

Platform ini dirancang untuk memberikan pengalaman kuliner terbaik bagi pelanggan mulai dari pemilihan menu hidangan, transparansi nutrisi & komposisi, sistem multi-voucher promo fleksibel, hingga pelacakan pengiriman kurir berbasis peta GPS secara realtime.

### 🍱 Menu & Hidangan Unggulan:
1. **Ayam Bakar Madu Rempah Nusantara**: Ayam pejantan pilihan dengan bumbu kecap rempah karamelisasi arang batok kelapa dan sambal terasi khas.
2. **Nasi Bakar Cumi Gurih Daun Pisang**: Nasi gurih beraroma daun kemangi dengan isian oseng cumi pedas meresap.
3. **Gudeg Komplit Tradisional Khas Jogja**: Olahan nangka muda legit santan kental dengan telur bebek bacem, krecek gurih, dan suwiran ayam.
4. **Garang Asam Ayam Kampung Belimbing Wuluh**: Daging ayam empuk dengan kuah santan asam segar alami dan cabai rawit utuh.
5. **Sambal Goreng Krecek Santan Pedas**: Krecek sapi lembut kenyal dengan kuah santan merah gurih nampol.
6. **Aneka Jus Tropis Buah Segar Alami**: 100% buah asli pilihan tanpa pemanis buatan (Varian *Mangga Harum Manis*, *Sirsak Segar*, dan *Jambu Biji Merah*).

### 🌟 Fitur Utama Aplikasi:
- **Single Active Order Protection**: Kebijakan satu pesanan aktif untuk memastikan hidangan dimasak dan diantar dengan kualitas terbaik sebelum memesan kembali.
- **Multi-Voucher Promo Stacking**: Penggunaan hingga maksimal 2 voucher promo bersamaan di keranjang/checkout dengan kalkulasi diskon kumulatif.
- **Transparansi Ongkos Kirim GPS Realtime**: Validasi geocoding alamat OpenStreetMap dengan perhitungan jarak matematis *Haversine Formula* dari dapur pusat ke lokasi pelanggan.
- **Gerbang Pembayaran Midtrans Snap**: Pembayaran instan via Virtual Account (BCA/BNI/Mandiri/BRI), QRIS, Kartu Kredit, atau Bayar di Tempat (COD).
- **Pelacakan Rute Kurir Realtime**: Pantau posisi kurir dan status pemrosesan dapur (Diterima $\rightarrow$ Dimasak $\rightarrow$ Siap $\rightarrow$ Diantar $\rightarrow$ Selesai).
- **Meja Pelayanan CS Live Chat & Admin Command Center**: Interaksi tanya jawab langsung antara pelanggan dan admin restoran secara realtime.
- **Cetak Nota & Invoice Resmi PDF**: Unduh dan cetak struk transaksi digital resmi.

---

## 💻 3. Framework & Teknologi yang Digunakan

### 🌐 Frontend (User Interface & Client App)
* **[Next.js 14](https://nextjs.org/)** (*App Router* Architecture) — Framework React SSR/SSG performa tinggi.
* **[React 18](https://reactjs.org/)** — Pustaka UI deklaratif modern berbasis komponen.
* **[TypeScript 5](https://www.typescriptlang.org/)** — Bahasa pemrograman bertipe ketat (*Type-Safe*) untuk keandalan kode tanpa bug runtime.
* **[Tailwind CSS 3](https://tailwindcss.com/)** — Framework styling utility-first yang dipadukan dengan desain mewah **Google Stitch Artisanal Luxury** (Palet warna Deep Espresso `#25160E`, Warm Terracotta `#934B19`, dan Warm Cream `#FAF8F5`).

### ⚙️ Backend (REST API & Realtime Server)
* **[Laravel 12 (PHP 8.2+)](https://laravel.com/)** — Framework backend enterprise untuk RESTful API, otentikasi Sanctum, dan broadcast WebSockets.
* **Next.js 14 API Routes (Node.js Serverless)** — Endpoint serverless untuk charge transaksi Midtrans, sinkronisasi webhook status pembayaran, proxy geocoding OSM, dan time sync server.
* **[Django 5 / Python](https://www.djangoproject.com/)** *(Opsional)* — Modul backend microservice di folder `backend_django/`.

---

## 📡 4. Layanan API yang Digunakan

1. **Midtrans Payment Gateway API**:
   - *Core API & Snap SDK Sandbox Simulator*.
   - Mendukung metode: BCA VA, BNI VA, Mandiri Bill, BRI VA, QRIS (GoPay/ShopeePay), Kartu Kredit, dan COD.
   - Endpoint: `/api/midtrans/charge`, `/api/midtrans/status`, `/api/midtrans/notification`.
2. **OpenStreetMap & Nominatim Geocoding API**:
   - *Dual-Engine Geolocation & Reverse Geocoding*.
   - Validasi ketepatan titik alamat pengiriman dan perhitungan jarak tempuh kilometer (*Haversine Distance Formula*).
3. **Realtime Server Calendar & Time API (WIB)**:
   - Sinkronisasi waktu transaksi dan invoice pesanan resmi sesuai zona Waktu Indonesia Barat.
4. **Firebase Cloud API**:
   - REST & Web SDK API untuk sinkronisasi pesanan, voucher promo, ulasan makanan, dan chat dua arah.
5. **Laravel 12 RESTful API (Sanctum Protected)**:
   - 97 endpoint terstruktur mencakup produk (`/api/v1/products`), pesanan (`/api/v1/orders`), ulasan (`/api/v1/reviews`), laporan omset (`/api/v1/reports`), dan live chat (`/api/v1/chats`).

---

## 🗄️ 5. Basis Data (Database) yang Digunakan

| Database | Tipe Basis Data | Kegunaan dalam Aplikasi |
| :--- | :--- | :--- |
| **Firebase Cloud Firestore** | NoSQL Cloud Document Store | Menyimpan data menu makanan, ulasan komunitas, klaim voucher promo, dan riwayat pesanan pelanggan. |
| **Firebase Realtime Database (RTDB)** | NoSQL Ultra-Low Latency Key-Value | Sinkronisasi kilat status pemrosesan dapur 5-tahap, posisi kurir GPS, dan chat CS live streaming. |
| **SQLite / MySQL (Laravel DB)** | Relational SQL Database | Penyimpanan relasional transaksi, audit trail aktivitas admin, dan modul pembukuan keuangan toko. |

---

## 📦 6. Ekstensi & Library (Pustaka) yang Digunakan

### 🎨 Pustaka Frontend (`nefakky3/package.json`)
* **`lucide-react`**: Kumpulan ikon grafis modern, elegan, dan semantik.
* **`leaflet` & `react-leaflet`**: Komponen peta interaktif OpenStreetMap untuk pelacakan rute pengiriman.
* **`framer-motion`**: Pustaka animasi antarmuka untuk transisi halaman dan dialog interaktif.
* **`canvas-confetti`**: Efek partikel konfeti animasi saat pelanggan berhasil menyelesaikan transaksi.
* **`sonner`**: Komponen notifikasi toast mengambang yang responsif dan modern.
* **`zustand`**: State management keranjang belanja dan filter data yang sangat cepat dan ringan.
* **`@tanstack/react-query`**: Pengelola caching cerdas, revalidasi background data, dan sinkronisasi API.
* **`react-hook-form` + `zod` + `@hookform/resolvers`**: Manajemen formulir berbasis skema validasi tipe ketat.
* **`embla-carousel-react`**: Slider hero banner hidangan nusantara responsif.

### 🛠️ Pustaka Backend (`Laravel/composer.json`)
* **`barryvdh/laravel-dompdf`**: Pustaka pembuat struk nota belanja dan invoice PDF digital resmi.
* **`rap2hpoutre/fast-excel`**: Pustaka ekspor laporan keuangan dan omset penjualan ke format Microsoft Excel (`.xlsx`).
* **`laravel/sanctum`**: Pustaka otentikasi token API yang aman dan ringan.
* **`laravel/reverb`**: Server WebSocket resmi Laravel berkecepatan tinggi untuk broadcast status pesanan realtime.
* **`spatie/laravel-activitylog`**: Pencatatan audit trail riwayat seluruh aksi admin dan perubahan status.
* **`spatie/laravel-query-builder`**: Pustaka filter, pencarian, dan pengurutan dinamis pada endpoint REST API.
* **`dedoc/scramble`**: Generator dokumentasi interaktif OpenAPI otomatis (`/docs/api`).

---

## ⚡ 7. Panduan Menjalankan Aplikasi di Komputer Lokal

### 1. Menjalankan Backend Laravel 12 API
```bash
cd f:\UKK\Laravel
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```

### 2. Menjalankan Server WebSocket Laravel Reverb (Opsional)
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

Buka peramban web di: **http://localhost:3000**

---

## 📚 8. Indeks Berkas Dokumentasi Lengkap (`nefakky3/docs/`)

* 🏗️ **[ARCHITECTURE.md](nefakky3/docs/ARCHITECTURE.md)** — Arsitektur sistem menyeluruh, komponen Next.js 14, Laravel 12, dan Reverb.
* 📡 **[API.md](nefakky3/docs/API.md)** — Spesifikasi lengkap seluruh endpoint REST API Laravel 12.
* 🗄️ **[DATABASE.md](nefakky3/docs/DATABASE.md)** — Skema basis data, ERD, tabel, tipe data, dan relasi Eloquent.
* 🔄 **[WORKFLOW.md](nefakky3/docs/WORKFLOW.md)** — Alur kerja bisnis (Order Lifecycle 5-Tahap, Payment Webhook, Auto-Restock).
* 💻 **[INSTALLATION.md](nefakky3/docs/INSTALLATION.md)** — Panduan instalasi dan setup lingkungan lokal langkah demi langkah.
* 🎨 **[DESIGN.md](nefakky3/docs/DESIGN.md)** — Master design system Google Stitch Artisanal Luxury.
* 🛒 **[DESIGN_USER.md](nefakky3/docs/DESIGN_USER.md)** — Spesifikasi UI/UX antarmuka belanja pelanggan.
* 🏢 **[DESIGN_ADMIN.md](nefakky3/docs/DESIGN_ADMIN.md)** — Spesifikasi UI/UX Enterprise Admin Command Center.
* 📋 **[PRD.md](nefakky3/docs/PRD.md)** — Product Requirement Document, visi bisnis, dan spesifikasi sistem.
* 🧪 **[TEST_REPORT.md](nefakky3/docs/TEST_REPORT.md)** — Laporan hasil pengujian otomatis frontend & backend (100% Passed).
* 📜 **[CHANGELOG.md](nefakky3/docs/CHANGELOG.md)** — Catatan riwayat perubahan versi dan pembaruan fitur aplikasi.
* 🤝 **[CONTRIBUTING.md](nefakky3/docs/CONTRIBUTING.md)** — Panduan kontribusi, standard code style PSR-12, dan TypeScript.

---

## ⚖️ Hak Cipta

Seluruh hak cipta dilindungi undang-undang.  
Dibuat dengan ❤️ untuk **Nefakky Artisanal Culinary Marketplace & Resto**.
