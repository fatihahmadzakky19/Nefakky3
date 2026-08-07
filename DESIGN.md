# 🎨 Design System & UI/UX Guidelines — Nefakky

**Produk**: Nefakky - Artisanal Food & Culinary Marketplace  
**Versi Design**: 1.2.0  
**Tanggal**: 6 Agustus 2026  
**Penulis**: Tim Pengembang Nefakky (Fatih Ahmad Zakky)  

---

## 📖 1. Filosofi Desain (Design Philosophy)

Desain **Nefakky** mengusung konsep **"Artisanal Warmth meets Modern Premium Luxury"**. Filosofi ini menggabungkan kehangatan hidangan tradisional otentik dengan estetika digital kelas atas (*high-end e-commerce*).

### Prinsip Utama UI/UX:
1. **Visual Appetite Appeal**: Penggunaan foto makanan resolusi tinggi (*High-Res Culinary Imagery*), kartu menu yang bersih, serta tone warna hangat yang memikat selera makan.
2. **Glassmorphism & Depth**: Penggunaan lapisan transparansi bertekstur *blur backdrop* (`backdrop-blur-md`), efek elevasi bayangan halus, serta border berkilau (*subtle borders*) untuk menciptakan hirarki kedalaman visual.
3. **Frictionless Navigation**: Alur pengguna yang intuitif, tombol interaksi mikro (*micro-interactions*), serta animasi transisi yang halus (60fps) untuk pengalaman belanja tanpa cela.
4. **Mobile-First Responsiveness**: Tata letak yang beradaptasi secara mulus di seluruh skala layar, mulai dari perangkat seluler (Smartphone), Tablet, hingga Komputer (Desktop).

---

## 🎨 2. Sistem Warna (Color Palette & Tokens)

Nefakky menggunakan palet warna terkurasi dengan kombinasi warna tanah (*earthy tones*), aksen terakota hangat, dan warna netral elegan.

### 2.1 Warna Utama & Brand Palette

```css
/* Color Tokens - CSS Variables / Tailwind Palette */

:root {
  /* Brand Colors */
  --primary-terracotta: #8B4513;     /* Saddle Brown / Terracotta Utama */
  --primary-amber: #D97706;          /* Amber Warm Accent */
  --primary-espresso: #3C2A21;       /* Deep Espresso Background Accent */

  /* Neutral Surface Colors */
  --surface-cream: #FFFDF9;          /* Light Background Cream */
  --surface-card: #FFFFFF;           /* Pure White Card Background */
  --surface-dark-card: #1E1B18;      /* Dark Mode Card Elevation */

  /* Status & Feedback Colors */
  --status-success: #10B981;         /* Emerald 500 - Order Completed / Active */
  --status-warning: #F59E0B;         /* Amber 500 - Cooking / Pending */
  --status-info: #3B82F6;            /* Blue 500 - Shipping / Info */
  --status-danger: #EF4444;          /* Red 500 - Low Stock / Expired / Cancelled */

  /* Text Colors */
  --text-primary: #1F2937;           /* Slate 800 - High Contrast Body Text */
  --text-secondary: #4B5563;         /* Slate 600 - Subtitles & Captions */
  --text-muted: #9CA3AF;             /* Slate 400 - Disabled / Placeholder */
}
```

### 2.2 Hirarki Penggunaan Warna

* **Primary & Headers**: `#3C2A21` & `#8B4513` digunakan pada Navbar, Heading H1/H2, dan tombol aksi utama (*Primary CTA Button*).
* **Accent & Highlights**: `#D97706` (Amber) digunakan untuk badge harga diskon, skor bintang rating, serta penanda status aktif.
* **Backgrounds**: Soft Warm Cream (`#FFFDF9`) untuk latar belakang halaman agar nyaman di mata saat eksplorasi menu berdurasi panjang.

---

## ✍️ 3. Tipografi (Typography System)

Nefakky memadukan dua typeface dari **Google Fonts**: **Inter** (San-Serif modern untuk teks antarmuka) dan **Playfair Display** (Serif artisanal untuk judul dan elemen aksen).

### 3.1 Skala Tipografi (Type Scale)

