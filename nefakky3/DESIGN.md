# Master Design System & UI/UX Guidelines — Nefakky Marketplace

**Produk**: Nefakky - Artisanal Food & Culinary Marketplace  
**Versi Design System**: 3.6.0 (Google Stitch Artisanal Luxury, Midtrans Sandbox Interactive Console, OpenStreetMap Dual-Engine Canvas, Realtime WebSockets Telemetry, & Enterprise Admin Command Center)  
**Status**: Production Standard (100% Passed Test Suite, Type-Safe, WCAG 2.1 AA Compliant)  
**Dokumen Terkait**: [DESIGN_USER.md](DESIGN_USER.md) (Customer UI) & [DESIGN_ADMIN.md](DESIGN_ADMIN.md) (Admin Command Center)  
**Penulis**: Tim Pengembang Nefakky & Google Stitch AI Design System  

---

## 1. Visi & Filosofi Desain: "Google Stitch Artisanal Luxury"

Desain antarmuka **Nefakky** mengusung konsep **"Google Stitch Artisanal Luxury"**. Filosofi ini memadukan kehangatan resep masakan tradisional rumahan berkualitas tinggi dengan ketepatan dan efisiensi platform e-commerce & operational command center berstandar enterprise.

### 5 Pilar Fundamental:
1. **Warmth & Authenticity (Kehangatan Tradisional)**: Nuansa warna kopi pekat (*Deep Espresso* `#25160E`), terakota hangat (*Warm Terracotta* `#934B19`), dan kanvas krem hangat (*Warm Cream* `#FAF8F5`) yang menciptakan rasa nyaman, menggugah selera, dan otentik.
2. **Effortless Frictionless Experience (Kemudahan Transaksi)**: Alur belanja ringkas 4-tahap tanpa reload halaman, pemilihan varian dinamis, kalkulator ongkir cerdas, dan deteksi otomatis status pelunasan.
3. **Midtrans Sandbox Interactive Console (Transparansi Pembayaran)**: Panel pembayaran digital interaktif yang menyajikan nomor Virtual Account / QRIS riil, panduan transfer, dan background polling otomatis setiap 2.5 detik.
4. **OpenStreetMap & Haversine Geolocation Engine (Presisi Pengantaran)**: Visualisasi rute pengiriman interaktif dari Dapur Pusat ke rumah pelanggan dengan estimasi waktu dan jarak akurat.
5. **Enterprise Operational Precision (Ketepatan Operasional Admin)**: Dashboard manajemen terpusat dengan jam digital WIB realtime, dispatcher 5-tahap, generator invoice PDF resmi, dan ekspor spreadsheet Excel.

---

## 2. Master Color Palette & Token Desain

```css
:root {
  /* =========================================================================
     1. PALET WARNA UTAMA (ESPRESSO & ARTISANAL BRAND)
     ========================================================================= */
  --color-brand-espresso: #25160E;       /* Base Identity: Navbar, Hero, Dark Buttons */
  --color-brand-espresso-dark: #1A1816;  /* Admin Executive Dark Header & Deep Surfaces */
  --color-brand-espresso-light: #3C2A21; /* Active State Container & Elevated Badges */
  
  /* =========================================================================
     2. PALET WARNA AKSEN & TERAKOTA
     ========================================================================= */
  --color-accent-terracotta: #934B19;    /* Primary CTA Buttons & Interactive Highlights */
  --color-accent-amber: #F59E0B;         /* Badges, Promo Highlights, Rating Stars */
  --color-accent-gold: #D97706;          /* Admin Executive Clock & Warning Accents */

  /* =========================================================================
     3. PALET PERMUKAAN & KANVAS (SURFACES & BACKGROUNDS)
     ========================================================================= */
  --color-surface-cream: #FAF8F5;        /* Background Kanvas Halaman Utama */
  --color-surface-white: #FFFFFF;        /* Kartu Produk, Modal Dialog, Input Form */
  --color-surface-muted: #F5F3EF;        /* Secondary Container & Table Header */
  --color-surface-border: #E5E0D8;       /* Subtle Clean Border */

  /* =========================================================================
     4. INDIKATOR STATUS SEMANTIK (SEMANTIC STATUSES)
     ========================================================================= */
  --color-status-success: #10B981;       /* Emerald: Lunas (PAID), Completed, Online */
  --color-status-warning: #F59E0B;       /* Amber: Sedang Dimasak (Cooking), Low Stock */
  --color-status-info: #3B82F6;          /* Blue: Kurir Meluncur (Delivering) */
  --color-status-danger: #EF4444;        /* Rose/Red: Dibatalkan (Cancelled), Refund */
}
```

