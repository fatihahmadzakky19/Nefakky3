# Product Requirement Document (PRD) — Nefakky Marketplace

**Nama Produk**: Nefakky - Artisanal Food & Culinary Marketplace  
**Versi**: 2.7.0 (Google Stitch AI UI System, Dual Firebase Architecture, Live Camera & Storybook Suite)  
**Tanggal Terakhir Diperbarui**: 13 Agustus 2026  
**Status**: Production / Live  
**Penulis / Team**: Tim Pengembang Nefakky (Fatih Ahmad Zakky) & Google Stitch AI Design System  

---

## 1. Ringkasan Eksekutif & Visi Produk

### 1.1 Visi Produk
**Nefakky** adalah platform *artisanal e-commerce* dan marketplace kuliner premium berteknologi tinggi yang dirancang untuk mengintegrasikan penikmat kuliner (*epicureans*) dengan hidangan tradisional khas Indonesia berkualitas tinggi. Platform ini menggabungkan pengalaman belanja digital yang hangat, estetik, dan responsif dengan integrasi gerbang pembayaran *real-time* eksklusif (**Midtrans Snap API**), pemetaan lokasi pengiriman otomatis berbasis GPS (**Auto Map Picker & Haversine Distance Engine**), modul pengambilan foto secara langsung (**Live Camera Capture System**), suite komponen UI teruji (**Storybook 10 Suite**), arsitektur ganda database awan *real-time* (**Firebase Cloud Firestore DB & Firebase Realtime Database `asia-southeast1`**), serta sistem pengelolaan operasional toko terpadu.

### 1.2 Tujuan Utama & Value Proposition
* **Direct-to-Consumer (D2C) Premium**: Menyediakan pemesanan hidangan khas langsung dari dapur Nefakky tanpa perantara komisi yang memotong margin usaha.
* **Alamat Produksi Resmi**: Seluruh produk diproduksi secara otentik di lokasi terpusat: *Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Provinsi Jawa Barat, Indonesia*.
* **Google Stitch AI UI System**: Menerapkan skema warna resmi Google Stitch Palette (`#25160E` Espresso, `#3C2A21` Coffee, `#934B19` Terracotta, `#FBF9F5` Warm Cream) untuk menghasilkan tampilan mewah, bersih, dan estetik.
* **Pemilihan 3 Varian Rasa Jus Interaktif 1 Halaman**: Khusus kategori Minuman Jus (`m6`), pengguna dapat memilih 3 varian rasa (*Mangga Aromanis, Sirsak Madu, Jambu Merah*) langsung dalam 1 halaman/modal yang sama tanpa berpindah link.
* **Live Camera Capture & Image Upload Modal**: Fitur kamera bawaan peramban (`LiveCameraModal`) untuk pengambilan foto ulasan kuliner atau bukti pengiriman secara langsung dengan dukungan toggle kamera depan/belakang dan fallback unggah berkas.
* **Auto Map Picker & Preset Jabodetabek**: Modal pemeta lokasi GPS interaktif (`AutoMapPickerModal`) lengkap dengan opsi pencarian lokasi, preset area populer Jabodetabek, dan kalkulasi otomatis jarak Haversine ke Dapur Pusat.
* **Pelacakan Status Pesanan Real-time 5-Tahap & Firebase RTDB Sync**: Menyediakan pelacakan status pesanan secara *live* (`1. Diterima` $\rightarrow$ `2. Dimasak` $\rightarrow$ `3. Siap` $\rightarrow$ `4. Diantar` $\rightarrow$ `5. Diterima Pelanggan`) yang tersinkronisasi otomatis via **Firebase Realtime Database** (`rtdb`), hitung mundur waktu estimasi real-time, tab navigasi antar-pesanan aktif, dan konfirmasi penerimaan dari pembeli.
* **Alur Checkout Multi-Step 4-Tahap & Midtrans Sandbox Simulator Engine**: Alur checkout terstruktur (`Cart` $\rightarrow$ `Checkout` $\rightarrow$ `Payment Midtrans` $\rightarrow$ `Success`) dengan token resmi Midtrans Snap dan panduan integrasi ke Midtrans Payment Simulator Sandbox.
* **Analitik Penjualan Riil & Custom Grafik Manager**: Grafik tren omset kotor dan bersih yang dimulai dari Juni 2026 (Event Bazar >10 Juta) dengan fitur **Edit Data Grafik** per bulan dan input transaksi offline manual yang detail.

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
  * Seksi **Riwayat Pemesanan Permanen** dan modal cetak **Struk Pembayaran Resmi (PDF)**.
  * Live Chat CS interaktif real-time.

