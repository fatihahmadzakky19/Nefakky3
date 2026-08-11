# Product Requirement Document (PRD) — Nefakky Marketplace

**Nama Produk**: Nefakky - Artisanal Food & Culinary Marketplace  
**Versi**: 2.5.0 (Google Stitch AI UI System & Enterprise Realtime Analytics)  
**Tanggal Terakhir Diperbarui**: 11 Agustus 2026  
**Status**: Production / Live  
**Penulis / Team**: Tim Pengembang Nefakky (Fatih Ahmad Zakky)  

---

## 1. Ringkasan Eksekutif & Visi Produk

### 1.1 Visi Produk
**Nefakky** adalah platform *artisanal e-commerce* dan marketplace kuliner premium berteknologi tinggi yang dirancang untuk mengintegrasikan penikmat kuliner (*epicureans*) dengan hidangan tradisional khas Indonesia berkualitas tinggi. Platform ini menggabungkan pengalaman belanja digital yang hangat, estetik, dan responsif dengan integrasi gerbang pembayaran *real-time* eksklusif (**Midtrans Snap API**), pemetaan lokasi pengiriman otomatis berbasis GPS (**Nominatim / Haversine Distance Engine**), sinkronisasi database awan *real-time* (**Firebase Cloud Firestore DB**), serta sistem pengelolaan operasional toko terpadu.

### 1.2 Tujuan Utama & Value Proposition
* **Direct-to-Consumer (D2C) Premium**: Menyediakan pemesanan hidangan khas langsung dari dapur Nefakky tanpa perantara komisi yang memotong margin usaha.
* **Google Stitch AI UI System**: Menerapkan skema warna resmi Google Stitch Palette (`#25160E` Espresso, `#3C2A21` Coffee, `#934B19` Terracotta, `#FBF9F5` Warm Cream) untuk menghasilkan tampilan mewah, bersih, dan estetik.
* **Pelacakan Status Pesanan Real-time 5-Tahap & Multi-Order Switcher**: Menyediakan pelacakan status pesanan secara *live* (`1. Diterima` $\rightarrow$ `2. Dimasak` $\rightarrow$ `3. Siap` $\rightarrow$ `4. Diantar` $\rightarrow$ `5. Diterima Pelanggan`) dengan hitung mundur waktu estimasi real-time, tab navigasi antar-pesanan aktif, dan konfirmasi penerimaan dari pembeli.
* **Alur Checkout Multi-Step 4-Tahap**: Alur checkout terstruktur (`Cart` $\rightarrow$ `Checkout` $\rightarrow$ `Payment Midtrans` $\rightarrow$ `Success`) dengan formula ongkir presisi berbasis jarak (15% subtotal untuk $\le$ 3km + Rp 1.500 per 2km untuk $> 3$km).
* **Analitik Penjualan Riil & Custom Grafik Manager**: Grafik tren omset kotor dan bersih yang dimulai dari Juni 2026 (Event Bazar >10 Juta) dengan fitur **Edit Data Grafik** per bulan dan input transaksi offline manual yang detail.

---

## 2. Target Pengguna (User Personas)

### 2.1 Pelanggan (*Customer / Consumer*)
* **Profil**: Penikmat kuliner tradisional, pekerja kantoran, keluarga, atau mahasiswa yang membutuhkan pemesanan makanan berkualitas tinggi secara daring dengan jaminan kesegaran dan kecepatan pengiriman.
* **Kebutuhan Utama**:
  * Katalog menu interaktif dengan 3 kategori bersih (*Makanan Berat*, *Minuman*, *Menu Hemat*), rincian bahan, kalori, dan ketersediaan stok *live*.
  * Pemilihan lokasi pengiriman otomatis via GPS Pinpoint Map atau preset area Jabodetabek.
  * Pembayaran digital aman via **Midtrans Snap Engine** (QRIS, GoPay, ShopeePay, Virtual Account BCA/Mandiri/BNI, Kartu Kredit).
  * Pelacakan status pengiriman 5-tahap secara *real-time* dengan estimasi waktu tiba, tab switcher untuk multi-checkout, dan tombol konfirmasi terima barang.
  * Seksi **Riwayat Pemesanan Permanen** dan modal cetak **Struk Pembayaran Resmi (PDF)**.
  * Sistem ulasan Bahasa Indonesia yang relevan dengan keaslian rasa produk.

