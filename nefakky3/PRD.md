# Product Requirement Document (PRD) — Nefakky Marketplace

**Nama Produk**: Nefakky - Artisanal Food & Culinary Marketplace  
**Versi**: 3.0.0 (Enterprise Architecture: Laravel 12 REST Backend, Next.js 14 App Router, Google Stitch AI UI System, Dual Firebase Architecture, Live Camera & Storybook Suite)  
**Tanggal Terakhir Diperbarui**: 18 Agustus 2026  
**Status**: Production / Live  
**Penulis / Team**: Tim Pengembang Nefakky (Fatih Ahmad Zakky) & Google Stitch AI Design System  

---

## 1. Ringkasan Eksekutif & Visi Produk

### 1.1 Visi Produk
**Nefakky** adalah platform *artisanal e-commerce* dan marketplace kuliner premium berteknologi modern yang menghubungkan penikmat kuliner (*epicureans*) dengan hidangan tradisional khas Indonesia berkualitas tinggi. Platform ini menggabungkan pengalaman belanja digital yang hangat, estetik, dan responsif dengan integrasi gerbang pembayaran *real-time* eksklusif (**Midtrans Snap API**), pemetaan lokasi pengiriman otomatis berbasis GPS (**Auto Map Picker & Haversine Distance Engine**), modul pengambilan foto secara langsung (**Live Camera Capture System**), suite komponen UI terisolasi (**Storybook 10 Suite**), arsitektur ganda database awan *real-time* (**Firebase Cloud Firestore DB & Firebase Realtime Database `asia-southeast1`**), backend berkinerja tinggi (**Laravel 12 REST API Engine**), serta sistem pengelolaan operasional toko terpadu (**Enterprise Admin Command Center**).

### 1.2 Tujuan Utama & Value Proposition
* **Direct-to-Consumer (D2C) Premium**: Menyediakan pemesanan hidangan khas langsung dari dapur Nefakky tanpa perantara komisi yang memotong margin usaha.
* **Alamat Produksi Resmi**: Seluruh produk diproduksi secara otentik di lokasi terpusat: *Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Provinsi Jawa Barat, Indonesia*.
* **Google Stitch AI UI System**: Menerapkan skema warna resmi Google Stitch Palette (`#25160E` Espresso, `#3C2A21` Coffee, `#934B19` Terracotta, `#FFA26A` Soft Amber, `#FBF9F5` Warm Cream) untuk menghasilkan tampilan mewah, bersih, dan estetik.
* **Pemilihan 3 Varian Rasa Jus Interaktif 1 Halaman**: Khusus kategori Minuman Jus (`m6`), pengguna dapat memilih 3 varian rasa (*Mangga Aromanis, Sirsak Madu, Jambu Merah*) langsung dalam 1 halaman/modal yang sama dengan galeri dinamis tanpa berpindah tautan.
* **Live Camera Capture & Image Upload Modal**: Fitur kamera bawaan peramban (`LiveCameraModal`) untuk pengambilan foto ulasan kuliner atau bukti profil secara langsung dengan dukungan toggle kamera depan/belakang dan fallback unggah berkas.
* **Auto Map Picker & Preset Jabodetabek**: Modal pemeta lokasi GPS interaktif (`AutoMapPickerModal`) lengkap dengan opsi pencarian lokasi OpenStreetMap Nominatim, preset area populer Jabodetabek, dan kalkulasi otomatis jarak Haversine ke Dapur Pusat.
* **Pelacakan Status Pesanan Real-time 5-Tahap & Firebase RTDB Sync**: Menyediakan pelacakan status pesanan secara *live* (`1. Diterima` $\rightarrow$ `2. Dimasak` $\rightarrow$ `3. Siap` $\rightarrow$ `4. Diantar` $\rightarrow$ `5. Diterima Pelanggan`) yang tersinkronisasi otomatis via **Firebase Realtime Database** (`rtdb`), hitung mundur waktu estimasi real-time, tab navigasi antar-pesanan aktif, dan konfirmasi penerimaan dari pembeli.
* **Alur Checkout Multi-Step 4-Tahap & Midtrans Sandbox Simulator Engine**: Alur checkout terstruktur (`Cart` $\rightarrow$ `Checkout & GPS` $\rightarrow$ `Payment Midtrans` $\rightarrow$ `Success`) dengan token resmi Midtrans Snap dan panduan integrasi ke Midtrans Payment Simulator Sandbox.
* **Enterprise Admin Command Center & Export Engine**: Dashboard manajemen toko multi-tab (Dashboard KPI, Orders, Products, Promotions, Reviews, Settings, CS Chat) dilengkapi dengan generator ekspor laporan ke format Microsoft Excel (.xls/.csv), PDF, dan Print resmi (`exportUtils.ts`).
* **Analitik Penjualan Riil & Custom Grafik Manager**: Grafik tren omset kotor dan laba bersih yang dimulai dari Juni 2026 (Event Bazar >10 Juta) dengan fitur **Edit Data Grafik** per bulan dan modal input transaksi offline/POS manual yang detail.

