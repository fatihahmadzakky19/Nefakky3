# Product Requirement Document (PRD) — Nefakky Marketplace

**Nama Produk**: Nefakky - Artisanal Food & Culinary Marketplace  
**Versi Dokumen**: 3.6.0 (Enterprise Architecture: Laravel 12 REST Backend, Next.js 14 App Router, Google Stitch AI UI System, Midtrans Sandbox Core API & Simulator Polling, Dual Firebase Architecture, Dual Mode OpenStreetMap & Geolocation, Realtime Calendar & Time API)  
**Tanggal Terakhir Diperbarui**: 25 Agustus 2026  
**Status**: Production Standard (100% Passed Test Suite & Type-Safe)  
**Penulis / Team**: Tim Pengembang Nefakky (Fatih Ahmad Zakky) & Google Stitch AI Design System  

---

## 1. Ringkasan Eksekutif & Latar Belakang

### 1.1 Visi Produk
**Nefakky** adalah platform *artisanal e-commerce* dan marketplace kuliner premium direct-to-consumer (D2C) yang menghubungkan penikmat kuliner Nusantara dengan hidangan otentik tradisional berkualitas tinggi. Platform ini menggabungkan antarmuka digital yang mewah dan hangat (*Google Stitch Artisanal Luxury*) dengan keandalan operasional tingkat korporat.

### 1.2 Masalah yang Diselesaikan
1. **Tingginya Komisi Platform Agregator**: Platform pihak ketiga umumnya memotong komisi 20%–30% yang menekan profitabilitas UMKM kuliner. Nefakky menyediakan kanal penjualan mandiri tanpa potongan komisi perantara.
2. **Ketiadaan Transparansi Ongkos Kirim**: Nefakky menggunakan algoritma berbasis jarak matematis (*Haversine Formula*) dengan tiering jelas sehingga pembeli memahami asal nominal ongkir.
3. **Ketidakpastian Status Pembayaran**: Integrasi Midtrans Core API dan *background polling* otomatis mendeteksi pelunasan Virtual Account dan QRIS dalam hitungan detik.
4. **Kebutuhan Validasi Waktu Transaksi Resmi**: Penyediaan *Realtime Calendar API* server-authoritative memastikan data waktu, hari, tanggal, bulan, dan tahun pembukuan tercatat secara presisi dan realtime.

---

## 2. Target Pengguna & Analisis Kebutuhan

### 2.1 Persona 1: Pelanggan (Customer / Food Enthusiast)
* **Karakteristik**: Konsumen digital yang mengutamakan kemudahan pemesanan hidangan hangat, kejelasan waktu pengantaran, dan opsi pembayaran modern.
* **Kebutuhan Utama**:
  * Menelusuri katalog menu 3 kategori (*Makanan Berat*, *Minuman*, *Menu Hemat*).
  * Memilih 3 varian rasa jus dalam 1 halaman secara mulus.
  * Memilih metode pembayaran fleksibel (Midtrans VA/QRIS/E-Wallet atau COD).
  * Melacak rute kurir pada peta interaktif OpenStreetMap.
  * Mengonfirmasi penerimaan pesanan dan mengunduh nota PDF resmi.

### 2.2 Persona 2: Administrator & Tim Dapur (Admin & Kitchen Desk)
* **Karakteristik**: Pemilik usaha (*Fatih Ahmad Zakky*) dan staf dapur yang mengelola alur produksi makanan dan logistik kurir.
* **Kebutuhan Utama**:
  * Memantau ringkasan omset kotor, estimasi laba bersih 40%, AOV, dan rating kepuasan.
  * Mengelola status pesanan 5-tahap secara 1-klik dengan notifikasi audit log.
  * Melakukan pencatatan penjualan offline/bazar POS secara cepat.
  * Mengubah data proyeksi grafik omset tahun berjalan.
  * Mengekspor laporan pembukuan ke Microsoft Excel (.xls) dan PDF.