### 2.2 Administrator (*Admin / Store Manager*)
* **Profil**: Pemilik usaha (*Fatih Ahmad Zakky*) dan staf operasional toko yang mengelola persediaan menu, alur dapur pesanan, promosi, serta laporan keuangan harian.
* **Kebutuhan Utama**:
  * Dashboard analitik bisnis riil (Omset Kotor, Omset Bersih 40%, Total Pesanan, AOV, serta peringkat Makanan Terlaris & Kurang Laris).
  * Grafik omset penjualan yang dapat diedit secara langsung (*Edit Data Grafik Modal*) dan disimpan secara permanen.
  * Modal Input Omset Manual yang detail untuk penjualan offline/bazar dengan pemilihan multi-item menu terlaris & kurang laris.
  * Manajemen katalog produk secara fleksibel (CRUD, harga, stok, diskon, galeri foto, deskripsi, dan visibilitas).
  * Pengendalian alur pesanan masuk dan perubahan status pengiriman 5-tahap.
  * Generator kode kupon voucher promo dengan batasan *Minimum Spend* dan kuota penggunaan.

---

## 3. Lingkup Produk & Modul Fitur Utama (Product Scope & Features)

### 3.1 Modul Pelanggan (*Customer Facing*)

#### 1. Autentikasi & Pengelolaan Sesi (`AuthContext`)
* **Multi-Provider Auth**: Login & pendaftaran akun via Email/Password serta Google OAuth Single Sign-On (SSO).
* **Penanganan Error Terstruktur**: Pesan kegagalan login/registrasi yang informatif dalam Bahasa Indonesia.
* **Keamanan Sesi Lintas Tab**: Sinkronisasi status autentikasi secara otomatis antar-tab peramban.

#### 2. Katalog Produk 3 Kategori (`/menu` & `/page.tsx`)
* **3 Kategori Utama**: *Makanan Berat*, *Minuman*, dan *Menu Hemat*.
* **Dynamic Hero Showcase**: Slider promo utama di halaman depan mengambil data produk secara dinamis langsung dari database Firestore (`visibleProducts`).
* **Detail Modal Produk**: Menampilkan galeri foto produk high-res, daftar bahan utama, panduan konsumsi, asal hidangan, serta informasi nilai gizi.

#### 3. Checkout Multi-Step 4-Tahap (`CartContext` & `/cart`)
* **Tahap 1 (Cart)**: Ringkasan porsi menu, klaim voucher promo diskon persentase, dan subtotal.
* **Tahap 2 (Checkout)**: Pengisian alamat penerima, lokasi GPS map, catatan masakan dapur, dan rincian ongkir.
* **Tahap 3 (Payment Midtrans)**: Pembayaran eksklusif **Midtrans Snap Engine** (VA Bank, GoPay/ShopeePay, QRIS, Credit Card 3D Secure).
* **Tahap 4 (Success)**: Konfirmasi pembayaran berhasil dan tombol pelacakan live status.

#### 4. Formula Biaya Pengiriman Transparan
* **Jarak $\le 3$ km**: $15\% \times \text{Subtotal Makanan}$.
* **Jarak $> 3$ km**: $(15\% \times \text{Subtotal Makanan}) + (\lceil (\text{Jarak} - 3) / 2 \rceil \times \text{Rp } 1.500)$.
* **Biaya Layanan**: Rp 0 (Gratis tanpa tambahan biaya tersembunyi).

#### 5. Pelacakan Pesanan Real-time & Multi-Order Switcher (`/notifications`)
* **Visual Stepper Live 5-Tahap**: Progress bar bergerak (`RECEIVED` $\rightarrow$ `COOKING` $\rightarrow$ `READY` $\rightarrow$ `SHIPPING` $\rightarrow$ `COMPLETED`).
* **Hitung Mundur Estimasi Live**: Timer detik berjalan mundur secara real-time.
* **Multi-Order Selector Tabs**: Tab navigasi antar-pesanan jika pelanggan memiliki beberapa transaksi checkout aktif bersamaan.
* **Konfirmasi Terima Pesanan**: Tombol konfirmasi mandiri oleh pelanggan yang mengubah status pesanan menjadi `COMPLETED`.

#### 6. Riwayat Pemesanan & Struk Pembayaran PDF (`/notifications`)
* **Tersimpan Permanen**: Seluruh transaksi tersimpan di database Firestore real-time.
* **Modal Struk Pembayaran Resmi**: Struk transaksi resmi Midtrans dengan rincian biaya lengkap dan tombol cetak PDF (`window.print()`).

---

### 3.2 Modul Administrator (*Admin Control Panel - /admin*)

#### 1. Real-Time Sales Chart & Custom Editor Modal
* **Grafik Omset Juni 2026**: Visualisasi omset kotor dan laba bersih yang dimulai dari Juni 2026 (Event Bazar >10 Juta).
* **Edit Data Grafik Modal**: Tombol `✏️ Edit Data Grafik` untuk mengubah nominal omset kotor, laba bersih, status event bazar, dan badge tooltip per bulan secara real-time.

