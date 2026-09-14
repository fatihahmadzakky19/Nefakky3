# Master Design System & UI/UX Guidelines — Nefakky Marketplace

**Produk**: Nefakky - Artisanal Food & Culinary Marketplace  
**Versi Design System**: 4.5.0 (Anti-AI-Slop 33 Bespoke Vector Icons, Realtime Calendar Clock, Kitchen POS Telemetry, & Master Design Tokens)  
**Status**: Production Standard (100% Passed Test Suite, Type-Safe, WCAG 2.1 AA Compliant)  
**Dokumen Terkait**: [DESIGN_USER.md](DESIGN_USER.md) (Customer UI) & [DESIGN_ADMIN.md](DESIGN_ADMIN.md) (Admin Command Center)  

---

## 1. Visi & Filosofi Desain: "Anti-AI-Slop Artisanal Editorial"

Desain antarmuka **Nefakky** mengusung konsep **"Anti-AI-Slop Artisanal Editorial"**. Filosofi ini dirancang secara khusus untuk menolak estetika generic buatan AI (seperti emoji kartun 3D murahan, tombol warna-warni berlebihan tanpa hierarki, dan elemen dekoratif tanpa fungsi) dan menggantikannya dengan desain editorial restoran artisanal premium yang berbobot, elegan, fungsional, dan berbasis standar industri kuliner modern.

### 5 Pilar Utama:
1. **Bespoke Authenticity (Anti-AI-Slop 33 Vector Icons)**:
   - Menolak penggunaan emoji 3D kartun (`📦`, `🍳`, `🛵`, `📍`, `🎉`, `🏷️`) maupun ikon generator template standar AI.
   - 100% elemen grafis menggunakan **33 icon kustom buatan manusia** yang di-render melalui teknik CSS mask vektor monokrom (`mask-image: url(...)` + `bg-current`) serta colored badge SVG murni.
2. **Nordic Citrus & Deep Navy Harmony**:
   - Palet warna kontras tinggi yang memadukan kedalaman *Deep Navy/Slate* (`#0B0F19`, `#0F172A`, `#1E293B`) dengan aksen hangat *Nordic Citrus* (`#FF5400`, `#FFB703`) serta terakota hangat (*Warm Terracotta* `#934B19`).
   - Latar belakang bersih bernapas (*Clean Canvas* `#F8FAFC` & `#FAF8F5`) untuk kenyamanan visual maksimal.
3. **Data Accuracy & Dynamic Time Telemetry**:
   - Sinkronisasi waktu kalender realtime (`Asia/Jakarta`) yang mengikat metrik analitik secara dinamis ke bulan kalender aktif, bukan data statis tiruan.
4. **Kitchen Operations & POS Rigor**:
   - Alur kerja dapur 5-tahap sekuensial dengan tombol aksi status yang jelas, slot bukti foto serah terima kurir via kamera langsung (*Live Camera Capture*), dan akuntabilitas pembayaran kasir COD.
5. **Frictionless Consumer Journey**:
   - Navigasi pemesanan mulus dari eksplorasi rasa, varian produk, geolokasi OpenStreetMap dengan formula ongkir Haversine, hingga verifikasi Midtrans Snap dan live order tracking.

---

## 2. Master Color Palette & Token Desain

