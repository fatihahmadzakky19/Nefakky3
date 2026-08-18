# 🏢 Enterprise Command Center UI/UX Guidelines — Nefakky Admin Application

**Produk**: Nefakky - Enterprise Admin Command Center & Kitchen Management (Aplikasi Pengelola)  
**Versi Design**: 3.0.0 (Google Stitch AI UI System, Enterprise Analytics & Export Engine)  
**Tanggal Terakhir Diperbarui**: 18 Agustus 2026  
**Status**: Production Standard  
**Penulis**: Tim Pengembang Nefakky (Fatih Ahmad Zakky) & Google Stitch AI Design System  

---

## 📖 1. Visi & Prinsip Utama Desain Antarmuka Admin

Antarmuka Pengelola **Nefakky Enterprise Command Center** (`src/app/admin/`) dirancang khusus sebagai **Executive Control Center** berstandar enterprise. Antarmuka ini menggabungkan visualisasi data finansial, operasional dapur live sync, kontrol inventaris, manajemen voucher promo, moderasi ulasan, dan live customer service desk dengan estetika **Google Stitch Dark Espresso Luxury** yang profesional dan elegan.

### Prinsip Utama UI/UX Admin:
1. **Modular Tab Architecture**: Tata letak modular dengan 6 sub-modul terdedikasi (`/admin` Ringkasan Bisnis, `/admin/orders` Pesanan Masuk, `/admin/products` Katalog Produk, `/admin/promotions` Voucher Promo, `/admin/reviews` Moderasi Ulasan, `/admin/settings` Pengaturan & CS Desk).
2. **Visual Analytics & Interactive Chart Manager**: Grafik Omset Penjualan Interaktif SVG (`AdminSalesChart.tsx`) dari Juni 2026 yang dapat disunting secara *real-time* via Modal **Edit Data Grafik**.
3. **Pusat Operasional Dapur Live Sync**: Pengendalian alur pengerjaan pesanan dapur dengan pembaruan status 1-klik yang otomatis tersinkronisasi ke **Firebase Realtime Database** (`rtdb`) dan **Laravel 12 REST API**.
4. **Corporate Export Engine (`exportUtils.ts`)**: Ekspor data instan ke Microsoft Excel (.xls) berformat styling resmi, CSV, dan format cetak PDF dengan kop resmi restoran.
5. **Modal Input Omset Manual Kasir/Bazar**: Form pencatatan penjualan offline/bazar lengkap dengan multi-select pill checkboxes untuk menu terlaris (*Best-Seller*) dan kurang laris.
6. **Kontrol Inventaris & Alamat Produksi Resmi**: Manajemen persediaan produk yang menyertakan lokasi produksi terpusat: *Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Jawa Barat*.
7. **Customer Service Live Chat Desk**: Meja pelayanan percakapan langsung dengan pelanggan, notifikasi audio, dan counter badge pesan belum dibaca.

---

## 🎨 2. Toko Warna Executive Palette (`admin/page.tsx`)

```css
:root {
  /* Dark Executive Canvas */
  --admin-bg-espresso-dark: #25160E;      /* Primary Command Canvas Background */
  --admin-card-espresso: #3C2A21;         /* Card Container Fill */
  --admin-card-border: rgba(217, 119, 6, 0.25); /* Subtle Gold Border */

  /* Text & Accents */
  --admin-text-cream: #FBF9F5;             /* High-Contrast Cream Header Text */
  --admin-text-muted: #AA9084;             /* Subtitle & Secondary Label Text */
  --admin-accent-gold: #FFA26A;            /* Primary Gold Accent & Highlights */
  --admin-accent-terracotta: #934B19;      /* Action Button Accent */

  /* Analytics & Status Indicators */
  --metric-net-profit: #10B981;           /* Emerald 500 - Laba Bersih & Growth */
  --metric-gross-revenue: #3B82F6;         /* Blue 500 - Omset Kotor */
  --metric-warning: #F59E0B;               /* Amber 500 - In-Progress Cooking */
  --metric-danger: #EF4444;                /* Rose 500 - Unpaid / Cancelled */
}
```

---

## 📐 3. Tipografi & Layout Grid Admin

### 3.1 Tipografi
* **Header & Executive Titles**: `Playfair Display`, `serif` (Digunakan untuk judul utama *Nefakky Enterprise Command Center*).
* **Metric Numbers & Controls**: `Inter`, `sans-serif` (Digunakan untuk nominal Rupiah, statistik, dan tombol navigasi).
* **Order ID & Technical Data**: `JetBrains Mono` / `ui-monospace` (Digunakan untuk Order ID `#ORD-4837`, token transaksi, dan timestamp).

