# Master Design System & UI/UX Guidelines — Nefakky Marketplace

**Produk**: Nefakky - Artisanal Food & Culinary Marketplace  
**Versi Design System**: 4.0.0 (Anti-AI-Slop Editorial Design, Realtime Calendar Clock, Kitchen POS Telemetry, & Master Design Tokens)  
**Status**: Production Standard (100% Passed Test Suite, Type-Safe, WCAG 2.1 AA Compliant)  
**Dokumen Terkait**: [DESIGN_USER.md](DESIGN_USER.md) (Customer UI) & [DESIGN_ADMIN.md](DESIGN_ADMIN.md) (Admin Command Center)  
**Penulis**: Tim Pengembang Nefakky & Google Stitch AI Design System  

---

## 1. Visi & Filosofi Desain: "Anti-AI-Slop Artisanal Editorial"

Desain antarmuka **Nefakky** mengusung konsep **"Anti-AI-Slop Artisanal Editorial"**. Filosofi ini dirancang secara khusus untuk menolak estetika generic buatan AI (seperti emoji kartun 3D murahan, tombol warna-warni berlebihan, dan elemen dekoratif tanpa fungsi) dan menggantikannya dengan desain editorial restoran artisanal premium yang berbobot, elegan, fungsional, dan berbasis standar industri kuliner modern.

### 5 Pilar Utama:
1. **Bespoke Authenticity (Anti-AI-Slop)**:
   - Menolak penggunaan emoji 3D kartun (`📦`, `🍳`, `🛵`, `📍`, `🎉`, `🏷️`) sebagai ikon antarmuka.
   - Seluruh elemen grafis wajib menggunakan ikon vektor monokrom presisi dari **Lucide Icons** dipadukan dengan tipografi editorial berkarakter.
2. **Nordic Citrus & Deep Navy Harmony**:
   - Palet warna kontras tinggi yang memadukan kedalaman *Deep Navy/Slate* (`#0F172A`, `#1E293B`) dengan energi hangat *Nordic Citrus* (`#FF5400`, `#FFB703`) serta terakota hangat (*Warm Terracotta* `#934B19`).
   - Latar belakang bersih bernapas (*Clean Canvas* `#F8FAFC` & `#FAF8F5`) untuk kenyamanan visual maksimal.
3. **Data Accuracy & Dynamic Time Telemetry**:
   - Sinkronisasi waktu kalender realtime (`Asia/Jakarta`) yang mengikat metrik analitik secara dinamis ke bulan kalender aktif (September 2026), bukan data statis tiruan.
4. **Kitchen Operations & POS Rigor**:
   - Alur kerja dapur 5-tahap sekuensial dengan tombol aksi status yang jelas, slot bukti foto serah terima kurir, dan akuntabilitas pembayaran kasir COD.
5. **Frictionless Consumer Journey**:
   - Navigasi pemesanan mulus dari eksplorasi rasa, varian produk, geolokasi OpenStreetMap dengan formula ongkir Haversine, hingga verifikasi Midtrans Snap dan live order tracking.

---

## 2. Master Color Palette & Token Desain

```css
:root {
  /* =========================================================================
     1. IDENTITAS BRAND & WARNA DASAR (DEEP NAVY & ESPRESSO)
     ========================================================================= */
  --color-brand-navy: #0F172A;          /* Deep Slate/Navy: Dark Headers, Footers, Primary Dark Surfaces */
  --color-brand-navy-card: #1E293B;     /* Elevated Dark Containers & Dropdowns */
  --color-brand-espresso: #25160E;      /* Deep Coffee: Tombol Primer, Modal Headers */
  --color-brand-terracotta: #934B19;    /* Warm Terracotta: Interactive Highlights, Kitchen Actions */

  /* =========================================================================
     2. AKSEN ENERGIK (NORDIC CITRUS & AMBER WARMTH)
     ========================================================================= */
  --color-accent-orange: #FF5400;       /* Nordic Citrus Orange: Primary CTA, Cart Accents */
  --color-accent-gold: #FFB703;         /* Warm Gold/Amber: Promo Badges, Rating Stars */
  --color-accent-amber: #D97706;        /* High-Demand Warning & Warning Accents */

  /* =========================================================================
     3. KANVAS & PERMUKAAN (LIGHT SURFACES)
     ========================================================================= */
  --color-surface-bg: #F8FAFC;          /* Canvas Background Bersih Slate-50 */
  --color-surface-cream: #FAF8F5;       /* Warm Editorial Canvas */
  --color-surface-card: #FFFFFF;        /* Kartu Produk, Dialog Modal, Form Container */
  --color-surface-muted: #F1F5F9;       /* Secondary Container & Table Header Row */
  --color-border-subtle: #E2E8F0;       /* Garis Tepi Bersih (Clean 1px Borders) */

  /* =========================================================================
     4. STATUS SEMANTIK RESTORAN (SEMANTIC SYSTEM)
     ========================================================================= */
  --color-status-received: #F59E0B;     /* Amber: Pesanan Masuk (RECEIVED) */
  --color-status-preparing: #EA580C;    /* Orange: Disiapkan / Dimasak (PREPARING) */
  --color-status-ready: #7C3AED;        /* Purple: Pesanan Siap (READY) */
  --color-status-delivering: #2563EB;   /* Blue: Sedang Diantar (DELIVERING) */
  --color-status-delivered: #0891B2;    /* Cyan: Tiba di Lokasi (DELIVERED) */
  --color-status-completed: #059669;    /* Emerald: Selesai & Lunas (COMPLETED) */
  --color-status-cancelled: #E11D48;    /* Rose: Dibatalkan (CANCELLED) */
}
```