---

## 3. Spesifikasi Kebutuhan Fungsional (Functional Requirements)

### 3.1 Modul Katalog Menu & Varian Produk (`/products` & `/`)
* **FR-CAT-01**: Sistem harus menampilkan 6 menu master hidangan otentik: Ayam Bakar (Rp 35.000), Nasi Bakar (Rp 10.000), Krecek (Rp 20.000), Gudeg (Rp 10.000), Garang Asam (Rp 10.000), dan Jus Buah Segar (Rp 5.000).
* **FR-CAT-02**: Pada hidangan jus (`m6`), antarmuka wajib menyediakan *variant switcher* 3 rasa (*Mangga Aromanis, Sirsak Madu, Jambu Merah*) yang secara dinamis memperbarui foto galeri dan info nutrisi tanpa memuat ulang halaman.
* **FR-CAT-03**: Menampilkan rincian bahan rempah (*ingredients*), daerah asal hidangan, serta informasi kalori dan lemak.

### 3.2 Modul Alur Checkout & Keranjang Belanja (`/cart`)
* **FR-CHK-01**: Keranjang belanja mendukung penambahan kuantitas, pengurangan bertahap, dan penghapusan produk dengan update instan pada subtotal.
* **FR-CHK-02**: Validasi kupon promo diskon (contoh: `WEEKENDSERU` diskon 30%) dengan pengecekan batas minimum belanja (*Min Spend*).
* **FR-CHK-03**: Pemilihan alamat tujuan dilengkapi deteksi lokasi GPS dan input catatan khusus untuk kurir serta catatan rasa ke dapur.
* **FR-CHK-04**: Penghitungan ongkos kirim bertingkat:
  $$\text{Ongkir} = \begin{cases} 
  \text{Rp } 10.000 & \text{jika } \text{jarak} \le 10\text{ km} \\ 
  \text{Rp } 10.000 + \left\lceil \dfrac{\text{jarak} - 10}{2} \right\rceil \times \text{Rp } 2.500 & \text{jika } \text{jarak} > 10\text{ km} 
  \end{cases}$$

### 3.3 Modul Gerbang Pembayaran Digital Midtrans Sandbox (`/api/midtrans/*`)
* **FR-PAY-01**: Endpoint `POST /api/midtrans/charge` menghasilkan transaksi riil dari Midtrans Sandbox Core API untuk metode Virtual Account (BCA/BNI/Mandiri), QRIS, E-Wallet, dan Kartu Kredit.
* **FR-PAY-02**: Modal konsol pembayaran menyajikan nomor VA, tombol salin instan, dan tautan langsung ke *Midtrans Payment Simulator*.
* **FR-PAY-03**: Endpoint `GET /api/midtrans/status` melakukan *polling* otomatis setiap 2.5 detik untuk memverifikasi pelunasan dan menerbitkan nomor pesanan resmi `NFK-XXXXXX`.
* **FR-PAY-04**: Mendukung transaksi tunai Cash on Delivery (COD) yang langsung menerbitkan pesanan berstatus `AWAITING PAYMENT`.

### 3.4 Modul Pelacakan Pesanan & Peta OpenStreetMap (`/notifications`)
* **FR-TRK-01**: Menyajikan stepper 5-tahap pemrosesan: `1. Diterima` $\rightarrow$ `2. Dimasak` $\rightarrow$ `3. Menunggu Kurir` $\rightarrow$ `4. Dalam Perjalanan` $\rightarrow$ `5. Selesai`.
* **FR-TRK-02**: Kartu Rute Pengiriman menyematkan peta interaktif OpenStreetMap dengan tombol pengalih tampilan ke animasi rute kurir.
* **FR-TRK-03**: Tombol **"Konfirmasi Pesanan Telah Sampai"** yang dapat diklik pelanggan untuk memvalidasi penyelesaian pengantaran secara real-time.
* **FR-TRK-04**: Penyediaan modal cetak struk pembayaran resmi PDF (`window.print()`).