---

## 2. Target Pengguna (User Personas)

### 2.1 Pelanggan (*Customer / Consumer*)
* **Profil**: Penikmat kuliner tradisional, pekerja kantoran, keluarga, atau mahasiswa yang membutuhkan pemesanan makanan berkualitas tinggi secara daring dengan jaminan kesegaran dan kecepatan pengiriman.
* **Kebutuhan Utama**:
  * Katalog menu interaktif dengan 3 kategori bersih (*Makanan Berat*, *Minuman*, *Menu Hemat*), rincian bahan, kalori, dan ketersediaan stok *live*.
  * Interaksi pemilihan 3 varian jus minuman (*Mangga, Sirsak, Jambu*) dalam 1 tampilan halaman.
  * Pemilihan lokasi pengiriman otomatis via GPS Pinpoint Map (**Auto Map Picker Modal**) atau preset area Jabodetabek.
  * Modul foto kamera langsung (**Live Camera Capture**) untuk ulasan hidangan dan profil.
  * Pembayaran digital aman via **Midtrans Snap Engine** (QRIS, GoPay, ShopeePay, Virtual Account BCA/Mandiri/BNI, Kartu Kredit).
  * Pelacakan status pengiriman 5-tahap secara *real-time* via **Firebase Realtime Database** (`rtdb`) dengan estimasi waktu tiba, tab switcher untuk multi-checkout, dan tombol konfirmasi terima barang.
  * Widget pelacak pesanan mengambang (*Floating Realtime Order Tracker*) di seluruh halaman.
  * Seksi **Riwayat Pemesanan Permanen** dan modal cetak **Struk Pembayaran Resmi (PDF)** via `window.print()`.
  * Live Chat CS interaktif *real-time* langsung dari halaman profil.

### 2.2 Administrator (*Admin / Store Manager*)
* **Profil**: Pemilik usaha (*Fatih Ahmad Zakky*) dan staf operasional toko yang mengelola persediaan menu, alur dapur pesanan, promosi, serta laporan keuangan harian.
* **Kebutuhan Utama**:
  * Dashboard analitik bisnis riil (Omset Kotor, Omset Bersih 40%, Total Pesanan, AOV, serta peringkat Makanan Terlaris & Kurang Laris).
  * Ekspor laporan lengkap ke Excel (.xls), CSV, dan PDF dengan kop resmi Nefakky.
  * Grafik omset penjualan yang dapat diedit secara langsung (*Edit Data Grafik Modal*) dan disimpan secara permanen.
  * Modal Input Omset Manual yang detail untuk penjualan offline/bazar dengan pemilihan multi-item menu terlaris & kurang laris.
  * Manajemen operasional dapur real-time (perubahan status `RECEIVED` $\rightarrow$ `COOKING` $\rightarrow$ `READY` $\rightarrow$ `SHIPPING` $\rightarrow$ `COMPLETED`).
  * Manajemen katalog produk secara fleksibel (CRUD, harga, stok, diskon, galeri foto, deskripsi, alamat produksi resmi, dan visibilitas).
  * Generator kode kupon voucher promo dengan batasan *Minimum Spend*, kuota penggunaan, dan fitur *Auto-Expire*.
  * Moderasi ulasan pelanggan (penyematan ulasan terbaik, balasan pesan ulasan, dan analisis sentimen).
  * Meja Pelayanan Live Customer Service (*CS Support Desk*) dengan notifikasi suara dan badge belum dibaca.

---

## 3. Lingkup Produk & Modul Fitur Utama (Product Scope & Features)

### 3.1 Modul Pelanggan (*Customer Facing*)

