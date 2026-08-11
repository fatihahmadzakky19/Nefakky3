# Product Requirement Document (PRD) — Nefakky Marketplace

**Nama Produk**: Nefakky - Artisanal Food & Culinary Marketplace  
**Versi**: 1.4.0 (Python Django REST Framework & PBO Backend)  
**Tanggal Terakhir Diperbarui**: 7 Agustus 2026  
**Status**: Production / Live  
**Penulis / Team**: Tim Pengembang Nefakky (Fatih Ahmad Zakky)  

---

## 1. Ringkasan Eksekutif & Visi Produk

### 1.1 Visi Produk
**Nefakky** adalah platform *artisanal e-commerce* dan marketplace kuliner premium berteknologi tinggi yang dirancang untuk mengintegrasikan penikmat kuliner (*epicureans*) dengan hidangan tradisional khas Indonesia berkualitas tinggi. Platform ini menggabungkan pengalaman belanja digital yang hangat, estetik, dan responsif dengan integrasi gerbang pembayaran *real-time* (**Midtrans Snap API**), pemetaan lokasi pengiriman otomatis berbasis GPS (**Nominatim / Haversine Distance Engine**), sinkronisasi database awan *real-time* (**Firebase Cloud Firestore DB**), serta sistem pengelolaan operasional toko terpadu.

### 1.2 Tujuan Utama & Value Proposition
* **Direct-to-Consumer (D2C) Premium**: Menyediakan pemesanan hidangan khas langsung dari dapur Nefakky tanpa perantara komisi yang memotong margin usaha.
* **Tampilan Minimalis & Nyaman Dipandang**: Menerapkan skema **4 Warna Utama Natural** (`#5C3D28` Espresso, `#8A6337` Soft Gold, `#2D231C` Dark Charcoal, `#FAF8F5` Warm Cream) untuk menghasilkan tampilan elegan, bersih, dan bebas dari kesan buatan AI.
* **Pelacakan Status Pesanan Real-time 5-Tahap**: Menyediakan pelacakan status pesanan secara *live* (`1. Diterima` $\rightarrow$ `2. Dimasak` $\rightarrow$ `3. Siap` $\rightarrow$ `4. Diantar` $\rightarrow$ `5. Diterima Pelanggan`) dengan penghitung detik berjalan (*ticking timer*), sinyal pendar live, dan konfirmasi penerimaan dari pembeli.
* **Analitik Penjualan Riil berbasis Transaksi Web**: Menghitung peringkat *Menu Terlaris (Best Seller)* dan *Menu Kurang Laris (Slow Moving)* secara otomatis murni dari riwayat pesanan web pengguna.
* **Keamanan & Sinkronisasi Sesi Berkelanjutan**: Menjamin integritas data akun melalui Firebase Authentication (Email/Password & Google OAuth), validasi sesi lintas tab (*Cross-Tab Sync*), dan proteksi sesi lokal.

---

## 2. Target Pengguna (User Personas)

### 2.1 Pelanggan (*Customer / Consumer*)
* **Profil**: Penikmat kuliner tradisional, pekerja kantoran, keluarga, atau mahasiswa yang membutuhkan pemesanan makanan berkualitas tinggi secara daring dengan jaminan kesegaran dan kecepatan pengiriman.
* **Kebutuhan Utama**:
  * Katalog menu interaktif dengan pencarian instan, rincian bahan, kalori, dan ketersediaan stok *live*.
  * Pemilihan lokasi pengiriman otomatis via GPS Pinpoint Map atau preset area Jabodetabek.
  * Beragam pilihan pembayaran digital aman (QRIS, GoPay, ShopeePay, Virtual Account BCA/Mandiri/BNI, Kartu Kredit).
  * Pelacakan status pengiriman 5-tahap secara *real-time* dengan estimasi waktu tiba dan tombol konfirmasi terima barang.
  * Sistem ulasan Bahasa Indonesia yang relevan dengan keaslian rasa produk.
  * Layanan obrolan bantuan pelanggan (*Live Chat CS Support*) yang terhubung langsung ke tim admin resto.

### 2.2 Administrator (*Admin / Store Manager*)
* **Profil**: Pemilik usaha (*Fatih Ahmad Zakky*) dan staf operasional toko yang mengelola persediaan menu, alur dapur pesanan, promosi, serta layanan pelanggan harian.
* **Kebutuhan Utama**:
  * Dashboard analitik bisnis riil (Omset Kotor, Omset Bersih 40%, Total Pesanan, AOV, serta peringkat Makanan Terlaris & Kurang Laris).
  * Manajemen katalog produk secara fleksibel (CRUD, harga, stok, diskon, galeri foto, deskripsi, dan visibilitas).
  * Pengendalian alur pesanan masuk dan perubahan status pengiriman 5-tahap.
  * Generator kode kupon voucher promo dengan batasan *Minimum Spend* dan kuota penggunaan.
  * Moderasi ulasan pengguna (pinning ulasan unggulan, sembunyikan/tampilkan ulasan).
  * Pusat layanan obrolan pelanggan (*Admin Customer Service Desk*).