```css
:root {
  /* =========================================================================
     1. IDENTITAS BRAND & WARNA DASAR (DEEP NAVY & ESPRESSO)
     ========================================================================= */
  --color-brand-black: #0B0F19;         /* Command Studio Dark Sidebar & Nav Backdrop */
  --color-brand-navy: #0F172A;          /* Deep Slate/Navy: Dark Headers, Footers */
  --color-brand-navy-card: #1E293B;     /* Elevated Dark Containers & Dropdowns */
  --color-brand-espresso: #25160E;      /* Deep Coffee: Tombol Primer, Modal Headers */
  --color-brand-terracotta: #934B19;    /* Warm Terracotta: Interactive Highlights */

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
     4. STATUS SEMANTIK RESTORAN (5-STAGE POS SYSTEM)
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

| Kategori | Font Family | Contoh Penggunaan | Karakteristik |
| :--- | :--- | :--- | :--- |
| **Headline & Brand** | *Outfit*, *Plus Jakarta Sans* | Judul Hero Banner, Wordmark Nefakky, Nama Hidangan | Tegas, kontemporer, ramah, dan premium |
| **UI, Label & Paragraf** | *Inter*, *Plus Jakarta Sans* | Label formulir, tombol aksi, deskripsi bahan rempah | Keterbacaan tinggi (*high legibility*), neutral geometric |
| **Data Finansial & POS** | *JetBrains Mono*, *Space Mono* | Format nominal (Rp), Nomor VA, Order ID, Jam Digital | Sejajar sempurna (*tabular numbers*), presisi akuntansi |

---

## 4. Standar Ikonografi: Arsitektur 33 Ikon Kustom Anti-AI-Slop

Seluruh sistem grafis Nefakky dikembangkan mandiri di `src/components/icons/CustomIcons.tsx` yang di-generate via script Python otomatis `scripts/gen_icons.py`. Ikon ini menggunakan data URI Base64 berresolusi tinggi yang di-masking ke CSS `mask-image`:

```tsx
function createMaskIcon(b64: string, label: string) {
  return ({ className = 'w-5 h-5', size, style, ...props }: CustomIconProps) => (
    <span
      role="img"
      aria-label={label}
      className={`inline-block shrink-0 bg-current transition-all select-none ${className}`}
      style={{
        maskImage: `url("${b64}")`,
        WebkitMaskImage: `url("${b64}")`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        ...style
      }}
      {...props}
    />
  );
}
```

### Matriks 33 Ikon Kustom Nefakky:

| Batch | Ikon Kustom | Drop-in Aliases | Konteks Penggunaan |
| :---: | :--- | :--- | :--- |
| **1** | `CustomSearch`, `CustomBasket`, `CustomHome`, `CustomPhone`, `CustomMapPin` | `Search`, `ShoppingBag`, `ShoppingCart`, `Home`, `Phone`, `MapPin` | Navigasi, keranjang belanja, kontak telepon, pin lokasi peta GPS. |
| **2** | `CustomLock`, `CustomGmail`, `CustomMail`, `CustomClock`, `CustomUser` | `Lock`, `Gmail`, `Google`, `Mail`, `Clock`, `User` | Autentikasi modal, durasi tunggu, profil pelanggan. |
| **3** | `CustomLogOut`, `CustomLeaf`, `CustomTicket`, `CustomFlame`, `CustomShieldCheck` | `LogOut`, `Leaf`, `Ticket`, `Tag`, `Flame`, `ShieldCheck` | Logout, vegetarian badge, voucher promo, level kepedasan pedas, jaminan higienis. |
| **4** | `CustomStar`, `CustomHourglass`, `CustomBarChart`, `CustomChat`, `CustomCalendar` | `Star`, `Hourglass`, `BarChart`, `BarChart2`, `BarChart3`, `MessageSquare`, `MessageCircle`, `Calendar`, `CalendarClock` | Rating emas, durasi masak, grafik analitik admin, CS live chat, sinkronisasi Google Calendar. |
| **5** | `CustomDownload`, `CustomPdf`, `CustomPrinter`, `CustomReceipt`, `CustomDocument` | `Download`, `FileDown`, `Pdf`, `FileSpreadsheet`, `Printer`, `Receipt`, `FileText`, `File` | Unduh rekapan, cetak struk kasir thermal, ekspor PDF, faktur transaksi. |
| **6** | `CustomPencil`, `CustomTrash`, `CustomEye`, `CustomCheckCircle`, `CustomCamera` | `Pencil`, `Edit`, `Edit3`, `Trash`, `Trash2`, `Eye`, `CheckCircle`, `CheckCircle2`, `Camera` | Edit menu, hapus data, preview bukti, verifikasi sukses, live camera POD. |
| **7** | `CustomCooking`, `CustomMegaphone`, `CustomGear` | `CookingPot`, `Utensils`, `UtensilsCrossed`, `ChefHat`, `Megaphone`, `Bell`, `Radio`, `Settings`, `Settings2`, `Sliders`, `SlidersHorizontal` | Wajan tumis masak, broadcast alert, roda gigi konfigurasi GPS. |

---

## 5. Grid, Layout & Responsivitas

* **Maximum Container Width**: `max-w-7xl` (`1280px`) terpusat secara elegan.
* **Breakpoints**:
  * `Mobile (< 640px)`: Single column feed, bottom navigation bar ramah jempol, sticky bottom checkout bar.
  * `Tablet (640px – 1024px)`: 2-Kolom grid produk, sticky floating cart bar.
  * `Desktop (> 1024px)`: 3–4 Kolom grid kartu menu, split screen checkout dengan OpenStreetMap live routing, sidebar admin terpadu (`AdminSidebar.tsx`).
* **Border Radius & Elevation**:
  * Badges & Chips: `rounded-full` (9999px).
  * Tombol Aksi: `rounded-xl` (12px) dengan `active:scale-[0.98]`.
  * Kartu Menu & Modal: `rounded-2xl` (16px) hingga `rounded-3xl` (24px) dengan bayangan halus `shadow-sm` / `shadow-md` / `shadow-2xl`.

---

## 6. Standar Aksesibilitas (WCAG 2.1 AA)

1. **Rasio Kontras**: Rasio kontras teks utama minimal $4.5:1$ terhadap background kanvas.
2. **Navigasi Keyboard**: State focus tajam menggunakan `focus:ring-2 focus:ring-[#FF5400]/50`.
3. **Screen Reader Semantic**: Semua ikon kustom memiliki atribut `role="img"` dan `aria-label` deskriptif.
4. **Optimasi Asset WebP**: Semua foto sajian di-render via Next.js `<Image />` dengan kompresi WebP otomatis untuk menjaga CLS $\le 0.05$ dan LCP $\le 1.0$s.
