# 🏢 Enterprise Command Center UI/UX Guidelines — Nefakky Admin Application

**Produk**: Nefakky - Enterprise Admin Command Center & Kitchen Management (Aplikasi Pengelola)  
**Versi Design**: 2.6.0 (Google Stitch AI UI System & Enterprise Analytics)  
**Tanggal Terakhir Diperbarui**: 11 Agustus 2026  
**Penulis**: Tim Pengembang Nefakky (Fatih Ahmad Zakky) & Google Stitch AI Design System  

---

## 📖 1. Visi & Prinsip Utama Desain Antarmuka Admin

Antarmuka Pengelola **Nefakky Enterprise Command Center** (`src/app/admin/page.tsx`) dirancang khusus sebagai **Executive Control Center** berstandar enterprise. Halaman ini memadukan visualisasi data keuangan, operasional dapur real-time, dan manajemen inventaris dengan estetika **Google Stitch Dark Espresso Luxury** yang profesional dan berwibawa.

### Prinsip Utama UI/UX Admin:
1. **Dark Executive Command Layout**: Penggunaan warna latar Espresso Gelap (`#25160E` & `#3C2A21`) untuk atmosfer pusat kendali eksekutif yang tinggi kontras dan nyaman dipandang mata.
2. **Visual Analytics & Interactive Chart Manager**: Grafik Omset Penjualan Interaktif (`AdminSalesChart.tsx`) dari Juni 2026 yang dapat disunting secara *real-time* via Modal **Edit Data Grafik**.
3. **Pusat Operasional Dapur Live Sync**: Pengendalian alur pengerjaan pesanan dapur dengan pembaruan status 1-klik yang otomatis tersinkronisasi ke **Firebase Realtime Database** (`rtdb`).
4. **Modal Input Omset Manual Kasir/Bazar**: Form pencatatan penjualan offline lengkap dengan multi-select pill checkboxes untuk menu terlaris (*Best-Seller*) dan kurang laris.
5. **Kontrol Inventaris & Alamat Produksi Resmi**: Manajemen persediaan produk yang menyertakan lokasi produksi terpusat: *Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Jawa Barat*.
6. **Customer Service Live Chat Desk**: Ruang tanggapan pesan pelanggan secara *live* dengan indikator pesan belum dibaca.

---

## 🎨 2. Toko Warna Executive Dark Mode (`admin/page.tsx`)

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
* **Executive Container**: `max-w-[1400px] mx-auto px-6 py-8 space-y-8`.
* **KPI Metrics Grid**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`.
* **Analytics & Quick Action Grid**: `grid grid-cols-1 lg:grid-cols-12 gap-8`.

---

## 🖥️ 4. Spesifikasi Halaman & Komponen Admin (Halaman Selesai)

### 4.1 Header Utility & Security Bar
* **Branding Bar**: Badge Espresso `#25160E` dengan judul Playfair Display *Nefakky Enterprise Command Center*.
* **Live System Status**: Indikator pulsa hijau dengan status **`SYSTEM ONLINE 100%`**.
* **Quick Action Controls**:
  - Tombol **`+ Input Omset Manual / POS`** (Membuka modal pencatatan penjualan offline).
  - Tombol **`🏪 Lihat Tampilan Toko Pelanggan`** (Beralih ke `/menu`).
  - Tombol **`Sign Out`** (Keluar dari sesi admin).

---

### 4.2 KPI Executive Metrics Grid (4 Kartu Ringkasan Utama)
1. **Total Omset Kotor (Gross Revenue)**:
   - Display nominal Rupiah akumulasi penjualan + indikator grafik naik.
2. **Estimasi Laba Bersih (Net Profit ~40%)**:
   - Display nominal keuntungan bersih restoran dengan aksen warna Emerald Green (`#10B981`).
3. **Total Transaksi Selesai**:
   - Jumlah pesanan yang berhasil diproses hingga status `COMPLETED`.
4. **Rating Kepuasan Pelanggan**:
   - Skor rata-rata ulasan bintang (`★ 4.9`) beserta total ulasan pembeli.

---

### 4.3 Interactive Sales Chart & Editor Modal (`src/components/AdminSalesChart.tsx`)
* **Custom Visual SVG Line & Area Chart**:
  - Menampilkan tren performa toko dari **Juni 2026 (Event Bazar >10 Juta)** hingga bulan berjalan.
  - Kurva Ganda: **Omset Kotor (Biru)** vs **Laba Bersih (Hijau)** dengan titik koordinat interaktif.
* **Modal Sunting Data Grafik (`✏️ Edit Data Grafik`)**:
  - Admin dapat mengubah nominal omset kotor, laba bersih, status event bazar, dan badge catatan per bulan secara *real-time*.
  - Perubahan data tersimpan dan langsung mengubah bentuk kurva grafik secara instan.

---

### 4.4 Modal Input Omset Manual (Offline / Bazar Logger)
* **Form Pencatatan Transaksi Off-Grid**:
  - Input Tanggal, Nominal Omset Kotor, Nominal Laba Bersih, dan Catatan Event.
* **Multi-Select Pill Checkboxes**:
  - Checkbox multi-pilihan untuk menandai menu paling laris (*Best Seller*) dan kurang laris pada penjualan manual.

---

### 4.5 Manajemen Operasional Dapur Real-Time (Kitchen Live Orders Table)
* **Dual Firebase Sync**: Terkoneksi langsung ke **Firebase Realtime Database** (`rtdb`) di node `live_orders/` dan Firestore `orders`.
* **Sequential Status Controller 1-Klik**:
  - Admin dapat memperbarui status pesanan dapur secara berurutan:
    - ⏳ `RECEIVED` $\rightarrow$ 🔥 `COOKING` $\rightarrow$ 📦 `READY` $\rightarrow$ 🛵 `SHIPPING` $\rightarrow$ ✅ `COMPLETED`.
  - Setiap kali status diklik, pesanan di layar pelanggan (`/notifications`) akan bergerak otomatis tanpa *refresh*.
* **Status Pembayaran Badge**:
  - Pengaturan status `PAID` (Lunas via Midtrans), `UNPAID`, atau `REFUNDED`.

---

### 4.6 Manajemen Produk & Inventaris Katalog (Product Catalog Manager)
* **Katalog Produk**: Pengelolaan 6 produk utama (*Ayam Bakar, Gudeg, Garang Asam, Krecek, Jus 3-Varian, Kombo Hemat*) dan produk baru.
* **Form Modifikasi Produk**:
  - Ubah Harga Normal, Diskon (cth: *15% OFF*), Stok Tersedia, Visibilitas Katalog, dan Foto Utama.
* **Tampilan Alamat Produksi Resmi**:
  - Seluruh item secara otomatis menggunakan lokasi produksi terpusat: *Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Jawa Barat*.

---

### 4.7 Manajemen Voucher Promo & Diskon (`vouchers` Collection)
* **Voucher Manager**: Pengaturan Kode Voucher (cth: `WEEKENDSERU`), Diskon Persen (15%), Kuota Batas Penggunaan (cth: `12/500`).
* **Fitur Auto-Expire**: Voucher dan promo banner terkait akan otomatis dinonaktifkan jika batas kuota telah habis.

---

### 4.8 Live Customer Service Support Desk
* **Live In-App Messaging**: Admin dapat melihat pesan obrolan masuk dari pelanggan dan memberikan balasan pesan secara instan.
* **Realtime Sync**: Terhubung ke Firebase Realtime Database (`chat_messages`).
* **Unread Badge**: Indikator pesan baru yang belum dibaca oleh admin.