---

## 3. Lingkup Produk & Modul Fitur Utama (Product Scope & Features)

### 3.1 Modul Pelanggan (*Customer Facing*)

#### 1. Autentikasi & Pengelolaan Sesi (`AuthContext`)
* **Multi-Provider Auth**: Login & pendaftaran akun via Email/Password serta Google OAuth Single Sign-On (SSO).
* **Penanganan Error Terstruktur**: Pesan kegagalan login/registrasi yang informatif dalam Bahasa Indonesia.
* **Keamanan Sesi Lintas Tab**: Sinkronisasi status autentikasi secara otomatis antar-tab peramban menggunakan `StorageEvent` listener dan Firebase `onAuthStateChanged`.
* **Hak Akses Berbasis Peran (RBAC)**: Pemisahan peran secara tegas antara `admin` (`fatihahmadzakky19@gmail.com`) dan `customer`.

#### 2. Katalog Produk & Hero Showcase Dinamis (`/menu` & `/page.tsx`)
* **Dynamic Hero Slides**: Slider promo utama di halaman depan mengambil data produk secara dinamis langsung dari database Firestore (`visibleProducts`).
* **Filtering & Instant Search**: Filter kategori (*Makanan Utama*, *Menu Hemat*, *Minuman*, *Cemilan*) dan pencarian nama produk *real-time*.
* **Detail Modal produk**: Menampilkan galeri foto produk high-res, daftar bahan utama, panduan konsumsi, asal hidangan, serta informasi nilai gizi (kalori, lemak, gula).

#### 3. Keranjang Belanja & Kalkulator Promo (`CartContext` & `/cart`)
* **User-Scoped Storage**: Keranjang disimpan terpisah berdasarkan UID pengguna (`nefakky_cart_${user.uid}`) di `localStorage` peramban.
* **Kalkulasi Biaya Transparan**: Perhitungan Subtotal Makanan, Biaya Pengiriman (bukan pajak), dan Potongan Kupon Promo secara tepat.
* **Sistem Voucher Promo**: Input kode voucher diskon (seperti `WEEKENDSERU` 30%) dengan validasi syarat transaksi minimum (*Minimum Spend*).

#### 4. Penentuan Lokasi Pengiriman & Haversine Engine (`AutoMapPickerModal`)
* **Auto-Detect GPS**: Deteksi koordinat posisi presisi pelanggan menggunakan Web Geolocation API.
* **Preset Area Jabodetabek**: Pilihan lokasi populer (Senayan/SCBD, Menteng, Kemang, Pondok Indah, Kelapa Gading, BSD City).
* **Kalkulator Jarak Haversine**: Perhitungan jarak tempuh otomatis dari lokasi Dapur Pusat Nefakky untuk penentuan durasi dan batas pengiriman.

#### 5. Integrasi Midtrans Payment Gateway (`/api/midtrans/token`)
* **Modal Interaktif Snap**: Integrasi pembayaran seamless tanpa meninggalkan aplikasi.
* **Dukungan Metode Pembayaran**: QRIS Instan, Virtual Account Bank (BCA, Mandiri, BNI, BRI), E-Wallet (GoPay, ShopeePay), dan Credit Card.

#### 6. Pelacakan Pesanan Real-time 5-Tahap (`RealtimeOrderTracker.tsx`)
* **Visual Stepper Live**: Menampilkan progress bar bergerak (*20% Diterima* $\rightarrow$ *40% Dimasak* $\rightarrow$ *60% Siap* $\rightarrow$ *80% Diantar* $\rightarrow$ *100% Selesai*).
* **Efek Glowing Pulse & Live Timer**: Titik pendar animasi pada tahap aktif dan detik waktu pemrosesan berjalan (*+01:25*).
* **Konfirmasi Terima Barang**: Tombol konfirmasi penerimaan pesanan oleh pelanggan yang otomatis memperbarui status menjadi `COMPLETED`.

#### 7. Sistem Ulasan Cita Rasa Indonesia (`/comments` & `reviews.ts`)
* **Review Generator Khas Indonesia**: Ulasan kontekstual yang disesuaikan dengan cita rasa khusus hidangan (*Ayam Bakar, Gudeg, Nasi Bakar, Krecek, Garang Asam, Jus*).
* **Penilaian Bintang (1-5)**: Pengiriman ulasan beserta skor bintang, lampiran foto bukti pembelian, dan badge pembeli terverifikasi.

