# 🎨 Design System & UI/UX Guidelines — Nefakky

**Produk**: Nefakky - Artisanal Food & Culinary Marketplace  
**Versi Design**: 2.5.0 (Google Stitch AI UI System & Enterprise Admin Command Center)  
**Tanggal Terakhir Diperbarui**: 11 Agustus 2026  
**Penulis**: Tim Pengembang Nefakky (Fatih Ahmad Zakky) & Google Stitch AI Design System  

---

## 📖 1. Filosofi Desain (Design Philosophy)

Desain **Nefakky** mengusung konsep **"Google Stitch Artisanal Luxury"**. Filosofi ini menggabungkan kehangatan hidangan tradisional otentik khas Indonesia dengan estetika digital berstandar internasional (*high-end D2C e-commerce & enterprise command center*).

### Prinsip Utama UI/UX:
1. **Google Stitch Palette Harmony**: Penggunaan palet warna resmi Google Stitch AI (`#25160E` Espresso Base, `#3C2A21` Deep Container, `#934B19` Terracotta Secondary, `#FBF9F5` Warm Cream Canvas) yang bebas dari kesan buatan AI.
2. **Visual Appetite Appeal**: Penggunaan foto makanan resolusi tinggi (*High-Res Culinary Imagery*), porsi yang jelas, dan typography Playfair Display yang elegan.
3. **Glassmorphism & Depth**: Penggunaan lapisan transparansi bertekstur *blur backdrop* (`backdrop-blur-md`), efek elevasi bayangan halus, serta border berkilau (*subtle borders*) untuk menciptakan hirarki kedalaman visual.
4. **Alur Checkout 4-Tahap Berurutan**: Visualisasi stepper transaksi yang intuitif (`1. Keranjang` $\rightarrow$ `2. Checkout` $\rightarrow$ `3. Payment Midtrans` $\rightarrow$ `4. Selesai`).
5. **Multi-Order & Printable Receipt UX**: Tab selector pills untuk navigasi antar-pesanan aktif serta modal struk pembayaran resmi PDF yang bersih dan profesional.

---

## 🎨 2. Sistem Warna Google Stitch (Color Tokens & Palette)

Nefakky mengadopsi palet warna resmi dari **Google Stitch AI UI Design System** (`projects/922804797638877460`), memadukan warna tanah (*earthy tones*), aksen terakota hangat, serta netralitas cream berkelas.

### 2.1 Color Tokens - CSS Variables & Tailwind Tokens

```css
:root {
  /* Google Stitch Primary & Brand Palette */
  --primary-espresso-dark: #25160E;   /* Deep Espresso Base */
  --primary-espresso-container: #3C2A21; /* Dark Container & Header Active */
  --primary-on-container: #AA9084;     /* Muted Cream Text */

  /* Google Stitch Accent & Highlight Palette */
  --secondary-terracotta: #934B19;    /* Terracotta Secondary */
  --secondary-container: #FFA26A;     /* Soft Amber Container Highlight */
  --terracotta-on-container: #783603; /* Deep Terracotta Text */
  --accent-amber-gold: #D97706;       /* Warm Gold Highlight & Stars */

  /* Surface & Neutral Canvas Colors */
  --surface-warm-cream: #FBF9F5;      /* Main Page Canvas Background */
  --surface-container-lowest: #FFFFFF;/* Pure White Card Background */
  --surface-container-low: #F5F3EF;   /* Soft Contrast Card Fill */
  --surface-container-high: #EAE8E4;  /* Muted Section Fill */

  /* Status & Feedback Colors */
  --status-success-emerald: #10B981;  /* Emerald 500 - Completed / Paid / Net Margin */
  --status-warning-amber: #F59E0B;    /* Amber 500 - In-Progress / Cooking */
  --status-info-blue: #3B82F6;       /* Blue 500 - Delivering / Shipping */
  --status-error-rose: #EF4444;       /* Rose 500 - Unpaid / Cancelled */
}
```

---

## 📐 3. Typography & Spacing System

* **Font Utama Body & Data**: `Inter` / `sans-serif` (Clean, highly legible for numbers, distances, prices, and forms).
* **Font Header & Display Title**: `Playfair Display` / `Georgia` / `serif` (Artisanal luxury touch for titles, hero headers, & receipts).
* **Font Monospace**: `JetBrains Mono` / `ui-monospace` (Used for Order IDs `#ORD-4837`, tracking codes, & invoice numbers).

---

## 🍱 4. Komponen Visual Utama

### 4.1 Header Navigation Bar (`Navbar.tsx`)
* Brand Logo `N` dalam kotak Espresso `#25160E` dengan font Playfair Display.
* Minimalis 4 Tautan Navigasi: `Beranda`, `Katalog Menu`, `Ulasan Rasa`, `Pemesanan & Keranjang`.
* Pill Tab Aktif `Status Pesanan` dan Avatar Pengguna yang mengarah langsung ke Halaman Profil.

### 4.2 Pemilih Kategori Makanan (3 Kategori Clean)
* `Makanan Berat`: Hidangan utama khas tradisional (Ayam Bakar Keraton, Gudeg Wijaya, Garang Asam, Krecek).
* `Minuman`: Minuman herbal & jus segar pencuci mulut.
* `Menu Hemat`: Paket porsi kombo ekonomis.

### 4.3 Alur Checkout 4-Tahap (`/cart`)
* Stepper visual horizontal dengan 4 nomor lingkaran indikator (`1. Keranjang` $\rightarrow$ `2. Checkout` $\rightarrow$ `3. Payment` $\rightarrow$ `4. Selesai`).
* Card Transparansi Formula Ongkir berdasarkan Jarak GPS (15% subtotal untuk $\le$ 3km + Rp 1.500 per 2km).
* Integrasi eksklusif **Midtrans Snap Engine** tanpa opsi manual.

### 4.4 Multi-Order Switcher & Modal Struk PDF (`/notifications`)
* Tab Selector Pills di bagian atas halaman untuk memilih pesanan aktif yang ingin dilacak.
* Seksi Riwayat Pemesanan Permanen di bagian bawah halaman.
* Modal Struk Pembayaran Resmi dengan tampilan cetak PDF profesional (`window.print()`).

### 4.5 Dashboard Admin & Custom Sales Chart (`/admin`)
* Grafik Omset Real-Time yang dimulai dari Juni 2026 (Event Bazar >10 Juta).
* Modal Penyuntingan Grafik (`Edit Data Grafik`) untuk mengubah nominal omset kotor, laba bersih, dan event bazar per bulan.
* Modal Input Omset Manual dengan multi-select pill checkboxes untuk menu terlaris dan kurang laris.
