# Panduan Instalasi & Setup Lingkungan (INSTALLATION.md) — Nefakky Marketplace

**Target Platform**: Windows 10/11, macOS, Linux (Ubuntu/Debian)  
**Versi Sistem**: Nefakky v3.6.0 (Laravel 12 Backend + Next.js 14 Frontend)  
**Penulis**: Tim Pengembang Nefakky (Fatih Ahmad Zakky)  

---

## 1. Prasyarat Perangkat Lunak (System Prerequisites)

Sebelum memulai proses instalasi, pastikan sistem Anda telah terpasang:

| Perangkat Lunak | Versi Minimal | Keterangan & Rekomendasi |
| :--- | :--- | :--- |
| **PHP** | `8.2.x` atau `8.3.x` | Pastikan ekstensi aktif: `pdo_sqlite`, `pdo_mysql`, `gd`, `mbstring`, `fileinfo`, `curl`, `openssl` |
| **Composer** | `2.7.x` atau lebih baru | Package manager resmi untuk dependensi PHP / Laravel |
| **Node.js** | `18.18.x` atau `20.x` LTS | Runtime JavaScript untuk menjalankan Next.js |
| **NPM** | `10.x` atau lebih baru | Package manager untuk dependensi Node.js |
| **Git** | `2.x` | Untuk kontrol versi kode sumber |

---

## 2. Langkah Instalasi Backend (Laravel 12 API)

### 2.1 Masuk ke Direktori Backend
Buka terminal (PowerShell / Command Prompt / Bash) dan arahkan ke folder `Laravel`:
```bash
cd f:\UKK\Laravel
```

### 2.2 Pasang Seluruh Dependensi PHP
```bash
composer install
```

### 2.3 Konfigurasi Berkas Environment (`.env`)
Salin berkas template konfigurasi `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buat App Encryption Key resmi:
```bash
php artisan key:generate
```

### 2.4 Konfigurasi Basis Data & Eksekusi Migrasi
Secara default, Laravel dikonfigurasi menggunakan basis data SQLite (`database/database.sqlite`) atau MySQL.
Jika file database sqlite belum ada, buat file kosong:
```bash
# Untuk Windows PowerShell:
New-Item -ItemType File -Force -Path database/database.sqlite

# Untuk Linux / macOS:
touch database/database.sqlite
```

Jalankan migrasi tabel basis data dan seeder data awal:
```bash
php artisan migrate:fresh --seed
```

### 2.5 Menjalankan Server Backend API
```bash
php artisan serve --port=8000
```
Backend REST API sekarang aktif dan dapat diakses di: **`http://localhost:8000/api`**  
Dokumentasi interaktif OpenAPI dapat diakses di: **`http://localhost:8000/docs/api`**

### 2.6 Menjalankan WebSocket Server Laravel Reverb (Opsional untuk Realtime)
Buka tab terminal baru:
```bash
cd f:\UKK\Laravel
php artisan reverb:start
```
WebSocket Server Reverb aktif di: **`ws://localhost:8080`**

---

## 3. Langkah Instalasi Frontend (Next.js 14)

### 3.1 Masuk ke Direktori Frontend
Buka terminal baru dan arahkan ke folder `nefakky3`:
```bash
cd f:\UKK\nefakky3
```

### 3.2 Pasang Seluruh Dependensi NPM
```bash
npm install
```

### 3.3 Konfigurasi Environment Variables Frontend (`.env.local`)
Pastikan berkas `.env.local` atau `.env` berisi variabel berikut:
```env
# Backend API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Laravel Reverb / Pusher WebSocket Config
NEXT_PUBLIC_REVERB_APP_KEY=nefakky-reverb-key
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http

# Midtrans Payment Gateway Client Key (Sandbox)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-XXXXXX
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false

# Firebase Config (Optional / Fallback)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDummyKeyForNefakkyDemo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nefakky-marketplace.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nefakky-marketplace
```

### 3.4 Menjalankan Server Frontend Development
```bash
npm run dev
```
Buka peramban browser dan akses: **`http://localhost:3000`**

---

## 4. Verifikasi & Pengujian Hasil Instalasi

Setelah kedua server berjalan, lakukan validasi keandalan sistem:

```bash
# Uji tipe data TypeScript frontend
cd f:\UKK\nefakky3
npx tsc --noEmit

# Uji automated test suite frontend
cd f:\UKK\nefakky3
npm test

# Uji PHPUnit backend
cd f:\UKK\Laravel
php artisan test
```

Jika seluruh pengujian mengembalikan status **PASSED ✅**, maka platform telah 100% siap digunakan untuk operasional!

---

## 5. Pemecahan Masalah Umum (Troubleshooting FAQ)

### 1. Galat "CORS Policy Blocked" saat Fetch API dari Frontend
* **Penyebab**: Domain origin Next.js (`http://localhost:3000`) belum diizinkan di konfigurasi Laravel.
* **Solusi**: Buka berkas `f:\UKK\Laravel\config\cors.php` dan pastikan `allowed_origins` memuat `['http://localhost:3000', 'http://127.0.0.1:3000']`.

### 2. Peta OpenStreetMap / Leaflet Tidak Menampilkan Tile Gambar
* **Penyebab**: Koneksi internet terputus atau CSS Leaflet belum termuat.
* **Solusi**: Pastikan berkas `src/app/layout.tsx` memuat stylesheet Leaflet atau terhubung ke internet untuk memuat tile OSM dari `tile.openstreetmap.org`.

### 3. Pop-up Snap Midtrans Tidak Terbuka
* **Penyebab**: Script Snap `app.sandbox.midtrans.com/snap/snap.js` diblokir oleh ad-blocker peramban.
* **Solusi**: Nonaktifkan ad-blocker pada peramban untuk domain `localhost:3000`.