#### 8. Layanan Live Chat CS Support
* **Komunikasi Langsung**: Obrolan interaktif pengguna dengan Tim CS Admin untuk pertanyaan menu atau kustomisasi pesanan.

---

### 3.2 Modul Administrator (*Admin Control Panel - /admin*)
## 1. Ringkasan Eksekutif & Visi Produk (Executive Summary)

**Nefakky Marketplace** adalah platform kuliner *artisanal* berbasis web modern yang menghadirkan pengalaman pemesanan makanan dan minuman tradisional/moderen dengan estetika visual tinggi, fitur pelacakan *real-time*, peta lokasi interaktif GPS, kalkulasi jarak delivery presisi, generator kupon promo otomatis, serta integrasi *payment gateway* digital (Midtrans Snap Engine).

Aplikasi ini mengadopsi arsitektur **Clean Code & PBO (Pemrograman Berbasis Objek)** pada backend **Python 3 & Django 5 (Django REST Framework)**, menggunakan **Firebase Cloud Firestore DB** sebagai database NoSQL cloud terpusat, dan **Next.js 14 App Router** pada sisi frontend UI/UX.

---

## 2. Palet Warna & Spesifikasi Desain (Visual & Brand Guidelines)

| Nama Warna | Kode Hex | Peran & Penggunaan Desain UI |
| :--- | :--- | :--- |
| **Espresso Brown** | `#5C3D28` | Warna Utama (Primary Brand Color), Tombol Utama, Header Active Tab, Banner Accent. |
| **Warm Gold / Ochre** | `#8A6337` | Accent Highlight, Rating Stars, Lencana Promo/Diskon, Status In-Progress. |
| **Dark Charcoal** | `#2D231C` | Text Headers (H1-H6), Body Text, Dark Card Backgrounds. |
| **Warm Off-White / Cream** | `#FAF8F5` | Background Aplikasi Utama (Body BG), Card Fill Soft Contrast. |

---

## 3. Fitur Utama & Kebutuhan Fungsional (Functional Requirements)

#### 1. Katalog Produk Interaktif & Filter Kategori
* **Kategori Dinamis**: *Semua*, *Makanan Utama*, *Camilan*, *Minuman*, *Spesial Resto*.
* **Opsi Penyaringan & Pencarian**: Pencarian kata kunci real-time, filter rentang harga, dan pengurutan (*Terpopuler*, *Harga Terendah*, *Rating Tertinggi*).
* **Modal Detail Nutrisi & Bahan**: Menampilkan rincian bahan-bahan (*ingredients*), petunjuk konsumsi, serta kandungan gizi (Kalori, Lemak, Gula).

#### 2. Dashboard Analitik Admin & Menu Terlaris vs Kurang Laris
* **Ringkasan Performa**: Total Omset Penjualan (Rp), Total Transaksi, Produk Aktif, dan Jumlah Ulasan.
* **Menu Terlaris (Top Seller)**: Visualisasi porsi makanan paling diminati konsumen berdasarkan data transaksi riil.
* **Menu Kurang Laris (Slow Moving)**: Produk dengan porsi terjual terendah di web yang dilengkapi opsi tombol instan **`+ Buat Promo`**.

#### 3. Manajemen Katalog Produk (CRUD) & Stok
* **Penyuntingan Lengkap**: Tambah produk baru, ubah nama, harga, persentase diskon, tingkat stok, deskripsi, nilai gizi, galeri gambar, dan visibilitas.
* **Kelengkapan 6 Produk Utama**: Terdiri dari *Ayam Bakar Rempah*, *Nasi Bakar Cumi*, *Krecek Pedas*, *Gudeg Jogja*, *Garang Asam*, dan *Jus Segar*.

---

## 4. Arsitektur Teknologi & Struktur Project (System Architecture)

### 4.1 Ringkasan Komponen Utama
* **Frontend**: **Next.js 14 (App Router)**, React 18, Tailwind CSS v3, TypeScript (Strict Mode), Lucide React Icons.
* **Backend PBO & Functions**: **Python 3.13 & Django 5.2 (Django REST Framework)** dengan Standalone Helper Functions (`utils.py`), Class-Based Views (CBVs), Service Classes (`services.py`), & Model Encapsulation (`models.py`).
* **Database & Cloud Utama**: **Firebase Cloud Firestore DB (NoSQL Document Store)** dengan 6 Koleksi Real-Time Sync (`onSnapshot`) yang diakses langsung oleh Frontend Next.js dan Backend Python Django.