| Elemen | Font Family | Ukuran Font | Font Weight | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title (H1)** | `Playfair Display`, serif | `36px - 48px` (2.25rem - 3rem) | Bold (700) | 1.2 |
| **Section Title (H2)** | `Playfair Display`, serif | `24px - 32px` (1.5rem - 2rem) | SemiBold (600) | 1.3 |
| **Card Title (H3)** | `Inter`, sans-serif | `18px - 20px` (1.125rem - 1.25rem) | Bold (700) | 1.4 |
| **Body Large** | `Inter`, sans-serif | `16px` (1rem) | Regular (400) / Medium (500) | 1.5 |
| **Body Regular** | `Inter`, sans-serif | `14px` (0.875rem) | Regular (400) | 1.5 |
| **Caption & Badges** | `Inter`, sans-serif | `12px` (0.75rem) | SemiBold (600) | 1.4 |

---

## 📐 4. Spatial Grid & Layout Breakpoints

Menggunakan sistem grid 12-kolom yang fleksibel berbasis Tailwind CSS.

### Breakpoint Responsif:
* **Mobile (`< 640px`)**: Single Column (1 kolom grid), tombol navigasi bawah (*Bottom Navigation Bar*), drawer menu samping.
* **Tablet (`640px - 1024px`)**: 2 Kolom Grid untuk katalog produk, modal responsif.
* **Desktop (`> 1024px`)**: 3 - 4 Kolom Grid untuk katalog menu, sidebar terpisah pada halaman `/admin` dan `/cart`.

---

## 🧩 5. Komponen UI & Pola Interaksi (UI Components & Design Patterns)

### 5.1 Navigation Bar (`Navbar.tsx`)
* **Efek Backdrop Glass**: Sticky header dengan `backdrop-blur-md bg-white/80 border-b border-amber-900/10`.
* **Dynamic Cart Badge**: Penanda jumlah item di keranjang dengan animasi *scale pop* saat produk ditambahkan.
* **User Profile Avatar**: Dropdown menu interaktif untuk beralih antara Halaman Profil, Pesanan, dan Admin Dashboard.

### 5.2 Card Produk Katalog (`/menu`)
* **Aspect Ratio Image**: Container gambar rasio 4:3 dengan efek `hover:scale-105 transition-transform duration-300`.
* **Badge Promosi & Stok**: Label berwarna kontras tinggi (*TERPOPULER*, *BEST SELLER*, *TERBATAS*).
* **Quick Add Button**: Tombol tambah keranjang instan dengan umpan balik visual (*active state scaling*).

### 5.3 Interactive Delivery Map Picker Modal (`AutoMapPickerModal.tsx`)
* **Header Modal Glassmorphism**: Dilengkapi tombol deteksi GPS (*Auto-Detect Location*) dan input pencarian alamat instan.
* **Distance Meter Badge**: Menampilkan kalkulasi jarak tempuh dari Dapur Pusat dalam format badge pill (`4.2 km`).

### 5.4 Order Status Timeline (`/profile`)
Visualisasi progress tracker step-by-step dengan ikon indikator warna:

```text
[ RECEIVED ] ───► [ COOKING ] ───► [ SHIPPING ] ───► [ COMPLETED ]
   (Grey)            (Amber)           (Blue)            (Emerald)
```

---

## ✨ 6. Animasi Mikro & Interaksi (Micro-Interactions)

1. **Hover Scale**: Elemen kartu dan tombol membesar secara presisi `scale(1.02)` saat kursor di atasnya.
2. **Smooth Fade In**: Modal dialog dan toast notification muncul dengan efek transisi `fade-in opacity-0 -> opacity-100`.
3. **Loading Skeleton**: Penggunaan skeleton pulsing background (`animate-pulse bg-gray-200`) saat memuat data gambar dan daftar pesanan.

---

## ♿ 7. Aksesibilitas & Inklusivitas (Accessibility / A11y)

* **Kontras Warna**: Rasio kontras teks terhadap latar belakang minimal **4.5:1** memenuhi standar WCAG AA.
* **Navigasi Keyboard**: Seluruh tombol, input, dan link memiliki visual *focus outline ring* (`focus:ring-2 focus:ring-amber-500`).
* **Attributes ARIA**: Penggunaan `aria-label`, `aria-expanded`, dan `role="dialog"` pada modal interaktif untuk pembaca layar (*Screen Reader*).