#### 1. Autentikasi & Pengelolaan Sesi (`AuthContext`)
* **Multi-Provider Auth**: Login & pendaftaran akun via Email/Password serta Google OAuth Single Sign-On (SSO).
* **Penanganan Error Terstruktur**: Pesan kegagalan login/registrasi yang informatif dalam Bahasa Indonesia.
* **Keamanan Sesi Lintas Tab**: Sinkronisasi status autentikasi secara otomatis antar-tab peramban.

#### 2. Katalog Produk 3 Kategori & Varian 3-Jus (`/menu` & `/page.tsx`)
* **3 Kategori Utama**: *Makanan Berat*, *Minuman*, dan *Menu Hemat*.
* **Varian 3-Jus 1 Halaman**: Dukungan pemilihan rasa jus (Mangga, Sirsak, Jambu) dengan visualisasi gambar utama & thumbnail instan.
* **Alamat Produksi Resmi**: Seluruh card produk menampilkan lokasi produksi terpusat: *Puri Bojong Lestari AF No 41, Bojong Gede, Bogor*.
* **Detail Modal Produk**: Menampilkan galeri foto produk high-res, daftar bahan utama, panduan konsumsi, asal hidangan, serta informasi nilai gizi.

#### 3. Checkout Multi-Step 4-Tahap & Auto Map Picker (`CartContext` & `/cart`)
* **Tahap 1 (Cart)**: Ringkasan porsi menu, klaim voucher promo diskon persentase, dan kalkulasi subtotal.
* **Tahap 2 (Checkout)**: Pengisian alamat penerima, lokasi GPS map via **Auto Map Picker Modal** (`AutoMapPickerModal.tsx`), catatan masakan dapur, dan rincian ongkir Haversine.
* **Tahap 3 (Payment Midtrans)**: Pembayaran eksklusif **Midtrans Snap Engine** (VA Bank, GoPay/ShopeePay, QRIS, Credit Card 3D Secure).
* **Tahap 4 (Success)**: Konfirmasi pembayaran berhasil dan tombol pelacakan live status.

#### 4. Live Camera Capture System (`LiveCameraModal.tsx`)
* **Akses Kamera Langsung**: Mengambil foto ulasan hidangan atau gambar profil secara *real-time* via `getUserMedia` Web API.
* **Toggle Kamera Front/Rear**: Pengalihan lensa kamera (`environment` / `user`).
* **Fallback Upload Berkas**: Opsi fleksibel unggah berkas foto dari penyimpanan lokal jika akses kamera ditolak.

#### 5. Pelacakan Pesanan Real-time 5-Tahap (`/notifications` & `RealtimeOrderTracker.tsx`)
* **Firebase Realtime Database (RTDB)**: Sinkronisasi status pesanan secara instan dari region `asia-southeast1`.
* **Visual Stepper Live 5-Tahap**: Progress bar bergerak (`RECEIVED` $\rightarrow$ `COOKING` $\rightarrow$ `READY` $\rightarrow$ `SHIPPING` $\rightarrow$ `COMPLETED`).
* **Multi-Order Selector Tabs**: Tab navigasi antar-pesanan jika pelanggan memiliki beberapa transaksi checkout aktif bersamaan.
* **Printable Receipt Modal**: Modal struk bukti pembayaran resmi Midtrans dengan tombol cetak PDF (`window.print()`).
* **Floating Mini-Tracker Widget**: Widget pemantau pesanan aktif mengambang di seluruh halaman pelanggan.

#### 6. Profil, Riwayat Pesanan & Live CS Chat (`/profile`)
* **Pengaturan Profil**: Edit identitas, nomor WhatsApp, alamat utama, dan avatar.
* **Riwayat Pesanan**: Daftar transaksi masa lalu lengkap dengan rincian pesanan dan tombol pesan ulang (*Re-order*).
* **Live CS Chat**: Ruang obrolan langsung dengan admin toko secara real-time via Firebase RTDB (`chat_messages`).

#### 7. Ulasan Rasa & Komentar Komunitas (`/comments`)
* **Feed Ulasan Kuliner**: Grid ulasan lengkap dengan filter rating bintang, foto bukti hidangan, dan balasan admin toko.
* **Helper Ulasan Otomatis (`reviews.ts`)**: Generator konteks ulasan rasa khas hidangan tradisional Nusantara.

---