### 4.2 Rincian Arsitektur Per Lapisan

| Lapisan Arsitektur | Teknologi / Module | Fungsi & Deskripsi Teknis |
| :--- | :--- | :--- |
| **Frontend UI/UX** | Next.js 14 App Router, Tailwind CSS v3 | User Interface responsif dengan Palet 4 Warna Warm, SSR & Hydration instan. |
| **Frontend State** | React Context API & LocalStorage | Pengelolaan state terpusat (`AuthContext`, `CartContext`, `DataContext`) & presistensi user-scoped storage. |
| **Backend REST API (PBO)**| Python 3 & Django REST Framework (`backend_django/`) | Layanan REST API berbasis PBO/OOP (`ProductViewSet`, `OrderViewSet`, `VoucherViewSet`, `ReviewViewSet`, `MidtransSnapTokenView`). |
| **Standalone Functions** | `backend_django/api/utils.py` | Modul fungsi terpisah (`format_rupiah_currency`, `calculate_haversine_distance`, `validate_voucher_rules`, `calculate_estimated_delivery_time`). |
| **Database Utama** | Firebase Cloud Firestore DB | Database NoSQL cloud utama terpusat untuk katalog produk, transaksi pesanan 5-tahap, voucher, dan ulasan. |
| **Backend Firestore Sync**| OOP Class `FirebaseFirestoreSyncService` | Service Class Singleton (PBO) & Django Signals (`signals.py`) untuk sinkronisasi otomatis ke Cloud Firestore. |
| **Backend Payment Service**| OOP Class `MidtransPaymentService` | Meng-generate Token Pembayaran Snap Midtrans secara aman via Python Requests SDK. |
| **Backend Distance Engine**| OOP Class `HaversineDistanceCalculator` | Algoritma matematis Haversine terenkapsulasi untuk kalkulasi jarak GPS pengiriman. |
| **Backend Autentikasi** | Firebase Auth v10 SDK & Django Auth | Layanan Auth Email/Password & Google OAuth Single Sign-On (SSO) terintegrasi. |
| **Pengujian Otomatis** | Automated Test Runner (`scripts/run-tests.mjs`) | Penguji 6 modul sistem (Compiler TS, Rute, Katalog, Ulasan, Promo, Firebase) & pembuat `TEST_REPORT.md`. |

---

### 4.3 Struktur Direktori Project (Directory Tree Structure)

