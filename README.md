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

---

## 🌟 3. Informasi Fitur-Fitur Lengkap Aplikasi

### 🛒 A. Fitur Pelanggan (Customer Facing Features)

1. **Katalog Hidangan Interaktif & Live Search/Filter**:
   - Filter cepat berdasarkan kategori (*Makanan Berat*, *Minuman*, *Menu Hemat*).
   - Pencarian hidangan secara instan (*Live Search*) tanpa reload halaman.
   - Pengurutan menu berdasarkan harga terendah, harga tertinggi, dan rating ulasan terfavorit.

2. **Modal Detail Menu 360° & Informasi Nutrisi**:
   - Informasi lengkap porsi, komposisi bahan rempah alami, dan petunjuk penyimpanan.
   - Tabel nutrisi detail (Kalori, Lemak Total, Lemak Jenuh, Gula Alami).
   - Khusus menu minuman: Pilihan 3 varian rasa jus (*Mangga*, *Sirsak*, *Jambu*) dengan pergantian foto dan stok secara instan.

3. **Single Active Order Policy (Pembatasan Pesanan Aktif)**:
   - Kebijakan pintar yang membatasi transaksi pembelian baru jika pesanan sebelumnya masih dalam proses memasak atau pengantaran kurir.
   - Menampilkan pop-up modal editorial (*ActiveOrderBlockerModal*) yang memuat status pesanan dan tombol cepat pelacakan.
   - Memastikan kualitas hidangan tetap prima dan tidak terjadi penumpukan transaksi yang membingungkan pelanggan.

4. **Multi-Voucher Promo Stacking (Maksimal 2 Voucher)**:
   - Pengguna dapat mengklaim dan menggunakan hingga maksimal **2 voucher promo sekaligus** di keranjang belanja / checkout.
   - Akumulasi persentase diskon otomatis dan kalkulasi nominal potongan harga dalam Rupiah (Rp).
   - Indikator kuota voucher (misal: `1/2 (+ Tambah 1 Voucher Lagi)` atau `2/2 Voucher Digunakan (Maks. 2)`).
   - Kartu voucher individual dengan rincian minimal belanja dan tombol **Hapus** masing-masing.

5. **Validasi Alamat Geocoding & OpenStreetMap GPS Realtime**:
   - Pencarian alamat otomatis dan pemilihan titik koordinat GPS presisi melalui peta interaktif OpenStreetMap.
   - Validasi ketepatan alamat (*Geocoding Validation*); pesanan terkunci jika alamat belum terverifikasi oleh peta.
   - Kalkulasi jarak tempuh kilometer akurat berbasis formula matematis *Haversine* dari Dapur Pusat ke rumah pelanggan.
   - Transparansi perhitungan ongkos kirim dinamis sesuai jarak realtime.

6. **Workflow Checkout 4-Tahap & Midtrans Snap Gateway**:
   - Tahapan terstruktur: **Keranjang** $\rightarrow$ **Alamat Pengiriman** $\rightarrow$ **Pembayaran** $\rightarrow$ **Sukses Transaksi**.
   - Integrasi pembayaran resmi Midtrans Snap (Sandbox Simulator):
     - *Virtual Account*: BCA, BNI, Mandiri Bill, BRI.
     - *E-Wallet / QRIS*: GoPay, ShopeePay, QRIS Nasional.
     - *Kartu Kredit / Debit*.
     - *Bayar di Tempat (Cash on Delivery / COD)*.
   - Otomatisasi pengecekan pelunasan (*Auto Polling Status Settlement*).

7. **Pelacakan Rute Kurir Realtime (Live Order Tracking)**:
   - Visualisasi peta rute perjalanan kurir dari dapur resto ke alamat pembeli.
   - Progres status pesanan 5-tahap (*Pesanan Diterima* $\rightarrow$ *Sedang Dimasak* $\rightarrow$ *Siap Diantar* $\rightarrow$ *Dalam Pengantaran Kurir* $\rightarrow$ *Pesanan Selesai*).
   - Tombol **"Konfirmasi Pesanan Telah Sampai (Tiba Tepat Waktu)"** bagi pelanggan untuk menyelesaikan pesanan secara mandiri.

8. **Ulasan Rasa & Komunitas Pelanggan**:
   - Formulir testimoni dengan rating bintang 1-5, teks ulasan rasa, dan unggah foto hidangan asli.
   - Filter ulasan terverifikasi dan balasan resmi (*official reply*) langsung dari Admin Nefakky.

9. **Studio Foto Profil 3-Arah (3-Way Photo Studio Picker)**:
   - Penggantian foto profil fleksibel: Unggah dari Galeri Perangkat, Pengambilan Foto Langsung via Webcam/Kamera, atau Sinkronisasi Avatar Google SSO.
   - Manajemen multi-alamat tersimpan (Rumah, Kantor, dll.) dengan titik koordinat GPS masing-masing.

10. **Meja Layanan Pelanggan (CS Live Chat)**:
    - Obrolan dua arah langsung antara pelanggan dan tim customer service dapur via komunikasi realtime.
    - Notifikasi reservasi instan untuk hidangan yang sedang habis stok.

11. **Cetak Nota & Invoice Resmi PDF**:
    - Tombol cetak nota transaksi dan unduh invoice digital resmi siap cetak (termasuk rincian diskon multi-voucher dan ongkir).

12. **Guest Auth Guard**:
    - Pengguna tamu (belum login) tetap leluasa menjelajahi menu dan katalog.
    - Modal otentikasi ramah (*AuthRequiredModal*) memandu pengguna untuk masuk atau mendaftar saat ingin melakukan transaksi atau klaim voucher.

---

### 🏢 B. Fitur Admin & Dapur Restoran (Enterprise Command Center - `/admin`)

