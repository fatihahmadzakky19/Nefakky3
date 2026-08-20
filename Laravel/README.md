# Nefakky Marketplace - Laravel 12 Backend API

Dokumentasi Backend **Nefakky Marketplace**, sistem backend berbasis **Laravel 12 (PHP 8.2+)** yang dirancang dengan standar **Clean Architecture**, keamanan token **Laravel Sanctum**, pemisahan logika validasi (**Form Requests**), standardisasi respon (**API Resources** & **ApiResponse Trait**), serta transaksi **ACID** untuk manajemen pesanan dan kontrol stok otomatis.

---

## Fitur Utama Backend

1. **Autentikasi Pengguna & Multi-Alamat (Laravel Sanctum)**:
   - Registrasi pelanggan baru & login akun (Admin & Customer).
   - Pengelolaan token sesi Bearer, pembaruan profil, ganti kata sandi.
   - Manajemen multi-alamat pengiriman (Rumah, Kantor, dll).
2. **Manajemen Produk & Kontrol Stok Realtime**:
   - Master data produk kuliner, informasi gizi lengkap (kalori, lemak, gula, jenuh), komposisi bahan, saran penyajian, dan batas jarak antar.
   - Perhitungan otomatis harga setelah diskon (`getFinalPrice`).
   - Pengurangan stok otomatis berbasis PBO (`reduceStock`) dan pemulihan stok saat pembatalan (`restoreStock`).
   - Status stok dinamis (*Active*, *Low Stock*, *Inactive*).
   - Dukungan *Soft Deletes* (hapus sementara, pulihkan, dan hapus permanen).
3. **Transaksi Pesanan (Orders) & Live Tracking 5-Tahap**:
   - Checkout pesanan dengan *Database Transaction* (ACID) untuk memastikan integritas stok.
   - Alur status pengantaran 5-tahap live:
     `RECEIVED` -> `COOKING` -> `READY` -> `DELIVERING` -> `COMPLETED`.
   - Konfirmasi penerimaan dari pelanggan dan unggah bukti foto serah terima.
   - Pembatalan pesanan terintegrasi dengan pemulihan kuantitas stok produk.
4. **Voucher & Promo Engine**:
   - Validasi voucher belanja dengan kalkulasi diskon bertingkat (persen atau nominal tetap).
   - Validasi syarat minimal belanja (*min spend*), batas maksimal potongan (*max discount*), dan kuota penggunaan.
   - Aturan khusus hari (*Weekend* vs *Weekday*) dan tanggal kedaluwarsa.
   - Mekanisme **Auto-Reset Mingguan** (ISO Week) untuk promo berulang seperti *Weekend Hemat*.
5. **Ulasan & Rating (Reviews)**:
   - Pencatatan ulasan hidangan dan rating bintang (1-5).
   - Kalkulasi ulang rating rata-rata produk secara otomatis.
   - Fitur Pin ulasan prioritas, moderasi admin (*Approved, Flagged, Pending, Rejected*), tombol suka (*like*), dan balasan penjual (*reply*).
6. **Laporan Penjualan & Finansial (Sales Reports)**:
   - Rekapitulasi omset kotor (*gross revenue*), laba bersih (*net profit*), total pesanan, dan Average Order Value (AOV).
   - Pelacakan performa event khusus / bazar kuliner offline.
   - Filter tahun dan auto-populasi periode default.
7. **Kalkulator Jarak Haversine & Estimasi Ongkir**:
   - Pengukuran jarak linier presisi dari **Central Kitchen** (*Puri Bojong Lestari, Bojong Gede, Bogor*) ke lokasi koordinat pelanggan.
   - Kalkulasi tarif ongkos kirim dinamis dan estimasi menit pengantaran.
   - Validasi batas jangkauan pengiriman aman (maksimal 25 km).
8. **Integrasi Payment Gateway Midtrans**:
   - Pembuatan Snap Token transaksi dengan fallback simulator *mock token* saat offline.
   - Webhook notifikasi pembayaran otomatis untuk sinkronisasi status lunas (`PAID`).
9. **Dashboard Analytics**:
   - Endpoint terpadu untuk metrik eksekutif admin (omset, profit, total order, peringatan produk hampir habis, 5 menu terlaris, dan data grafik bulanan).
