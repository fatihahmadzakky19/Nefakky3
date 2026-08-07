# Product Requirement Document (PRD) — Nefakky

**Nama Produk**: Nefakky - Artisanal Food & Culinary Marketplace  
**Versi**: 1.2.0  
**Tanggal Terakhir Diperbarui**: 6 Agustus 2026  
**Status**: Production / Live  
**Penulis / Team**: Tim Pengembang Nefakky (Fatih Ahmad Zakky)  

---

## 1. Ringkasan Eksekutif & Visi Produk

### 1.1 Visi Produk
**Nefakky** adalah platform *artisanal e-commerce* dan marketplace kuliner premium berteknologi tinggi yang dikembangkan untuk menghubungkan penikmat kuliner (*epicureans*) dengan hidangan tradisional khas berkualitas tinggi. Platform ini menggabungkan pengalaman belanja digital yang estetik, intuitif, dan responsif dengan integrasi gerbang pembayaran *real-time* (**Midtrans Snap API**), pemetaan lokasi pengiriman otomatis berbasis GPS (**Nominatim / Haversine Distance Engine**), serta sistem pengelolaan operasional toko secara terpusat.

### 1.2 Tujuan Bisnis
* **Transformasi Digital Direct-to-Consumer (D2C)**: Menyediakan saluran pemesanan langsung tanpa ketergantungan pada agrator pihak ketiga, menekan biaya komisi dan meningkatkan margin usaha.
* **Pengalaman Transaksi Instan**: Memangkas alur pemesanan dari penjelajahan menu hingga *checkout* selesai dalam waktu kurang dari 2 menit.
* **Transparansi Operasional & Pelacakan Status**: Menyediakan pelacakan status pesanan secara *real-time* (`RECEIVED` $\rightarrow$ `COOKING` $\rightarrow$ `SHIPPING` $\rightarrow$ `COMPLETED`), disertai estimasi waktu dan konfirmasi penerimaan dari pelanggan.
* **Keamanan & Sinkronisasi Sesi Berkelanjutan**: Menjamin integritas data akun melalui Firebase Authentication (Email/Password & Google OAuth), validasi sesi lintas tab (*Cross-Tab Sync*), dan proteksi sesi lokal.

---

## 2. Target Pengguna (User Personas)

### 2.1 Pelanggan (*Customer / Consumer*)
* **Profil**: Penikmat kuliner, pekerja kantoran, keluarga, atau mahasiswa yang membutuhkan pemesanan makanan berkualitas tinggi secara daring dengan kemudahan pengiriman dan jaminan kesegaran.
* **Kebutuhan Utama**:
  * Katalog menu interaktif dengan filter kategori, pencarian instan, rincian bahan, kalori, dan batasan radius pengiriman.
  * Pemilihan lokasi pengiriman otomatis via GPS atau preset area Jabodetabek.
  * Beragam pilihan pembayaran digital aman (QRIS, GoPay, ShopeePay, Virtual Account BCA/Mandiri/BNI, Kartu Kredit).
  * Batas waktu pembayaran dengan *Countdown Timer* 24 jam.
  * Fitur ulasan ulasan asli beserta bukti foto dan sistem penilaian bintang (1-5).
  * Layanan obrolan bantuan pelanggan (*Live Chat CS Support*) yang terhubung langsung ke pengelola toko.

### 2.2 Administrator (*Admin / Store Manager*)
* **Profil**: Pemilik usaha (*Fatih Ahmad Zakky*) dan staf operasional toko yang mengelola persediaan, alur pesanan, serta layanan pelanggan harian.
* **Kebutuhan Utama**:
  * Dashboard analitik untuk pemantauan KPI bisnis (Total Omset, Total Pesanan, Pelanggan Aktif, Produk Terlaris).
  * Manajemen katalog produk secara fleksibel (CRUD, ubah harga, stok, diskon, dan batas jarak pengiriman).
  * Pengendalian alur pesanan masuk dan pembaruan status pengiriman.
  * Generator kode kupon voucher promo dengan batasan *Minimum Spend* dan kuota klaim.
  * Moderasi ulasan pengguna (pinning ulasan unggulan, sembunyikan/tampilkan ulasan).
  * Pusat layanan chat pesan pelanggan (*Admin Customer Service Desk*).

---

## 3. Lingkup Produk & Modul Fitur Utama (Product Scope & Features)

### 3.1 Modul Pelanggan (*Customer Facing*)