### 3.5 Modul Layanan Kalender & Waktu Realtime (`/api/calendar/time`)
* **FR-TIM-01**: Menyediakan endpoint waktu server resmi WIB (*Asia/Jakarta*) yang mengembalikan Hari, Tanggal, Bulan, Tahun, Jam, Menit, dan Detik.
* **FR-TIM-02**: Setiap transaksi baru otomatis menyematkan metadata kalender lengkap untuk kebutuhan rekapitulasi pembukuan bulanan.

### 3.6 Modul Enterprise Admin Command Center (`/admin`)
* **FR-ADM-01**: Dashboard menyajikan 5 metrik KPI: Omset Kotor, Margin Laba Bersih (40%), Total Pesanan Selesai, AOV, dan Skor Rating.
* **FR-ADM-02**: Visualisasi grafik penjualan bulanan SVG dari Juni 2026 hingga Desember 2026 dengan fitur modal edit data grafik mandiri.
* **FR-ADM-03**: Modal pencatatan penjualan offline/bazar (POS Logger) dengan multi-select menu *Best Seller*.
* **FR-ADM-04**: Kontrol status dapur 1-klik dengan integrasi verifikasi bukti kurir WhatsApp.
* **FR-ADM-05**: Pengaturan peta: konfigurasi OpenStreetMap vs Google Maps, koordinat dapur pusat, dan tarif per Km.
* **FR-ADM-06**: Ekspor laporan keuangan resmi ke berkas Microsoft Excel (.xls) dan PDF.

---

## 4. Kebutuhan Non-Fungsional (Non-Functional Requirements)

* **NFR-PERF-01 (Kinerja)**: Halaman aplikasi harus memuat data dalam waktu $< 1.5$ detik pada koneksi internet standar (First Contentful Paint $< 1.0$s).
* **NFR-SEC-01 (Keamanan)**: Kunci otentikasi `MIDTRANS_SERVER_KEY` disimpan secara aman di environment variabel sisi server tanpa pernah terekspos ke bundle JavaScript klien.
* **NFR-RES-01 (Responsivitas)**: Antarmuka sepenuhnya responsif pada seluruh ukuran layar mulai dari ponsel (360px), tablet (768px), hingga monitor desktop (1920px).
* **NFR-TYP-01 (Integritas Tipe Data)**: 100% kepatuhan TypeScript Strict Mode tanpa ada galat tipe (`0 error on tsc --noEmit`).
* **NFR-TST-01 (Keandalan Uji)**: 100% pengujian otomatis lolos uji pada seluruh modul utama (8 dari 8 tes sukses).

---

## 5. Matriks Pengujian & Kriteria Keberhasilan

| Modul | Pengujian | Kriteria Lolos | Status |
| :--- | :--- | :--- | :--- |
| **Type Safety** | `tsc --noEmit` | 0 Error kode TypeScript | PASSED ✅ |
| **Rute & Halaman** | Verifikasi rute | 5 Rute utama aktif & responsif | PASSED ✅ |
| **Katalog Master** | Verifikasi DataContext | 6 Item menu master terdaftar lengkap | PASSED ✅ |
| **Sistem Ulasan** | Helper `reviews.ts` | Komentar berbahasa Indonesia valid | PASSED ✅ |
| **Keranjang & Promo** | Kalkulasi diskon | Diskon % dan minSpend terhitung akurat | PASSED ✅ |
| **Firebase Cloud** | Inisialisasi DB | Auth & Firestore terhubung stabil | PASSED ✅ |
| **Midtrans API** | API Charge & Status | Endpoint mengembalikan respons valid | PASSED ✅ |
| **Ongkos Kirim** | Algoritma Jarak | Formula bertingkat terhitung benar | PASSED ✅ |