10. **Customer Support Live Chat**:
    - Percakapan interaktif pelanggan dan admin beserta status baca (*read receipts*).

---

## Struktur Direktori & Pola Desain

```
Laravel/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php          # Login, Register, Profile, Multi-Alamat
│   │   │   ├── ProductController.php       # CRUD Produk, Search, Filter, Stok
│   │   │   ├── CategoryController.php      # Master Kategori Menu
│   │   │   ├── OrderController.php         # Transaksi ACID, Live Tracking 5-Tahap
│   │   │   ├── VoucherController.php       # Mesin Validasi Promo & Kuota
│   │   │   ├── ReviewController.php        # Ulasan, Rating, Moderasi & Balasan
│   │   │   ├── SalesReportController.php   # Omset Finansial, Laba, AOV, Bazar
│   │   │   ├── PromotionController.php     # Banner & Event Promosi
│   │   │   ├── ChatController.php          # Live Chat Customer Support
│   │   │   ├── DashboardController.php     # Ringkasan Eksekutif & Grafik Admin
│   │   │   ├── HaversineController.php     # Kalkulasi Jarak & Ongkir
│   │   │   ├── MidtransController.php      # Snap Token & Webhook Pembayaran
│   │   │   └── StoreSettingController.php  # Profil Toko & Koordinat Kitchen
│   │   ├── Requests/                       # Form Request Validasi Terpisah
│   │   │   ├── Auth/ (Login, Register, Password, Address, Profile)
│   │   │   ├── StoreProductRequest.php / UpdateProductRequest.php
│   │   │   ├── StoreOrderRequest.php / UpdateOrderRequest.php
│   │   │   ├── StoreVoucherRequest.php / ValidateVoucherRequest.php
│   │   │   ├── StoreReviewRequest.php
│   │   │   └── StoreSalesReportRequest.php
│   │   ├── Resources/                      # API Resources (Serialisasi JSON)
│   │   │   ├── UserResource.php
│   │   │   ├── ProductResource.php
│   │   │   ├── OrderResource.php
│   │   │   ├── VoucherResource.php
│   │   │   └── ReviewResource.php ...
│   │   └── Middleware/
│   │       └── EnsureUserIsAdmin.php
│   ├── Models/                             # 12 Eloquent Models Lengkap
│   └── Traits/
│       └── ApiResponseTrait.php            # Standarisasi Respon Global
├── database/
│   ├── migrations/                         # 10 Skema Tabel Relasional
│   └── seeders/                            # Seeder Master Data Kuliner Realistis
├── resources/views/
│   └── api-docs.blade.php                  # Halaman Dokumentasi Interaktif
└── routes/
    ├── api.php                             # Rute REST API Terkelompok
    └── web.php                             # Rute Dokumentasi Web
```

---

## Panduan Instalasi & Menjalankan Server

### 1. Persyaratan Sistem
- PHP >= 8.2 (dengan ekstensi `pdo_sqlite` / `pdo_mysql`, `curl`, `mbstring`, `openssl`)
- Composer >= 2.x

### 2. Langkah Setup
Masuk ke direktori `Laravel/`:
```bash
cd f:\UKK\Laravel
```

Salin file environment & generate app key:
```bash
cp .env.example .env
php artisan key:generate
```

Jalankan migrasi database beserta seeder lengkap:
```bash
php artisan migrate:fresh --seed
```

Jalankan server backend lokal:
```bash
php artisan serve --port=8000
```

Server API akan aktif di `http://localhost:8000`.
Buka browser dan akses **`http://localhost:8000/api/docs`** untuk melihat dokumentasi API interaktif.

---

## Akun Demo Bawaan (Default Seeders)

| Role | Email | Password |
|---|---|---|
| **Administrator** | `fatihahmadzakky19@gmail.com` | `Fatih123` |
| **Customer 1** | `nizarazzuhra@gmail.com` | `password123` |
| **Customer 2** | `siti@example.com` | `password123` |

---

## Ringkasan Daftar Endpoint API

### 1. Health & Dokumentasi
- `GET /api/health` - Cek status kesehatan backend & database
- `GET /api/docs` - Halaman dokumentasi API interaktif