### 3.2 Modul Administrator (*Admin Control Panel - /admin*)

#### 1. Dashboard Eksekutif & Editable Sales Chart (`AdminDashboardTab.tsx`)
* **5 Metrik KPI Utama**: Total Omset Kotor, Estimasi Margin Laba Bersih 40%, Total Pesanan Selesai, Average Order Value (AOV), dan Rating Kepuasan Pelanggan.
* **Grafik Omset Juni 2026**: Visualisasi omset kotor dan laba bersih yang dimulai dari Juni 2026 (Event Bazar >10 Juta).
* **Edit Data Grafik Modal**: Tombol `✏️ Edit Data Grafik` untuk mengubah nominal omset kotor, laba bersih, status event bazar, dan badge tooltip per bulan secara real-time.
* **Export Engine (`exportUtils.ts`)**: Tombol ekspor laporan lengkap ke Microsoft Excel (.xls) berformat resmi, CSV, dan PDF Print.

#### 2. Operasional Dapur & Manajemen Pesanan (`AdminOrdersTab.tsx`)
* **Kitchen Command Center**: Pengendalian status pengiriman 5-tahap (`RECEIVED` $\rightarrow$ `COOKING` $\rightarrow$ `READY` $\rightarrow$ `SHIPPING` $\rightarrow$ `COMPLETED`) dan pembayaran (`PAID`, `UNPAID`, `REFUNDED`).
* **Automatic RTDB Push**: Setiap perubahan status pesanan di-push ke node `live_orders/` di Realtime Database dan Laravel REST API.
* **Filter & Pencarian Pesanan**: Tab filter status pesanan dan modal rincian transaksi lengkap dengan fungsi cetak struk PDF.

#### 3. Manajemen Katalog Produk (`AdminProductsTab` / `/admin/products`)
* **Manajemen Produk (CRUD)**: Tambah, sunting harga, atur diskon persentase, kelola stok persediaan, ubah kategori, dan foto utama.
* **Alamat Produksi Terpusat**: Seluruh item terikat ke alamat resmi dapur pusat.

#### 4. Manajemen Promosi & Voucher Diskon (`AdminPromotionsTab.tsx`)
* **Voucher Manager**: Pengaturan kode voucher (cth: `WEEKENDSERU`), persentase diskon, syarat *Minimum Spend*, kuota penggunaan, dan tanggal berlaku.
* **Fitur Auto-Expiry**: Voucher otomatis berstatus *Expired* ketika batas kuota habis atau masa berlaku terlampaui.
* **Live Banner Preview**: Pratinjau visual banner promo yang akan ditampilkan di aplikasi pelanggan.

#### 5. Moderasi Ulasan & Testimoni Pelanggan (`AdminReviewsTab.tsx`)
* **Review Moderation**: Sematkan ulasan terbaik (*Pin Review*), balas ulasan pelanggan secara publik, dan sembunyikan/hapus ulasan tidak pantas.
* **Statistik Sentimen**: Distribusi bintang ulasan dan rekapitulasi kepuasan pembeli.

#### 6. Pengaturan Toko & Meja CS Chat (`AdminSettingsTab.tsx`)
* **Konfigurasi Restoran**: Pengaturan nama toko, jam operasional, nomor WhatsApp darurat, radius pengiriman, dan biaya ongkir dasar.
* **Customer Service Live Chat Desk**: Panel percakapan interaktif dengan pelanggan, indikator belum dibaca, dan notifikasi audio lonceng pesan masuk.

---

## 4. Arsitektur Teknologi & Struktur Project

### 4.1 Ringkasan Komponen Arsitektur
* **Frontend Application**: **Next.js 14 (App Router)**, React 18, Tailwind CSS v3, TypeScript (Strict Mode), Lucide React Icons.
* **UI Testing Suite**: **Storybook 10**, Vitest Browser Runner, Playwright Integration (`.storybook/`, `*.stories.tsx`).
* **Backend REST API**: **Laravel 12 REST API Framework** (PHP 8.2+) dengan arsitektur Model-View-Controller (MVC), Eloquent ORM, Seeders, dan Migrations terintegrasi.
* **Dual Database Architecture**:
  - **Firebase Cloud Firestore DB**: Penyimpanan dokumen persistent (Koleksi: `products`, `orders`, `vouchers`, `reviews`, `sales_reports`, `settings`, `chat_messages`).
  - **Firebase Realtime Database (RTDB)**: Low-latency real-time state sync (Region: `asia-southeast1`, node: `live_orders/`, `chat_messages/`).
