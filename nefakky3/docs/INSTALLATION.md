# Panduan Instalasi & Setup Lingkungan (INSTALLATION.md) — Nefakky Marketplace

**Target Platform**: Windows 10/11, macOS, Linux (Ubuntu/Debian)  
**Versi Sistem**: Nefakky v4.5.0 (Next.js 14 Frontend + Laravel 12 Backend + Reverb WebSocket)  
**Penulis**: Tim Pengembang Nefakky (Fatih Ahmad Zakky)  

---

## 1. Prasyarat Perangkat Lunak (System Prerequisites)

Sebelum memulai proses instalasi, pastikan lingkungan komputer Anda memenuhi spesifikasi berikut:

| Perangkat Lunak | Versi Minimal | Keterangan & Rekomendasi |
| :--- | :--- | :--- |
| **Node.js** | `v18.18.x` atau `v20.x` LTS | Runtime JavaScript untuk menjalankan Next.js 14 |
| **NPM** | `v10.x` atau lebih baru | Package manager untuk dependensi frontend |
| **Python** | `v3.10.x` atau lebih baru | Diperlukan untuk mengeksekusi script generator 33 ikon kustom (`scripts/gen_icons.py`) |
| **PHP** | `v8.2.x` atau `v8.3.x` | Diperlukan jika menjalankan backend API Laravel (ekstensi: `pdo_sqlite`, `pdo_mysql`, `curl`, `mbstring`) |
| **Composer** | `v2.7.x` | Package manager dependensi PHP |
| **Git** | `v2.x` | Kontrol versi kode sumber |

---

## 2. Langkah Instalasi Frontend (`nefakky3`)

### 2.1 Masuk ke Direktori Frontend
Buka terminal dan arahkan ke folder `nefakky3`:
```bash
cd f:\UKK\nefakky3
```

### 2.2 Pasang Seluruh Dependensi Node.js
```bash
npm install
```

### 2.3 Konfigurasi Berkas Lingkungan (`.env.local`)
Buat atau periksa berkas `.env.local` di dalam direktori `nefakky3`:
```env
# URL Backend API Laravel & WebSocket Reverb
NEXT_PUBLIC_LARAVEL_API_URL=http://localhost:8000/api
NEXT_PUBLIC_REVERB_APP_KEY=nefakky-reverb-key
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=ws

# Konfigurasi Firebase Authentication & Firestore
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Midtrans Payment Gateway Sandbox Client Key
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxx
NEXT_PUBLIC_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js

# Koordinat Dapur Pusat & Provider Peta (Default: OpenStreetMap)
NEXT_PUBLIC_CENTRAL_KITCHEN_LAT=-6.2088
NEXT_PUBLIC_CENTRAL_KITCHEN_LNG=106.8456
NEXT_PUBLIC_MAP_PROVIDER=openstreetmap
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

### 2.4 Eksekusi Generator 33 Ikon Kustom (Anti-AI-Slop Engine)
Pastikan 33 ikon kustom telah ter-generate ke dalam `src/components/icons/CustomIcons.tsx`:
```bash
python scripts/gen_icons.py
```
*Output yang diharapkan:*
```
Processed search -> search.png
Processed basket -> basket.png
...
Processed cooking -> cooking.png
Processed megaphone -> megaphone.png
Processed gear -> settings.png
CustomIcons.tsx with 33 user icons generated successfully!
```

### 2.5 Jalankan Pengecekan Tipe TypeScript (Typecheck Validation)
Pastikan tidak ada kesalahan ketik atau broken imports:
```bash
npx tsc --noEmit
```
*Hasil harus bersih (Exit code 0).*

### 2.6 Jalankan Server Frontend Mode Pengembangan
```bash
npm run dev
```
Aplikasi web kini dapat diakses di peramban pada alamat: **`http://localhost:3000`**

---

## 3. Langkah Instalasi Backend (Laravel 12 API — Opsional)

Jika ingin menjalankan server backend Laravel dan server WebSocket lokal:

### 3.1 Masuk ke Direktori Backend
```bash
cd f:\UKK\Laravel
```

### 3.2 Pasang Dependensi Composer
```bash
composer install
```

### 3.3 Konfigurasi File `.env` Backend
```bash
cp .env.example .env
php artisan key:generate
```

### 3.4 Jalankan Migrasi Basis Data
```bash
# Buat file database SQLite (jika menggunakan SQLite)
New-Item -ItemType File -Force -Path database/database.sqlite

# Migrasi tabel dan data awal
php artisan migrate:fresh --seed
```

### 3.5 Jalankan Server REST API & Reverb WebSocket
Buka dua terminal terpisah:
```bash
# Terminal 1: REST API Server (Port 8000)
php artisan serve --port=8000

# Terminal 2: WebSocket Broadcaster Reverb (Port 8080)
php artisan reverb:start --port=8080
```

---

## 4. Akun Default untuk Pengujian

| Role Akun | Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Super Administrator** | `admin@nefakky.com` | `admin123` | Akses penuh ke seluruh menu `/admin` (Dashboard, Dapur, Stok, Voucher, CS Chat, Settings) |
| **Pelanggan Percobaan** | `customer@nefakky.com` | `customer123` | Belanja, Checkout GPS, Pelacakan Pesanan, Ulasan Bintang, CS Chat |

---

## 5. Perintah Pengujian & Kompilasi Produksi

* **Build Bundle Produksi**:
  ```bash
  npm run build
  ```
* **Jalankan Server Produksi**:
  ```bash
  npm run start
  ```
* **Linting Kode**:
  ```bash
  npm run lint
  ```