### 2.2 Administrator (*Admin / Store Manager*)
* **Profil**: Pemilik usaha (*Fatih Ahmad Zakky*) dan staf operasional toko yang mengelola persediaan menu, alur dapur pesanan, promosi, serta laporan keuangan harian.
* **Kebutuhan Utama**:
  * Dashboard analitik bisnis riil (Omset Kotor, Omset Bersih 40%, Total Pesanan, AOV, serta peringkat Makanan Terlaris & Kurang Laris).
  * Grafik omset penjualan yang dapat diedit secara langsung (*Edit Data Grafik Modal*) dan disimpan secara permanen.
  * Modal Input Omset Manual yang detail untuk penjualan offline/bazar dengan pemilihan multi-item menu terlaris & kurang laris.
  * Manajemen operasional dapur real-time (perubahan status `RECEIVED` $\rightarrow$ `COOKING` $\rightarrow$ `READY` $\rightarrow$ `SHIPPING` $\rightarrow$ `COMPLETED`).
  * Manajemen katalog produk secara fleksibel (CRUD, harga, stok, diskon, galeri foto, deskripsi, alamat produksi resmi, dan visibilitas).
  * Generator kode kupon voucher promo dengan batasan *Minimum Spend*, kuota penggunaan, dan fitur *Auto-Expire*.

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
* **Tahap 1 (Cart)**: Ringkasan porsi menu, klaim voucher promo diskon persentase, dan subtotal.
* **Tahap 2 (Checkout)**: Pengisian alamat penerima, lokasi GPS map via **Auto Map Picker Modal** (`AutoMapPickerModal.tsx`), catatan masakan dapur, dan rincian ongkir Haversine.
* **Tahap 3 (Payment Midtrans)**: Pembayaran eksklusif **Midtrans Snap Engine** (VA Bank, GoPay/ShopeePay, QRIS, Credit Card 3D Secure).
* **Tahap 4 (Success)**: Konfirmasi pembayaran berhasil dan tombol pelacakan live status.

#### 4. Live Camera Capture System (`LiveCameraModal.tsx`)
* **Akses Kamera Langsung**: Mengambil foto ulasan hidangan atau gambar profil secara *real-time* via `getUserMedia` Web API.
* **Toggle Kamera Front/Rear**: Pengalihan lensa kamera (`environment` / `user`).
* **Fallback Upload Berkas**: Opsi fleksibel unggah berkas foto dari penyimpanan lokal jika akses kamera ditolak.

#### 5. Pelacakan Pesanan Real-time 5-Tahap (`/notifications`)
* **Firebase Realtime Database (RTDB)**: Sinkronisasi status pesanan secara instan dari region `asia-southeast1`.
* **Visual Stepper Live 5-Tahap**: Progress bar bergerak (`RECEIVED` $\rightarrow$ `COOKING` $\rightarrow$ `READY` $\rightarrow$ `SHIPPING` $\rightarrow$ `COMPLETED`).
* **Multi-Order Selector Tabs**: Tab navigasi antar-pesanan jika pelanggan memiliki beberapa transaksi checkout aktif bersamaan.
* **Printable Receipt Modal**: Modal struk bukti pembayaran resmi Midtrans dengan tombol cetak PDF (`window.print()`).

---

### 3.2 Modul Administrator (*Admin Control Panel - /admin*)

#### 1. Real-Time Sales Chart & Custom Editor Modal
* **Grafik Omset Juni 2026**: Visualisasi omset kotor dan laba bersih yang dimulai dari Juni 2026 (Event Bazar >10 Juta).
* **Edit Data Grafik Modal**: Tombol `✏️ Edit Data Grafik` untuk mengubah nominal omset kotor, laba bersih, status event bazar, dan badge tooltip per bulan secara real-time.

#### 2. Operasional Dapur & Synchronized RTDB Operations
* **Kitchen Command Center**: Pengendalian status pengiriman 5-tahap dan pembayaran (`PAID`, `UNPAID`, `REFUNDED`).
* **Automatic RTDB Push**: Setiap perubahan status pesanan di-push ke node `live_orders/` dan `orders/` di Realtime Database.
* **Promo Auto-Expiry**: Vouchers secara otomatis menjadi Expired ketika batas kuota penggunaan telah habis.

---

## 4. Arsitektur Teknologi & Struktur Project

### 4.1 Ringkasan Komponen Utama
* **Frontend**: **Next.js 14 (App Router)**, React 18, Tailwind CSS v3, TypeScript (Strict Mode), Lucide React Icons.
* **UI Testing Suite**: **Storybook 10**, Vitest Browser Runner, Playwright Integration (`.storybook/`, `*.stories.tsx`).
* **Backend REST API**: **Python 3.13 & Django 5.2 (Django REST Framework)** dengan Standalone Helper Functions (`utils.py`), Class-Based Views (CBVs), Service Classes (`services.py`), & Model Encapsulation (`models.py`).
* **Dual Database Architecture**:
  - **Firebase Cloud Firestore DB**: Penyimpanan dokumen persistent (6 Koleksi).
  - **Firebase Realtime Database (RTDB)**: Low-latency real-time state sync (Region: `asia-southeast1`).
* **Payment Engine**: **Midtrans Snap Payment Gateway API** & Midtrans Sandbox Simulator.

### 4.2 Dokumen Desain Terpisah
* 🛒 **[DESIGN_USER.md](file:///f:/nefakky3/DESIGN_USER.md)** — Spesifikasi UI/UX Lengkap Aplikasi Pelanggan.
* 🏢 **[DESIGN_ADMIN.md](file:///f:/nefakky3/DESIGN_ADMIN.md)** — Spesifikasi UI/UX Lengkap Enterprise Admin Command Center.
* 📑 **[DESIGN.md](file:///f:/nefakky3/DESIGN.md)** — Master Index Dokumentasi Desain.

---

## 5. Persyaratan Non-Fungsional (Non-Functional Requirements)

* **Performa (Performance)**: First Contentful Paint (FCP) $< 1.5$ detik, skor Google Lighthouse $> 90$.
* **Estetika UI/UX**: Google Stitch AI Design System dengan palet warna natural yang konsisten (`#25160E`, `#3C2A21`, `#934B19`, `#FBF9F5`).
* **Keamanan (Security)**: Pengamanan API Key via `.env.local`, enkripsi 256-bit Midtrans Snap, dan HTTPS SSL.
* **Integritas Tipe (TypeScript)**: `npx tsc --noEmit` lulus 100% tanpa error compilation.