---

## 3. Tipografi & Skala Hierarki Teks

Aplikasi menggunakan kombinasi jenis huruf modern terkurasi dari Google Fonts untuk memastikan hierarki baca yang tajam:

| Kategori | Font Family | Contoh Penggunaan | Karakteristik |
| :--- | :--- | :--- | :--- |
| **Headline & Brand** | *Outfit*, *Plus Jakarta Sans* | Judul Hero Banner, Wordmark Nefakky, Nama Hidangan | Tegas, kontemporer, ramah, dan premium |
| **UI, Label & Paragraf** | *Inter*, *Plus Jakarta Sans* | Label formulir, tombol aksi, deskripsi bahan rempah | Keterbacaan tinggi (*high legibility*), neutral geometric |
| **Data Finansial & POS** | *JetBrains Mono*, *Space Mono* | Format nominal (Rp), Nomor VA, Order ID, Jam Digital | Sejajar sempurna (*tabular numbers*), presisi akuntansi |

---

## 4. Standar Ikonografi: Anti-AI-Slop & Vector Precision

### Aturan Ketat Ikonografi:
- **Dilarang keras**: Menempatkan emoji kartun unicode (`📦`, `🍳`, `🛵`, `📍`, `✅`, `❌`, `🔥`, `📥`, `🎉`, `🏷️`) di dalam tombol aksi, menu dropdown `<option>`, tag status, atau header kartu.
- **Wajib digunakan**: Ikon SVG vektor murni dari pustaka **Lucide React** dengan stroke seragam (stroke-width 1.75–2.0) dipadukan dengan teks yang jelas.

| Konteks Aksi / Entitas | Ikon Vektor Resmi | Alasan Desain |
| :--- | :--- | :--- |
| **Status: Siapkan Pesanan** | `<ChefHat />` atau `<CookingPot />` | Menggantikan emoji wajan goreng; terlihat profesional dan mencerminkan higienitas dapur. |
| **Status: Pesanan Siap** | `<PackageCheck />` | Menggantikan emoji kardus kartun 3D `📦`; merepresentasikan paket pesanan yang terverifikasi rapi. |
| **Status: Berangkat Antar** | `<Truck />` atau `<Bike />` | Menggantikan emoji motor skuter; memberikan kesan logistik profesional. |
| **Status: Tiba di Lokasi** | `<MapPin />` | Menggantikan emoji pin merah bulat; simbol penanda lokasi standar industri GPS. |
| **Status: Selesai & Lunas** | `<CheckCircle2 />` | Menggantikan emoji centang hijau; ikon formal penanda transaksi tervalidasi. |
| **Stok Varian Rasa Jus** | `<GlassWater />` + Color Dots | Menggantikan emoji buah-buahan; menggunakan dot warna minimalis (Kuning Mangga, Hijau Sirsak, Merah Jambu). |
| **Pembayaran Tunai COD** | `<Banknote />` | Menggantikan emoji gepokan uang; formal dan rapi. |
| **Kupon Promo & Diskon** | `<TicketPercent />` atau `<BadgePercent />` | Tampilan voucher bersih tanpa dekorasi berlebihan. |
| **Cetak Nota & Laporan** | `<Printer />` | Menggantikan emoji printer kartun; standar printer thermal POS. |

---

## 5. Grid, Layout & Responsivitas

* **Maximum Container Width**: `max-w-7xl` (`1280px`) terpusat secara elegan.
* **Layout Breakpoints**:
  * `Mobile (< 640px)`: Single column feed, bottom navigation bar 5-kolom ramah jempol, sticky bottom checkout bar.
  * `Tablet (640px – 1024px)`: 2-Kolom grid produk, sticky sidebar keranjang ringkas.
  * `Desktop (> 1024px)`: 3–4 Kolom grid kartu menu, split screen checkout dengan Leaflet Map live preview, multi-tab admin command center.
* **Border Radius System**:
  * Badges & Chips: `rounded-full` atau `rounded-lg` (8px).
  * Tombol Aksi: `rounded-xl` (12px) dengan efek `active:scale-[0.98]`.
  * Kartu Menu & Container: `rounded-2xl` (16px) hingga `rounded-3xl` (24px) dengan bayangan halus `shadow-sm` / `shadow-md`.

---

## 6. Standar Aksesibilitas (WCAG 2.1 AA) & Kecepatan

1. **Rasio Kontras Minimum**: Seluruh teks judul dan tombol wajib memiliki rasio kontras $\ge 4.5:1$ terhadap background-nya.
2. **Navigasi Keyboard Penuh**: Fokus indikator aktif dengan ring kontras tinggi (`focus:ring-2 focus:ring-[#934B19]/40`).
3. **Screen Reader Semantic**: Seluruh tombol berbasis ikon wajib dilengkapi atribut `aria-label` atau teks pendamping.
4. **Optimasi Asset WebP**: Seluruh foto produk disajikan melalui Next.js `<Image />` dengan kompresi WebP otomatis dan dimensi eksplisit untuk mencegah layout shift (CLS $\le 0.05$).