#### 1. Autentikasi & Pengelolaan Sesi (`AuthContext`)
* **Multi-Provider Auth**: Dukungan login & pendaftaran akun via Email/Password serta Google OAuth Single Sign-On (SSO).
* **Penanganan Error Terstruktur**: Pesan kegagalan login/registrasi yang informatif dalam Bahasa Indonesia (`auth/user-not-found`, `auth/wrong-password`, `auth/email-already-in-use`).
* **Keamanan Sesi Lintas Tab**: Sinkronisasi status autentikasi secara otomatis antar-tab peramban menggunakan `StorageEvent` listener dan Firebase `onAuthStateChanged`.
* **Hak Akses Berbasis Peran (RBAC)**: Pemisahan peran secara tegas antara `admin` (`fatihahmadzakky19@gmail.com`) dan `customer`.

#### 2. Katalog Produk & Detail Modal Interaktif (`/menu`)
* **Filtering & Instant Search**: Filter kategori (*Makanan Berat*, *Menu Hemat*, *Minuman*, *Cemilan*) dan pencarian nama produk *real-time*.
* **Status Stok & Badge**: Label khusus (*TERPOPULER*, *BEST SELLER*, *BARU*) dan status keterbatasan stok (*Active*, *Low Stock*, *Inactive*).
* **Detail Modal produk**: Menampilkan galeri foto produk high-res, daftar bahan utama, panduan konsumsi, asal hidangan, serta informasi nilai gizi (kalori, lemak, gula).

#### 3. Keranjang Belanja & Kalkulator Promo (`CartContext` & `/cart`)
* **User-Scoped Storage**: Keranjang disimpan terpisah berdasarkan UID pengguna (`nefakky_cart_${user.uid}`) di `localStorage` peramban.
* **Kalkulasi Biaya Otomatis**: Perhitungan Subtotal, Biaya Pengiriman (layanan Standard, Express, Same Day), Biaya Layanan, dan Potongan Kupon Promo.
* **Sistem Voucher Promo**: Input kode voucher diskon dengan validasi syarat transaksi minimum (*Minimum Spend*) dan status keaktifan voucher.

#### 4. Penentuan Lokasi Pengiriman & Haversine Engine (`AutoMapPickerModal`)
* **Auto-Detect GPS**: Deteksi koordinat posisi presisi pelanggan menggunakan Web Geolocation API.
* **Preset Area Jabodetabek**: Pilihan lokasi populer (Senayan/SCBD, Menteng, Kemang, Pondok Indah, Kelapa Gading, BSD City).
* **Kalkulator Jarak Haversine**: Perhitungan jarak tempuh otomatis dari lokasi Dapur Pusat Nefakky (Jakarta Pusat) untuk penentuan tarif pengiriman.

#### 5. Integrasi Midtrans Payment Gateway (`/api/midtrans/token`)
* **Modal Interaktif Snap**: Integrasi pembayaran seamless tanpa meninggalkan aplikasi.
* **Dukungan Metode Pembayaran**: QRIS Instan, Virtual Account Bank (BCA, Mandiri, BNI, BRI), E-Wallet (GoPay, ShopeePay), dan Credit Card.
* **Countdown Timer Pembayaran**: Penghitung mundur waktu pembayaran 24 Jam (`HH:MM:SS`) secara *real-time*.

#### 6. Pelacakan Pesanan & Profil Pelanggan (`/profile`)
* **Workflow Status Pesanan**: Visualisasi alur pesanan dari `RECEIVED` $\rightarrow$ `COOKING` $\rightarrow$ `SHIPPING` $\rightarrow$ `COMPLETED`.
* **Konfirmasi Penerimaan**: Pelanggan dapat mengonfirmasi pesanan telah diterima dengan tombol *Konfirmasi Terima Barang*.
* **Riwayat & Pembatalan**: Histori lengkap pesanan serta opsi pembatalan pesanan sebelum diproses.

#### 7. Sistem Ulasan & Rating (`/comments`)
* **Penilaian Bintang (1-5)**: Pengiriman ulasan beserta skor bintang, lampiran foto bukti pembelian, dan badge pembeli terverifikasi.
* **Filter & Interaksi Ulasan**: Filter ulasan berdasarkan jumlah bintang dan dukungan penyukaan ulasan (*Like count*).

#### 8. Layanan Live Chat CS Support
* **Komunikasi Langsung**: Obrolan interaktif pengguna dengan Tim CS Admin untuk pertanyaan menu atau kustomisasi pesanan.
* **Indikator Pesan Terbaca**: Status pesan dibaca (*Read Status*) dan notifikasi pesan baru.