---

## 3. Tipografi & Skala Hierarki Teks

| Kategori | Font Family | Contoh Penggunaan | Karakteristik |
| :--- | :--- | :--- | :--- |
| **Headline & Brand** | Serif (*Newsreader*, *Playfair Display*) | Logo Monogram, Judul Hero Banner, Nama Menu Spesial | Mewah, otentik, berwibawa |
| **UI & Paragraf** | Sans-Serif (*Inter*, *Plus Jakarta Sans*) | Label tombol, deskripsi produk, form input | Jelas, bersih, mudah dibaca |
| **Finansial & Data** | Monospace (*JetBrains Mono*, *Space Mono*) | Format harga (Rp), Nomor VA, Order ID, Jam WIB | Rapi, presisi, angka sejajar |

---

## 4. Standar Grid, Container & Breakpoints Responsif

* **Lebar Maksimal Container**: `max-w-7xl` (`1280px`) terpusat (`mx-auto`).
* **Padding Horizontal Halaman**:
  * Smartphone (<640px): `px-4`
  * Tablet (640px - 1024px): `px-6`
  * Desktop (>1024px): `px-8` hingga `px-16`
* **Breakpoint Tailwind CSS**:
  * `sm`: `640px` (Ponsel Landscape / Tablet Mini)
  * `md`: `768px` (Tablet Portait)
  * `lg`: `1024px` (Laptop / Desktop Standar)
  * `xl`: `1280px` (Layar Monitor Lebar)

---

## 5. Pedoman Ikonografi & Visual Semantik

Semua ikon aplikasi menggunakan pustaka **Lucide React** dengan aturan ketat:
* **Ukuran Standar**:
  * Ikon Micro (Badge / Rating): `w-3.5 h-3.5` atau `w-4 h-4`
  * Ikon Tombol & Menu: `w-4 h-4` atau `w-5 h-5`
  * Ikon Hero / Empty State: `w-8 h-8` atau `w-12 h-12`
* **Ketentuan Penggunaan Ikon**:
  * `ShoppingBag`: Khusus untuk Keranjang Belanja dan Katalog Menu.
  * `ChefHat` & `Flame`: Khusus untuk Dapur, Masakan Segar, dan Resep Warisan.
  * `Truck` & `Navigation`: Khusus untuk Pengiriman, Rute Kurir, dan Peta GPS.
  * `ShieldCheck`: Khusus untuk Panel Administrator dan Jaminan Keamanan Transaksi.
  * `Receipt` & `FileText`: Khusus untuk Nota Pembayaran, Struk Digital, dan Invoice PDF.
  * `Star`: Khusus untuk Rating Ulasan Rasa Bintang 1-5.
  * `LogOut`: Khusus untuk Aksi Keluar Akun Pengguna.

---

## 6. Aksesibilitas (WCAG 2.1 AA) & Performa

1. **Rasio Kontras Warna**: Memastikan rasio kontras teks minimum `4.5:1` terhadap warna latar belakang.
2. **Keyboard Navigation & Focus Ring**: Seluruh elemen interaktif memiliki `focus:ring-2 focus:ring-[#25160E]` yang jelas saat ditekan tombol Tab.
3. **Screen Reader Support**: Seluruh tombol icon memiliki atribut `aria-label` deskriptif (contoh: `aria-label="Tambah hidangan ke keranjang"`).
4. **Optimasi Aset Gambar**: Seluruh gambar menggunakan komponen `<Image />` Next.js dengan properti `sizes`, `priority` untuk LCP hero banner, dan format kompresi modern WebP/AVIF.