1. **Executive Dashboard & Realtime WIB Clock**:
   - Jam kalender digital resmi WIB berdetak tanpa lag beserta indikator status telemetri server.
   - Akses navigasi tab terpadu: *Ringkasan*, *Kelola Menu*, *Voucher Promo*, *Live Chat Pelanggan*, *Dispatcher Pesanan*, *POS Bazar*, dan *Laporan Keuangan*.

2. **Dashboard KPI & Analitik Keuangan**:
   - Pemantauan metrik finansial: Omset Penjualan Kotor, Estimasi Laba Bersih (Margin 40%), Total Volume Pesanan, Rata-rata Nilai Belanja (*AOV*), dan Skor Kepuasan Pelanggan (*CSAT*).

3. **Interactive Sales Chart**:
   - Grafik batang visual omset bulanan interaktif.
   - Modal edit data pembukuan omset bazar offline dan penjualan katering.

4. **Kitchen Order Dispatcher 5-Tahap**:
   - Kontrol status dapur 1-klik (`RECEIVED` $\rightarrow$ `COOKING` $\rightarrow$ `READY` $\rightarrow$ `DELIVERING` $\rightarrow$ `COMPLETED`).
   - Broadcast status instan ke halaman pelacakan kurir pelanggan melalui koneksi WebSocket / Firebase RTDB.

5. **Point of Sale (POS) Logger Bazar Offline**:
   - Formulir pencatatan cepat transaksi penjualan langsung di lokasi pameran/bazar kuliner.
   - Pemilihan menu instan, penentuan nominal diskon, kalkulasi kembalian tunai, dan tagging menu terlaris.

6. **Manajemen Produk & Stok Realtime**:
   - Tambah menu baru, edit nama, harga, kategori, foto, kalori, dan komposisi bahan.
   - Atur kuota stok hidangan utama dan stok per varian rasa minuman jus secara terpisah.
   - Tombol sembunyikan/tampilkan menu dari katalog pelanggan.

7. **Manajemen Kupon & Voucher Promo**:
   - Pembuatan kode voucher baru (misal: `DISKON20`, `HEMAT50`).
   - Pengaturan persentase diskon, syarat minimal belanja, kuota limit penggunaan, dan masa berlaku kedaluwarsa.
   - Monitoring jumlah voucher yang telah diklaim dan digunakan oleh pelanggan.

8. **Meja CS Live Chat Terpadu & Riwayat Transaksi**:
   - Kotak masuk obrolan seluruh pelanggan secara realtime.
   - Panel samping yang menampilkan riwayat pesanan pelanggan secara presisi 100% berdasarkan email akun untuk mempermudah penanganan keluhan.

9. **Reporting Engine (Ekspor Excel & Cetak PDF)**:
   - Ekspor seluruh data transaksi dan omset ke spreadsheet Microsoft Excel (`.xlsx` via FastExcel).
   - Cetak laporan rekapitulasi keuangan resmi ke format PDF (`DomPDF`).

10. **Moderasi Komentar & Ulasan Komunitas**:
    - Tinjau seluruh ulasan masuk: Setujui (*Approve*), Sembunyikan (*Hide*), Sematkan di Paling Atas (*Pin*), dan Berikan Balasan Resmi Resto.

---

## 💻 4. Framework & Arsitektur Teknologi

### 🌐 Frontend (User Interface & Client App)
* **[Next.js 14](https://nextjs.org/)** (*App Router* Architecture) — Framework React SSR/SSG performa tinggi.
* **[React 18](https://reactjs.org/)** — Pustaka UI deklaratif modern berbasis komponen.
* **[TypeScript 5](https://www.typescriptlang.org/)** — Bahasa pemrograman bertipe ketat (*Type-Safe*) untuk keandalan kode tanpa bug runtime.
* **[Tailwind CSS 3](https://tailwindcss.com/)** — Framework styling utility-first yang dipadukan dengan master desain **Google Stitch Artisanal Luxury** (Palet warna Deep Espresso `#25160E`, Warm Terracotta `#934B19`, dan Warm Cream `#FAF8F5`).

### ⚙️ Backend (REST API & Realtime Server)
* **[Laravel 12 (PHP 8.2+)](https://laravel.com/)** — Framework backend enterprise untuk RESTful API, otentikasi Sanctum, dan broadcast WebSockets.
* **Next.js 14 API Routes (Node.js Serverless)** — Endpoint serverless untuk charge transaksi Midtrans, sinkronisasi webhook status pembayaran, proxy geocoding OSM, dan time sync server.
* **[Django 5 / Python](https://www.djangoproject.com/)** *(Opsional)* — Modul backend microservice di folder `backend_django/`.

---

## 📡 5. Layanan API yang Digunakan

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

## 🗄️ 6. Basis Data (Database) yang Digunakan

| Database | Tipe Basis Data | Kegunaan dalam Aplikasi |
| :--- | :--- | :--- |
| **Firebase Cloud Firestore** | NoSQL Cloud Document Store | Menyimpan data menu makanan, ulasan komunitas, klaim voucher promo, dan riwayat pesanan pelanggan. |
| **Firebase Realtime Database (RTDB)** | NoSQL Ultra-Low Latency Key-Value | Sinkronisasi kilat status pemrosesan dapur 5-tahap, posisi kurir GPS, dan chat CS live streaming. |
| **SQLite / MySQL (Laravel DB)** | Relational SQL Database | Penyimpanan relasional transaksi, audit trail aktivitas admin, dan modul pembukuan keuangan toko. |

---

## 📦 7. Ekstensi & Library (Pustaka) yang Digunakan

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

## ⚖️ Hak Cipta

Seluruh hak cipta dilindungi undang-undang.  
Dibuat untuk **Nefakky Culinary Marketplace & Resto**.