---

### 3.2 Modul Administrator (*Admin Control Panel*)

#### 1. Dashboard Ringkasan & Analitik (`/admin`)
* **KPI Metric Cards**: Visualisasi Total Pendapatan, Total Pesanan, Pelanggan Aktif, dan Jumlah Produk Aktif.
* **Grafik Penjualan**: Laporan statistik tren pesanan harian/bulanan.

#### 2. Manajemen Katalog Produk (CRUD)
* **Penyuntingan Lengkap**: Tambah produk baru, ubah harga, persentase diskon, tingkat stok, deskripsi, nilai gizi, galeri gambar, dan batas jarak pengiriman maksimum (Km).
* **Pengaturan Visibilitas**: Mengaktifkan atau menyembunyikan menu dari katalog publik secara instan.

#### 3. Manajemen Pesanan & Operasional Dapur
* **Pembaruan Status Pesanan**: Mengubah status pesanan (*Diproses*, *Dimasak*, *Dalam Pengiriman*, *Selesai*, *Dibatalkan*).
* **Verifikasi Pembayaran**: Pemantauan status tagihan (*PAID*, *AWAITING*, *REFUNDED*, *FAILED*).

#### 4. Generator Promo & Voucher Diskon
* **Pembuatan Kupon**: Pengaturan kode voucher unik, persen diskon, batasan minimum belanja, kuota penggunaan, dan tanggal kadaluarsa.

#### 5. Moderasi Ulasan & Pusat Chat Admin
* **Manajemen Ulasan**: Pinning ulasan positif ke halaman utama, membalas ulasan pelanggan, atau menyembunyikan ulasan yang melanggar ketentuan.
* **Admin Chat Desk**: Membalas pertanyaan pelanggan secara *real-time*.

---

## 4. Arsitektur Teknologi & Dependensi (Tech Stack)

| Komponen | Teknologi / Library | Deskripsi / Peran |
| :--- | :--- | :--- |
| **Framework Utama** | Next.js 14 (App Router, React 18) | Server-Side Rendering (SSR) & Client-Side Hydration |
| **Bahasa** | TypeScript (Strict Mode) | Pengetikan statis untuk keandalan data |
| **Styling & UI** | Tailwind CSS v3, Vanilla CSS, Lucide React | Utilitas styling modern, responsif, dan iconography |
| **Autentikasi** | Firebase Auth v10 | Email/Password Auth & Google OAuth Provider |
| **State & Persistence** | React Context API & Browser LocalStorage | State terpusat (`AuthContext`, `CartContext`, `DataContext`) |
| **Payment Gateway** | Midtrans Snap Payment API v1 | Pengolahan transaksi digital aman (Sandbox & Live) |
| **Geocoding & Maps** | OpenStreetMap / Nominatim API | Pencarian lokasi dan geokoding koordinat alamat |

---

## 5. Persyaratan Non-Fungsional (Non-Functional Requirements)

* **Performa (Performance)**: First Contentful Paint (FCP) $< 1.5$ detik, skor Google Lighthouse $> 90$.
* **Keamanan (Security)**: Pengamanan API Key via environment variables (`.env.local`), pembatasan endpoint server API Midtrans, dan HTTPS SSL terenkripsi.
* **Ketersediaan (Availability)**: Arsitektur Serverless dengan garansi Uptime SLA $99.9\%$.
* **Responsivitas UI/UX**: Desain *Mobile-First* yang dapat beradaptasi sempurna di perangkat Smartphone, Tablet, dan Desktop Monitor.
* **Aksesibilitas (A11y)**: Memenuhi standar WCAG 2.1 Level AA (kontras warna tinggi, ARIA labels, navigasi keyboard).

---

## 6. Indikator Keberhasilan Bisnis (KPIs)

1. **Rasio Konversi Checkout**: $> 15\%$ penjelajah halaman menu berhasil melakukan checkout pesanan.
2. **Keberhasilan Pembayaran**: $> 95\%$ transaksi via Midtrans Snap terselesaikan tanpa kegagalan teknis.
3. **Retensi Pelanggan**: $> 35\%$ pelanggan melakukan pemesanan ulang (*Repeat Order*) dalam jangka 30 hari.
4. **Respon CS Admin**: Waktu tanggap rata-rata pesan chat pelanggan $< 5$ menit.
