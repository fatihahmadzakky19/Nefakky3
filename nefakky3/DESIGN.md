# Master Design System & UI/UX Guidelines — Nefakky

**Produk**: Nefakky - Artisanal Food & Culinary Marketplace  
**Versi Design**: 3.6.0 (Google Stitch AI UI System, Midtrans Sandbox Interactive Console, OpenStreetMap Live Route Canvas, 3-Way Photo Studio, Artisanal Luxury & Enterprise Command Center)  
**Tanggal Terakhir Diperbarui**: 25 Agustus 2026  
**Status**: Production Standard (100% Passed Test Suite & Type-Safe)  
**Penulis**: Tim Pengembang Nefakky (Fatih Ahmad Zakky) & Google Stitch AI Design System  

---

## 1. Arsitektur & Hierarki Dokumentasi Desain

Dokumentasi spesifikasi desain antarmuka **Nefakky** dibagi menjadi dua dokumen mendalam sesuai target peran pengguna:

1. 🛒 **[DESIGN_USER.md](DESIGN_USER.md)** — Spesifikasi UI/UX Lengkap untuk Aplikasi Pelanggan (*Customer Facing Application*).
   - *Beranda Hero Showcase, Katalog Menu 3-Kategori, Modal Varian 3-Jus Interaktif, Alur Checkout 4-Tahap Midtrans Sandbox, Stepper Lacak Pesanan 5-Tahap Real-Time, Peta Rute Kurir OpenStreetMap Interaktif, Riwayat Pesanan Realtime, 3-Way Photo Studio Picker, dan Modal Cetak Struk PDF Resmi.*

2. 🏢 **[DESIGN_ADMIN.md](DESIGN_ADMIN.md)** — Spesifikasi UI/UX Lengkap untuk Enterprise Command Center & Dapur (*Admin & Kitchen App*).
   - *Executive Dark Command Layout, 5 Metrik KPI Finansial, Realtime Calendar Clock WIB, Editor Grafik Omset Penjualan Interaktif SVG, Modal Input Omset Manual POS/Bazar, Kitchen Order Management 5-Tahap, Pengaturan Peta OpenStreetMap & Geolocation, Manajemen Inventaris Produk, Generator Voucher Promo, Moderasi Ulasan, dan Export Engine Excel (.xls)/PDF.*

---

## 2. Filosofi Desain: "Google Stitch Artisanal Luxury"

Desain antarmuka **Nefakky** mengusung konsep **"Google Stitch Artisanal Luxury"**. Filosofi ini memadukan kehangatan otentik hidangan tradisional Nusantara dengan standar desain digital kelas dunia (*high-end D2C culinary e-commerce & enterprise command dashboard*).

### 5 Pilar Utama Desain:
1. **Warmth & Authenticity**: Nuansa warna kopi (*Espresso*) dan tanah liat (*Terracotta*) yang mencerminkan kehangatan resep masakan tradisional rumahan berkualitas tinggi.
2. **Clarity & Effortless Navigation**: Alur pemesanan makanan yang ringkas dan bebas hambatan (pemilihan rasa 3-jus tanpa reload halaman, pemilihan label alamat cepat, dan checkout 4-tahap).
3. **Midtrans Sandbox Interactive Console**: Modal pembayaran digital interaktif yang menampilkan nomor VA / QRIS riil dari API Midtrans, tautan langsung ke Midtrans Simulator, dan radar verifikasi pelunasan otomatis secara *real-time*.
4. **OpenStreetMap Live Route Canvas**: Visualisasi peta geografis interaktif OpenStreetMap dengan pengalih mode ke animasi kurir meluncur (*Rute Dapur*).
5. **Enterprise Operational Precision**: Dashboard eksekutif yang menyajikan data finansial, inventaris, jam kalender realtime WIB, dan pesanan secara terstruktur dengan modul ekspor standar korporat.

---

## 3. Master Color Palette & Design Tokens

### 3.1 Primary & Brand Palette
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
  --status-waiting: #F59E0B;             /* Amber Gold - Menunggu Kurir */
  --status-delivery: #3B82F6;            /* Royal Blue - Dalam Pengantaran */
  --status-cancelled: #EF4444;           /* Crimson Red - Dibatalkan */
}
```

---

## 4. Tipografi & Hierarki Teks

* **Headline Font Family**: *Newsreader / Playfair Display / Serif Elegance*
  - Digunakan untuk judul utama (*Hero Headline*), nama hidangan, dan identitas kemewahan artisanal.
* **Body & UI Font Family**: *Plus Jakarta Sans / Inter / Sans-Serif Clean*
  - Digunakan untuk label tombol, deskripsi produk, paragraf, dan instruksi formulir.
* **Financial & Data Font Family**: *JetBrains Mono / Space Mono / Mono Clean*
  - Digunakan untuk penyajian harga mata uang (Rp), nomor Virtual Account, ID pesanan, dan koordinat GPS.

---

## 5. Komponen Kunci Antarmuka

### 5.1 Kartu Pelacakan Rute OpenStreetMap (`NotificationsPage`)
* **Wadah Peta**: Kotak rasio aspek 16:9 beresolusi tinggi dengan radius sudut membulat `rounded-2xl` dan border `border-stone-200`.
* **Badge Telemetri Bergerak**:
  - Saat dalam pengantaran: Badge putih blur `bg-white/95 backdrop-blur-md` dengan indikator berkedip: `Kurir OTW (~35 km/j)`.
  - Saat pesanan sampai: Badge hijau emerald `bg-emerald-50 text-emerald-800` dengan ikon centang terverifikasi.
* **Pengalih Tampilan**: Tombol pill ganda `[OpenStreetMap]` dan `[Rute Dapur]` dengan transisi *smooth active state*.

### 5.2 Jam Kalender Realtime (`RealtimeCalendarClock`)
* Menyajikan waktu berdetak (*live ticking clock*) dengan ikon kalender, penanda waktu WIB, dan badge status sinkronisasi server API.

### 5.3 Konsol Pembayaran Midtrans Snap
* Menampilkan panel rincian nomor pembayaran, instruksi transfer, batas waktu pelunasan, dan tombol 1-klik menuju simulator Midtrans resmi.
