# Product Requirement Document (PRD) — Nefakky Marketplace

**Nama Produk**: Nefakky - Artisanal Food & Culinary Marketplace  
**Versi**: 1.3.0  
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

#### 1. Dashboard Ringkasan & Analitik Penjualan
* **KPI Metric Cards**: Visualisasi Total Omset Kotor, Total Omset Bersih (Margin ~40%), Total Pesanan Masuk, dan Average Order Value (AOV).
* **Grafik Trend Omset**: Visualisasi histori grafik penjualan harian, 6 bulanan, dan 1 tahunan tanpa tombol reset buatan.

#### 2. Analisis Makanan Terlaris & Kurang Laris (Real Web Data)
* **Menu Paling Laris**: Peringkat 1 s.d 4 hidangan dihitung otomatis dari total porsi terjual pada pesanan web sesungguhnya.
* **Menu Kurang Laris (Slow Moving)**: Produk dengan porsi terjual terendah di web yang dilengkapi opsi tombol instan **`+ Buat Promo`**.

#### 3. Manajemen Katalog Produk (CRUD) & Stok
* **Penyuntingan Lengkap**: Tambah produk baru, ubah nama, harga, persentase diskon, tingkat stok, deskripsi, nilai gizi, galeri gambar, dan visibilitas.
* **Kelengkapan 6 Produk Utama**: Terdiri dari *Ayam Bakar Rempah*, *Nasi Bakar Cumi*, *Krecek Pedas*, *Gudeg Jogja*, *Garang Asam*, dan *Jus Segar*.

#### 4. Generator Promo & Export Rekap Penjualan
* **Pembuatan Kupon**: Pengaturan kode voucher unik, persen diskon, batasan minimum belanja, kuota penggunaan, dan tanggal kadaluarsa.
* **Export Rekap to Excel**: Mengunduh seluruh rekapitulasi data transaksi pelanggan dalam format `.xlsx` / `.csv`.

---

## 4. Arsitektur Teknologi & Dependensi (Tech Stack)

| Komponen | Teknologi / Library | Deskripsi / Peran |
| :--- | :--- | :--- |
| **Framework Utama** | Next.js 14 (App Router, React 18) | Server-Side Rendering (SSR) & Client-Side Hydration |
| **Bahasa** | TypeScript (Strict Mode) | Pengetikan statis untuk keandalan data |
| **Styling & Theme** | Tailwind CSS v3 & Custom Palette | Palet 4 Warna Natural (`#5C3D28`, `#8A6337`, `#2D231C`, `#FAF8F5`) |
| **Database Cloud** | Firebase Cloud Firestore DB | Synchronizer data *real-time* (`onSnapshot`) untuk 6 koleksi |
| **Autentikasi** | Firebase Auth v10 | Email/Password Auth & Google OAuth Provider |
| **State & Persistence** | React Context API & Browser LocalStorage | State terpusat (`AuthContext`, `CartContext`, `DataContext`) |
| **Payment Gateway** | Midtrans Snap Payment API v1 | Pengolahan transaksi digital aman (Sandbox & Live) |
| **Geocoding & Maps** | OpenStreetMap / Nominatim API | Pencarian lokasi dan geokoding koordinat alamat |
| **Pengujian Otomatis** | Automated Test Suite Runner (`scripts/run-tests.mjs`) | Pengujian otomatis 6 modul sistem & pembuatan `TEST_REPORT.md` |

---

## 5. Sinkronisasi Database Real-Time Firebase Firestore

Data terhubung secara *live* melalui 6 koleksi utama di Cloud Firestore (`db`):

```
firebase-root/
├── products/          # Koleksi Katalog Makanan & Stok
├── orders/            # Koleksi Transaksi Pesanan & Status 5-Tahap
├── promotions/        # Koleksi Event Banner Promo
├── vouchers/          # Koleksi Kode Voucher Belanja
├── reviews/           # Koleksi Ulasan & Penilaian Bintang
└── chat_messages/     # Koleksi Obrolan Live Chat CS
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
