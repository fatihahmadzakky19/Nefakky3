# 🎨 Master Design System & UI/UX Guidelines — Nefakky

**Produk**: Nefakky - Artisanal Food & Culinary Marketplace  
**Versi Design**: 3.0.0 (Google Stitch AI UI System, Artisanal Luxury & Enterprise Command Center)  
**Tanggal Terakhir Diperbarui**: 18 Agustus 2026  
**Status**: Production Standard  
**Penulis**: Tim Pengembang Nefakky (Fatih Ahmad Zakky) & Google Stitch AI Design System  

---

## 📚 Dokumentasi Desain Terpisah (Separated Design Specs)

Dokumentasi spesifikasi desain antarmuka **Nefakky** dibagi menjadi 2 dokumen mendalam sesuai peran dan arsitektur pengguna:

1. 🛒 **[DESIGN_USER.md](file:///f:/UKK/nefakky3/DESIGN_USER.md)** — Spesifikasi UI/UX Lengkap untuk Aplikasi Pelanggan (*Customer App*).
   - *Beranda Hero Banner, Katalog Menu 3-Kategori, Modal Varian 3-Jus Interaktif, Alur Checkout 4-Tahap Midtrans, Stepper Lacak Pesanan 5-Tahap Real-Time (Firebase RTDB), Floating Order Tracker Widget, Halaman Profil & CS Chat, Ulasan Komunitas, dan Modal Cetak Struk PDF Resmi.*

2. 🏢 **[DESIGN_ADMIN.md](file:///f:/UKK/nefakky3/DESIGN_ADMIN.md)** — Spesifikasi UI/UX Lengkap untuk Enterprise Command Center & Dapur (*Admin App*).
   - *Executive Dark Command Layout, 5 Metrik KPI Bisnis, Editor Grafik Omset Penjualan Interaktif SVG, Modal Input Omset Manual POS/Bazar, Kitchen Order Management 5-Tahap 1-Klik, Manajemen Inventaris Produk, Generator Voucher Promo & Auto-Expiry, Moderasi Ulasan, dan Export Engine Excel (.xls)/PDF/CSV.*

---

## 📖 Filosofi Desain: "Google Stitch Artisanal Luxury"

Desain **Nefakky** mengusung konsep **"Google Stitch Artisanal Luxury"**. Filosofi ini memadukan kehangatan otentik hidangan tradisional Nusantara dengan standar desain digital modern (*high-end D2C culinary e-commerce & enterprise command dashboard*).

### 4 Pilar Utama Desain:
1. **Warmth & Authenticity**: Nuansa warna kopi (*Espresso*) dan tanah liat (*Terracotta*) yang mencerminkan kehangatan resep masakan tradisional rumahan berkualitas tinggi.
2. **Clarity & Effortless Navigation**: Alur pemesanan makanan yang ringkas dan bebas hambatan (pemilihan rasa 3-jus tanpa reload halaman, GPS pinpoint map, dan checkout 4-tahap).
3. **Real-time Live Feedback**: Visualisasi status dapur dan pengiriman secara instan tanpa perlu memuat ulang peramban (*Zero Page Reload via Firebase Realtime Database*).
4. **Enterprise Operational Precision**: Dashboard eksekutif yang menyajikan data finansial, inventaris, dan pesanan secara terstruktur dengan modul ekspor standar korporat.

---

## 🎨 Master Color Palette & Design Tokens

### 1. Primary & Brand Palette
```css
:root {
  /* Google Stitch Primary Espresso Palette */
  --primary-espresso-dark: #25160E;       /* Deep Espresso Base (Navbar, Header & Brand Identity) */
  --primary-espresso-container: #3C2A21;  /* Dark Container Fill & Active Button Highlights */
  --primary-on-container: #AA9084;        /* Muted Warm Cream Subtitle Text */

  /* Google Stitch Accent & Terracotta Palette */
  --secondary-terracotta: #934B19;       /* Terracotta Primary CTA & Action Buttons */
  --secondary-amber: #FFA26A;            /* Soft Amber Container Highlight & Badges */
  --terracotta-on-container: #783603;    /* Deep Terracotta High-Contrast Text */
  --accent-gold: #D97706;                /* Warm Gold Highlight & 5-Star Ratings */

  /* Surface & Neutral Canvas Colors */
  --surface-warm-cream: #FBF9F5;         /* Main Page Background Canvas */
  --surface-white: #FFFFFF;              /* Pure White Card Background */
  --surface-muted-cream: #F5F3EF;        /* Input Fill & Secondary Background */
  --surface-border: rgba(147, 75, 25, 0.15); /* Subtle Terracotta Border */

  /* Semantic Status Indicators */
  --status-completed: #10B981;           /* Emerald Green - Selesai / Lunas */
  --status-cooking: #934B19;             /* Terracotta - Sedang Dimasak */
  --status-delivering: #3B82F6;          /* Royal Blue - Dalam Pengiriman */
  --status-warning: #F59E0B;             /* Amber Gold - Menunggu Pembayaran / Diterima */
  --status-danger: #EF4444;              /* Rose Red - Dibatalkan / Gagal */
}
```

---

## 📐 Tipografi & Sistem Hirarki

Aplikasi Nefakky menggunakan kombinasi 3 keluarga font yang saling melengkapi:

| Font Family | Kategori | Penggunaan Utama | Contoh Komponen |
| :--- | :--- | :--- | :--- |
| **`Playfair Display`** | Serif | Display Title, Judul Hero Banner, Nama Restoran, Kop Struk PDF | `Hero Section`, `Navbar Logo`, `Receipt Header` |
| **`Inter`** | Sans-Serif | Body text, Label Form, Deskripsi Menu, Harga Nominal Rupiah | `Product Cards`, `Checkout Form`, `Reviews` |
| **`JetBrains Mono`** | Monospace | Order ID, Kode Voucher, Snap Token Transaksi, Koordinat GPS | `#ORD-9281`, `WEEKENDSERU`, `-6.4912, 106.7942` |

---

## 🧱 Komponen Utama & Sistem Grid

### Grid Layout Breakpoints
* **Mobile (< 640px)**: 1 Kolom vertikal, fixed bottom action bars, hamburger sheet navigation.
* **Tablet (640px - 1024px)**: 2 Kolom grid untuk produk, tab checkout horizontal.
* **Desktop (1024px - 1280px)**: 3-4 Kolom katalog produk, sidebar admin tetap (fixed `w-72`).
* **Wide Enterprise (> 1280px)**: Max container width `1400px` untuk analitik admin command desk.

### Glassmorphism & Card Elevation
* **Card Standar**: `bg-white rounded-3xl p-6 border border-amber-900/10 shadow-sm hover:shadow-xl transition-all duration-300`
* **Glassmorphism Container**: `bg-white/85 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl`
* **Executive Dark Container**: `bg-[#3C2A21] rounded-3xl p-6 border border-amber-500/20 text-[#FBF9F5]`

---

## 🚀 Micro-Animations & Dynamic States

1. **Hover Lift Effect**: Elevasi bayangan halus pada kartu produk saat pointer mouse berada di atas elemen (`transform: translateY(-4px)`).
2. **Live Pulse Indicator**: Titik hijau/oranye berdenyut pada widget pelacak pesanan (`animate-pulse`) untuk menandakan koneksi live stream Firebase RTDB.
3. **Cart Toast Notification**: Notifikasi mengambang dengan transisi slide-up saat item menu berhasil ditambahkan ke keranjang belanja.
4. **Sequential Stepper Transition**: Animasi pergerakan bilah progress bar dan ikon aktif pada alur pelacakan 5-tahap.

---

*Untuk detail teknis antarmuka aplikasi, silakan akses berkas spesifikasi:*
* 👉 **[DESIGN_USER.md](file:///f:/UKK/nefakky3/DESIGN_USER.md)** — Spesifikasi Detail Antarmuka Pelanggan
* 👉 **[DESIGN_ADMIN.md](file:///f:/UKK/nefakky3/DESIGN_ADMIN.md)** — Spesifikasi Detail Antarmuka Enterprise Admin Command Center