### 3.2 System Grid Layout
* **Sidebar Layout**: Fixed left navigation bar `w-72` dengan drawer toggle untuk tampilan mobile.
* **Executive Container**: `max-w-[1400px] mx-auto px-6 py-8 space-y-8`.
* **KPI Metrics Grid**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`.
* **Analytics & Quick Action Grid**: `grid grid-cols-1 lg:grid-cols-12 gap-8`.

---

## 🖥️ 4. Spesifikasi Halaman & Komponen Admin (6 Modul Utama)

### 4.1 Header Utility & Live Alert Bar (`src/components/admin/AdminHeader.tsx`)
* **Live System Status**: Indikator status `SYSTEM ONLINE 100%`.
* **CS Chat Alert Popover**: Dropdown interaktif notifikasi pesan baru pelanggan lengkap dengan cuplikan teks dan tautan langsung ke chat.
* **Quick Export Actions**: Tombol cetak PDF dan ekspor Excel/CSV langsung di header.
* **Profile & Sign Out**: Avatar pengelola (*Fatih Ahmad Zakky*) dengan konfirmasi logout aman.

---

### 4.2 Tab 1: Ringkasan Bisnis & Dashboard Eksekutif (`AdminDashboardTab.tsx`)
1. **5 KPI Executive Metrics Cards**:
   - **Total Omset Penjualan**: Akumulasi pendapatan bruto dari seluruh transaksi terverifikasi.
   - **Estimasi Laba Bersih (40% Margin)**: Nilai estimasi margin keuntungan bersih restoran (`#10B981`).
   - **Total Pesanan Masuk & Selesai**: Jumlah pesanan diproses dan persentase keberhasilan.
   - **Average Order Value (AOV)**: Rata-rata nominal pengeluaran pelanggan per transaksi.
   - **Rating Kepuasan Pelanggan**: Rata-rata ulasan bintang (`★ 4.9/5.0`) dari pelanggan.
2. **Interactive Sales Chart & Custom Editor Modal (`AdminSalesChart.tsx`)**:
   - Kurva ganda: Omset Kotor (Biru) vs Laba Bersih (Hijau) yang dimulai dari **Juni 2026 (Event Bazar >10 Juta)**.
   - Tombol **`✏️ Edit Data Grafik`**: Membuka modal penyuntingan nominal omset, laba, status bazar, dan badge keterangan per bulan dengan update instan.
3. **Peringkat Menu Makanan Terlaris & Kurang Laris**:
   - Visual progress bar dan nominal pendapatan per item menu.
4. **Corporate Export Engine (`exportUtils.ts`)**:
   - Tombol **`📥 Ekspor Laporan Bisnis (.xls)`** yang menghasilkan berkas Microsoft Excel lengkap dengan 5 seksi laporan resmi.

---

### 4.3 Tab 2: Manajemen Pesanan Dapur & Kasir (`AdminOrdersTab.tsx`)
* **Dual State Sync**: Terkoneksi ke **Firebase Realtime Database** (`live_orders/`) dan **Laravel 12 REST API**.
* **Sequential Status Controller 1-Klik**:
  - Pengerjaan dapur: ⏳ `RECEIVED` $\rightarrow$ 🔥 `COOKING` $\rightarrow$ 📦 `READY` $\rightarrow$ 🛵 `SHIPPING` $\rightarrow$ ✅ `COMPLETED`.
* **Status Pembayaran Badge**:
  - Pengaturan status `PAID` (Lunas via Midtrans), `UNPAID` (Menunggu Pembayaran), atau `REFUNDED`.
* **Modal Rincian Pesanan & Cetak Struk**:
  - Modal detail pesanan pelanggan lengkap dengan tombol cetak struk PDF resmi.

---

### 4.4 Tab 3: Manajemen Katalog Produk & Stok (`AdminProductsTab`)
* **Katalog Produk CRUD**: Tambah produk, edit harga normal, diskon persentase, persediaan stok, deskripsi bahan, dan foto utama.
* **Alamat Produksi Terpusat**:
  - *Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Jawa Barat*.

---

### 4.5 Tab 4: Manajemen Promosi & Voucher Diskon (`AdminPromotionsTab.tsx`)
* **Generator Voucher**: Pengaturan kode voucher (cth: `WEEKENDSERU`), persentase diskon (10-50%), batas *Minimum Spend*, kuota penggunaan (`used_count / max_usage`), dan rentang tanggal aktif.
* **Fitur Auto-Expiry**: Voucher dinonaktifkan otomatis ketika batas kuota penggunaan telah tercapai.
* **Pratinjau Banner Promo**: Live preview visual banner promo yang akan tampil di halaman belanja pelanggan.

---

### 4.6 Tab 5: Moderasi Ulasan & Testimoni Pelanggan (`AdminReviewsTab.tsx`)
* **Ulasan Moderation**: Fitur sematkan ulasan unggulan (*Pin Review*), balas ulasan pembeli, dan hapus ulasan tidak pantas.
* **Statistik Kepuasan**: Grafik distribusi rating bintang 1-5 dan analisis sentimen ulasan.

---

### 4.7 Tab 6: Pengaturan Toko & Meja CS Chat (`AdminSettingsTab.tsx`)
* **Informasi Operasional**: Jam buka toko, nomor WhatsApp hotline, radius pengiriman, dan biaya ongkir dasar.
* **Customer Service Live Chat Desk**:
  - Ruang percakapan live interaktif dengan pembeli yang tersinkronisasi via Firebase Realtime Database (`chat_messages`).
  - Dilengkapi notifikasi audio Web Audio API saat ada pesan baru masuk dari pelanggan.

---

*Lihat juga: **[DESIGN_USER.md](file:///f:/UKK/nefakky3/DESIGN_USER.md)** untuk spesifikasi antarmuka pelanggan dan **[DESIGN.md](file:///f:/UKK/nefakky3/DESIGN.md)** untuk Master Design System.*