* **Payment Gateway Engine**: **Midtrans Snap API** & Midtrans Payment Simulator Sandbox.
* **Geolocation & Geocoding Engine**: OpenStreetMap Nominatim Geocoding API & **Haversine Distance Formula**.

### 4.2 Struktur Direktori Proyek
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
    │   │       ├── orders/           # Tab Pesanan Masuk
    │   │       ├── products/         # Tab Katalog Produk
    │   │       ├── promotions/       # Tab Voucher & Promo
    │   │       ├── reviews/          # Tab Moderasi Ulasan
    │   │       └── settings/         # Tab Pengaturan & CS Desk
    │   ├── components/               # Reusable UI & Modal Components
    │   │   ├── admin/                # Komponen Khusus Admin (Dashboard, Orders, Promotions, Reviews, Settings, Header, Sidebar)
    │   │   ├── Navbar.tsx            # Header Navigation Bar
    │   │   ├── MenuDetailModal.tsx   # Modal Detail & 3-Jus Variant
    │   │   ├── AutoMapPickerModal.tsx# Modal Pemeta Lokasi GPS Haversine
    │   │   ├── LiveCameraModal.tsx   # Modal Tangkap Foto Kamera
    │   │   └── RealtimeOrderTracker.tsx # Floating Live Tracker Widget
    │   ├── context/                  # Global React State Providers
    │   │   ├── AuthContext.tsx       # Auth Firebase & Google SSO
    │   │   ├── CartContext.tsx       # Cart, Checkout & Ongkir State
    │   │   └── DataContext.tsx       # Dual Backend Data Sync
    │   └── lib/                      # Helper Utilities & API Clients
    │       ├── exportUtils.ts        # Excel, CSV, PDF Export Engine
    │       ├── firebase.ts           # Inisialisasi Firebase Cloud
    │       ├── laravelApi.ts         # REST Client Laravel Backend
    │       └── reviews.ts            # Helper Ulasan Rasa Indonesia
    ├── DESIGN.md                     # Master Design System Index
    ├── DESIGN_USER.md                # UI/UX Guideline Aplikasi Pelanggan
    ├── DESIGN_ADMIN.md               # UI/UX Guideline Admin Command Center
    ├── PRD.md                        # Product Requirement Document
    ├── README.md                     # Dokumentasi Utama Proyek
    └── TEST_REPORT.md                # Laporan Hasil Pengujian Otomatis
```

### 4.3 Dokumen Desain Terpisah
* 🛒 **[DESIGN_USER.md](file:///f:/UKK/nefakky3/DESIGN_USER.md)** — Spesifikasi UI/UX Lengkap Aplikasi Pelanggan.
* 🏢 **[DESIGN_ADMIN.md](file:///f:/UKK/nefakky3/DESIGN_ADMIN.md)** — Spesifikasi UI/UX Lengkap Enterprise Admin Command Center.
* 📑 **[DESIGN.md](file:///f:/UKK/nefakky3/DESIGN.md)** — Master Index Dokumentasi Desain.

---

## 5. Persyaratan Non-Fungsional (Non-Functional Requirements)

* **Performa (Performance)**: First Contentful Paint (FCP) $< 1.5$ detik, skor Google Lighthouse $> 90$, response time REST API $< 100$ ms.
* **Estetika UI/UX**: Google Stitch AI Design System dengan palet warna natural yang konsisten (`#25160E`, `#3C2A21`, `#934B19`, `#FFA26A`, `#FBF9F5`).
* **Keamanan (Security)**: Pengamanan API Key via `.env.local`, enkripsi 256-bit Midtrans Snap, HTTPS SSL, sanitasi input XSS, dan validasi server-side.
* **Ketahanan Data & Sinkronisasi Ganda (Resilience)**: Fallback otomatis antara Laravel REST API dan Firebase Cloud Database jika salah satu koneksi terputus.
* **Integritas Tipe (TypeScript Strict Mode)**: `npx tsc --noEmit` lulus 100% dengan 0 error kompilasi.
* **Aksesibilitas (A11y)**: Semantic HTML5, kontras warna WCAG AA, dan navigasi keyboard yang ramah pengguna.