### 2. Autentikasi (`/api/auth`)
- `POST /api/auth/login` - Login pengguna & pembuatan Bearer Token
- `POST /api/auth/register` - Registrasi pelanggan baru
- `GET /api/auth/profile` - Profil akun yang login (Perlu Token)
- `PUT /api/auth/profile` - Perbarui profil (Perlu Token)
- `POST /api/auth/change-password` - Ganti kata sandi (Perlu Token)
- `POST /api/auth/logout` - Logout dan hapus token aktif (Perlu Token)
- `GET /api/auth/addresses` - Daftar alamat pengiriman tersimpan
- `POST /api/auth/addresses` - Tambah alamat baru

### 3. Produk (`/api/products`)
- `GET /api/products/visible` - Katalog menu aktif untuk etalase
- `GET /api/products` - Daftar produk dengan filter search, category, sort, & pagination
- `GET /api/products/{id}` - Detail satu produk
- `POST /api/products` - Tambah produk baru
- `PUT /api/products/{id}` - Update data produk
- `DELETE /api/products/{id}` - Hapus produk (Soft Delete)
- `POST /api/products/{id}/restore` - Pulihkan produk yang dihapus
- `POST /api/products/{id}/toggle-visibility` - Toggle status tampilan produk
- `POST /api/products/{id}/stock` - Update langsung jumlah stok

### 4. Pesanan (`/api/orders`)
- `GET /api/orders` - Daftar seluruh pesanan (Filter status, email, search)
- `GET /api/orders/{id}` - Detail rincian pesanan dan item
- `POST /api/orders` - Checkout pesanan baru (ACID + Auto Deduct Stock)
- `POST /api/orders/{id}/advance_stage` - Majukan alur status (*RECEIVED -> COOKING -> READY -> DELIVERING -> COMPLETED*)
- `POST /api/orders/{id}/confirm` - Konfirmasi barang diterima dari pelanggan
- `POST /api/orders/{id}/proof` - Unggah bukti foto serah terima/pembayaran
- `POST /api/orders/{id}/cancel` - Batalkan pesanan & kembalikan stok
- `GET /api/orders/stats` - Statistik jumlah order per status

### 5. Voucher & Promo (`/api/vouchers`)
- `GET /api/vouchers` - Daftar voucher aktif
- `GET /api/vouchers/all` - Seluruh voucher untuk admin
- `POST /api/vouchers/validate` - Validasi kode promo, kuota, min spend, & hitung diskon
- `POST /api/vouchers` - Tambah voucher baru
- `PUT /api/vouchers/{id}` - Update voucher
- `POST /api/vouchers/{id}/toggle-status` - Aktifkan/Nonaktifkan voucher

### 6. Ulasan & Rating (`/api/reviews`)
- `GET /api/reviews` - Daftar ulasan pelanggan (terpin di atas, terbaru)
- `GET /api/reviews/summary` - Ringkasan rata-rata rating & distribusi bintang
- `POST /api/reviews` - Kirim ulasan baru
- `POST /api/reviews/{id}/like` - Tambah suka (Like)
- `POST /api/reviews/{id}/reply` - Kirim balasan penjual
- `POST /api/reviews/{id}/moderate` - Moderasi ulasan (Status, Pin, Hide)

### 7. Laporan Omset & Finansial (`/api/reports/sales`)
- `GET /api/reports/sales?year=2026` - Laporan omset, laba, total order, & AOV
- `GET /api/reports/sales/years` - Daftar tahun laporan tersedia
- `POST /api/reports/sales` - Simpan/perbarui data omset bulanan

### 8. Dashboard Analytics (`/api/dashboard/overview`)
- `GET /api/dashboard/overview` - Metrik finansial, inventori stok menipis, recent orders, & top menu

### 9. Kalkulasi Jarak & Delivery (`/api/haversine/distance`)
- `POST /api/haversine/distance` - Menghitung jarak KM, estimasi waktu, & ongkos kirim

### 10. Pembayaran Midtrans (`/api/midtrans`)
- `POST /api/midtrans/token` - Pembuatan Snap Token transaksi
- `POST /api/midtrans/webhook` - Webhook otomatis update status pembayaran

---

Copyright 2026 Nefakky Marketplace. Dikembangkan untuk Uji Kompetensi Keahlian (UKK) & Produksi Marketplace Kuliner.