#### 2. Modal Input Omset Manual (Offline / Bazar Sales)
* **Pilihan Produk Katalog Presisi**: Mengambil langsung harga katalog toko.
* **Multi-Select Best & Slow Sellers**: Checkbox pill multi-pilihan untuk menentukan lebih dari 1 menu paling laris dan kurang laris pada penjualan manual.

#### 3. Manajemen Operasional Lengkap (CRUD, Orders, Vouchers, Reviews)
* **Order Command Center**: Pengendalian status pengiriman 5-tahap dan pembayaran (`PAID`, `UNPAID`, `REFUNDED`).
* **Katalog Produk CRUD**: Tambah/edit menu, persediaan stok, dan visibilitas.
* **Promotions & Vouchers**: Generator voucher promo diskon dan pembatasan minimal belanja.
* **Moderasi Ulasan**: Penyematan ulasan unggulan (*Pinning*) dan balasan ulasan.

---

## 4. Arsitektur Teknologi & Struktur Project

### 4.1 Ringkasan Komponen Utama
* **Frontend**: **Next.js 14 (App Router)**, React 18, Tailwind CSS v3, TypeScript (Strict Mode), Lucide React Icons.
* **Backend REST API**: **Python 3 & Django 5 (Django REST Framework)** dengan Standalone Helper Functions (`utils.py`), Class-Based Views (CBVs), Service Classes (`services.py`), & Model Encapsulation (`models.py`).
* **Database & Cloud Utama**: **Firebase Cloud Firestore DB (NoSQL Document Store)** dengan 6 Koleksi Real-Time Sync (`onSnapshot`).
* **Payment Engine**: **Midtrans Snap Payment Gateway API**.

### 4.2 Struktur Direktori Project

```
nefakky3/
├── backend_django/            # Backend REST API (Python & Django 5)
├── public/                    # Static Assets (Foto Makanan, Logo, Favicon)
├── scripts/                   # Automated Testing Scripts (run-tests.mjs)
├── src/                       # Next.js 14 Frontend Application
│   ├── app/                   # App Router Pages & Routes
│   │   ├── admin/             # Panel Kontrol Admin (Dashboard, Editable Chart, Omset Manual)
│   │   ├── cart/              # Halaman 4-Step Checkout & Midtrans Payment
│   │   ├── comments/          # Halaman Ulasan Pelanggan Bahasa Indonesia
│   │   ├── menu/              # Katalog Produk 3 Kategori & Filtering
│   │   ├── notifications/     # Lacak Status Realtime, Multi-Order Switcher, & Struk PDF
│   │   ├── profile/           # Halaman Profil User & CS Support
│   │   ├── globals.css        # Global CSS & Google Stitch Tokens
│   │   ├── layout.tsx         # Root Layout Wrapper
│   │   └── page.tsx           # Halaman Utama (Hero Showcase & 3 Kategori)
│   ├── components/            # Reusable UI Components
│   │   ├── AutoMapPickerModal.tsx  # Modal Map GPS Auto-Detect & Pinpoint
│   │   ├── MenuDetailModal.tsx     # Modal Detail Nutrisi, Bahan, & Konsumsi Makanan
│   │   └── Navbar.tsx              # Header Navigation Bar & Profile Avatar Pill
│   ├── context/               # Global Context State Providers
│   │   ├── AuthContext.tsx    # State Autentikasi Firebase User & Admin Role
│   │   ├── CartContext.tsx    # State Keranjang Belanja Per-User LocalStorage
│   │   └── DataContext.tsx    # State Realtime Firestore DB (6 Koleksi)
│   └── lib/                   # Utility Libraries & Configuration
├── .env.local                 # Environment Variables
├── DESIGN.md                  # Dokumentasi Design System Google Stitch
├── PRD.md                     # Product Requirement Document (v2.5.0)
├── TEST_REPORT.md             # Laporan Pengujian Otomatis (Autogenerated)
└── package.json               # Node Package Dependencies & Scripts
```

---

## 5. Persyaratan Non-Fungsional (Non-Functional Requirements)

* **Performa (Performance)**: First Contentful Paint (FCP) $< 1.5$ detik, skor Google Lighthouse $> 90$.
* **Estetika UI/UX**: Google Stitch AI Design System dengan palet warna natural yang konsisten (`#25160E`, `#3C2A21`, `#934B19`, `#FBF9F5`).
* **Keamanan (Security)**: Pengamanan API Key via `.env.local`, enkripsi 256-bit Midtrans Snap, dan HTTPS SSL.
* **Integritas Tipe (TypeScript)**: `npx tsc --noEmit` lulus 100% tanpa error compilation.