```
nefakky3/
├── backend_django/            # Backend REST API (Python & Django 5)
│   ├── api/                   # Django App (OOP Models, Views, Serializers, Services, Utils)
│   │   ├── management/        # Command Seed Data (seed_data.py)
│   │   ├── admin.py           # Admin Site Registration
│   │   ├── apps.py            # App Config & Signal Registration
│   │   ├── firebase_service.py # OOP Service Singleton untuk Firebase Firestore DB
│   │   ├── models.py          # Class Model OOP (ProductItem, AdminOrder, AdminVoucher)
│   │   ├── serializers.py     # DRF Serializers
│   │   ├── services.py        # Class Service (BasePaymentService, MidtransPaymentService, HaversineDistanceCalculator)
│   │   ├── signals.py         # Django Event Signals untuk Real-time Firebase Sync
│   │   ├── urls.py            # API URL Routing
│   │   ├── utils.py           # Standalone Helper Functions (Rupiah, Haversine, Voucher Rules)
│   │   └── views.py           # Class-Based Views (CBVs)
│   ├── nefakky_backend/       # Django Main Project Config (settings.py, urls.py, wsgi.py)
│   ├── db.sqlite3             # Local SQLite Cache DB
│   ├── manage.py              # Django CLI Runner
│   └── requirements.txt       # Dependencies Python (Django, DRF, firebase-admin, requests)
├── public/                    # Static Assets (Foto Makanan, Logo, Favicon)
│   ├── images/                # Ayam Bakar, Gudeg, Nasi Bakar, Krecek, Garang Asam, Jus
│   └── favicon.ico
├── scripts/                   # Automated Testing Scripts
│   └── run-tests.mjs          # Test Runner Node ESM (npm test)
├── src/                       # Next.js 14 Frontend Application
│   ├── app/                   # App Router Pages & Routes
│   │   ├── admin/             # Panel Kontrol Admin (Dashboard Analitik, Stok, Promo, Order)
│   │   │   └── page.tsx
│   │   ├── api/               # Next.js Client Proxy API Endpoints
│   │   ├── cart/              # Halaman Checkout Keranjang & Lokasi GPS
│   │   │   └── page.tsx
│   │   ├── comments/          # Halaman Ulasan Pelanggan Bahasa Indonesia
│   │   │   └── page.tsx
│   │   ├── menu/              # Katalog Produk & Filtering Kategori
│   │   │   ├── [id]/          # Detail Route Produk
│   │   │   └── page.tsx
│   │   ├── notifications/     # Halaman Pelacakan Pesanan Real-time
│   │   │   └── page.tsx
│   │   ├── profile/           # Halaman Profil User & Histori Belanja
│   │   │   └── page.tsx
│   │   ├── globals.css        # Global CSS, Font Imports, & Custom Tailwind Classes
│   │   ├── layout.tsx         # Root Layout Wrapper (Providers & Navbar)
│   │   └── page.tsx           # Halaman Utama (Hero Showcase & Dynamic Slides)
│   ├── components/            # Reusable UI Components
│   │   ├── AutoMapPickerModal.tsx  # Modal Map GPS Auto-Detect & Pinpoint
│   │   ├── MenuDetailModal.tsx     # Modal Detail Nutrisi, Bahan, & Konsumsi Makanan
│   │   ├── Navbar.tsx              # Header Navigation Bar & Profile Avatar
│   │   └── RealtimeOrderTracker.tsx # Component Pelacak Status Pesanan 5-Tahap Live
│   ├── context/               # Global Context State Providers
│   │   ├── AuthContext.tsx    # State Autentikasi Firebase User & Role Admin
│   │   ├── CartContext.tsx    # State Keranjang Belanja Per-User LocalStorage
│   │   └── DataContext.tsx    # State Realtime Firestore DB (6 Koleksi)
│   └── lib/                   # Utility Libraries & Configuration
│       ├── firebase.ts        # Inisialisasi Firebase App, Auth, & Firestore DB
│       └── reviews.ts         # Indonesian Review Engine Generator
├── .env.local                 # Environment Variables (API Keys Firebase & Midtrans)
├── DESIGN.md                  # Dokumentasi Design System & Tokens
├── PRD.md                     # Product Requirement Document (v1.3.0)
├── TEST_REPORT.md             # Laporan Pengujian Otomatis (Autogenerated)
├── package.json               # Node Package Dependencies & Scripts
├── tailwind.config.ts         # Konfigurasi Styling Tailwind CSS
└── tsconfig.json              # Konfigurasi TypeScript Strict Mode
```

---

## 5. Sinkronisasi Database Real-Time Firebase Firestore

Data terhubung secara *live* melalui 6 koleksi utama di Cloud Firestore (`db`):

```
firebase-root/
├── products/          # Koleksi Katalog Makanan, Stok, Harga, Visibilitas
├── orders/            # Koleksi Transaksi Pesanan, Midtrans Badge, & Status 5-Tahap
├── promotions/        # Koleksi Event Banner Promo & Diskon
├── vouchers/          # Koleksi Kode Voucher Belanja (minSpend, discountPercent)
├── reviews/           # Koleksi Ulasan & Penilaian Bintang 1-5 Bahasa Indonesia
└── chat_messages/     # Koleksi Obrolan Live Chat CS Support
```

Setiap perubahan di Admin atau Pelanggan akan menyalurkan sinyal *real-time* via `onSnapshot` tanpa memerlukan penyegaran ulang (*page refresh*).

---

## 6. Persyaratan Non-Fungsional (Non-Functional Requirements)

* **Performa (Performance)**: First Contentful Paint (FCP) $< 1.5$ detik, skor Google Lighthouse $> 90$.
* **Estetika UI/UX**: Desain *human-crafted* bebas kesan buatan AI dengan typography Inter & Playfair Display yang hangat.
* **Keamanan (Security)**: Pengamanan API Key via environment variables (`.env.local`), pembatasan endpoint server API Midtrans, dan HTTPS SSL terenkripsi.
* **Aksesibilitas (A11y)**: Memenuhi standar WCAG 2.1 Level AA (kontras warna tinggi, ARIA labels, navigasi keyboard).

---

## 7. Indikator Keberhasilan Bisnis (KPIs)

1. **Rasio Konversi Checkout**: $> 15\%$ penjelajah halaman menu berhasil melakukan checkout pesanan.
2. **Keberhasilan Pembayaran**: $> 95\%$ transaksi via Midtrans Snap terselesaikan tanpa kegagalan teknis.
3. **Retensi Pelanggan**: $> 35\%$ pelanggan melakukan pemesanan ulang (*Repeat Order*) dalam jangka 30 hari.
4. **Respon CS Admin**: Waktu tanggap rata-rata pesan chat pelanggan $< 5$ menit.
