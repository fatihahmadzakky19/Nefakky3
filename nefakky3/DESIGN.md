# 🎨 Master Design System & UI/UX Guidelines — Nefakky

**Produk**: Nefakky - Artisanal Food & Culinary Marketplace  
**Versi Design**: 3.5.0 (Google Stitch AI UI System, Midtrans Sandbox Interactive Console, 2-Column Live Fleet Tracking, 3-Way Photo Studio, Artisanal Luxury & Enterprise Command Center)  
**Tanggal Terakhir Diperbarui**: 22 Agustus 2026  
**Status**: Production Standard (100% Passed Test Suite & Type-Safe)  
**Penulis**: Tim Pengembang Nefakky (Fatih Ahmad Zakky) & Google Stitch AI Design System  

---

## 📚 1. Arsitektur Dokumentasi Desain (Separated Design Specs)

Dokumentasi spesifikasi desain antarmuka **Nefakky** dibagi menjadi dokumen mendalam sesuai peran dan arsitektur pengguna:

1. 🛒 **[DESIGN_USER.md](file:///f:/UKK/nefakky3/DESIGN_USER.md)** — Spesifikasi UI/UX Lengkap untuk Aplikasi Pelanggan (*Customer Facing Application*).
   - *Beranda Hero Showcase, Katalog Menu 3-Kategori, Modal Varian 3-Jus Interaktif, Alur Checkout 4-Tahap Midtrans Sandbox, Stepper Lacak Pesanan 5-Tahap Real-Time (Firebase RTDB), Peta Rute Kurir SVG Animasi Dinamis, Riwayat Pesanan Realtime (Newest First), 3-Way Photo Studio Picker, Floating Order Tracker Widget, Halaman Profil & CS Chat, Ulasan Komunitas, dan Modal Cetak Struk PDF Resmi.*

2. 🏢 **[DESIGN_ADMIN.md](file:///f:/UKK/nefakky3/DESIGN_ADMIN.md)** — Spesifikasi UI/UX Lengkap untuk Enterprise Command Center & Dapur (*Admin & Kitchen App*).
   - *Executive Dark Command Layout, 5 Metrik KPI Finansial, Editor Grafik Omset Penjualan Interaktif SVG, Modal Input Omset Manual POS/Bazar Multi-Item, Kitchen Order Management 5-Tahap 1-Klik, Notifikasi Live Bukti Kurir WhatsApp (Foto Makanan & Bukti Kas COD), Manajemen Inventaris Produk, Generator Voucher Promo & Auto-Expiry, Moderasi Ulasan, dan Export Engine Excel (.xls)/PDF/CSV.*

---

## 📖 2. Filosofi Desain: "Google Stitch Artisanal Luxury"

Desain **Nefakky** mengusung konsep **"Google Stitch Artisanal Luxury"**. Filosofi ini memadukan kehangatan otentik hidangan tradisional Nusantara dengan standar desain digital modern (*high-end D2C culinary e-commerce & enterprise command dashboard*).

### 5 Pilar Utama Desain:
1. **Warmth & Authenticity**: Nuansa warna kopi (*Espresso*) dan tanah liat (*Terracotta*) yang mencerminkan kehangatan resep masakan tradisional rumahan berkualitas tinggi.
2. **Clarity & Effortless Navigation**: Alur pemesanan makanan yang ringkas dan bebas hambatan (pemilihan rasa 3-jus tanpa reload halaman, pemilihan label alamat cepat, dan checkout 4-tahap).
3. **Midtrans Sandbox Interactive Console**: Modal pembayaran digital interaktif yang menampilkan nomor VA / QRIS riil dari API Midtrans, tautan 1-klik ke Midtrans Simulator resmi, dan radar verifikasi pelunasan otomatis secara *real-time*.
4. **Real-time Live Courier Fleet Tracking**: Visualisasi status dapur dan pergerakan armada kurir secara instan tanpa perlu memuat ulang peramban (*Zero Page Reload via Firebase Realtime Database & Firestore*).
5. **Enterprise Operational Precision**: Dashboard eksekutif yang menyajikan data finansial, inventaris, dan pesanan secara terstruktur dengan modul ekspor standar korporat.

---

## 🎨 3. Master Color Palette & Design Tokens

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
  --status-delivering: #3B82F6;          /* Royal Blue - Dalam Pengiriman */
  --status-warning: #F59E0B;             /* Amber Gold - Menunggu Pembayaran / Diterima */
  --status-danger: #EF4444;              /* Rose Red - Dibatalkan / Gagal */
}
```

### 3.2 Tabel Kode Warna & Kegunaan
| Nama Token | Hex Code | Deskripsi & Penempatan |
| :--- | :--- | :--- |
| `Espresso Dark` | `#25160E` | Navbar utama, judul hero, tombol primer CTA, kop struk |
| `Terracotta Primary` | `#934B19` | Tombol beli sekarang, border kartu aktif, aksen link |
| `Soft Amber` | `#FFA26A` | Badge diskon, latar belakang ikon, aksen teks sekunder |
| `Midtrans Navy` | `#102A43` | Header modal pembayaran Midtrans Sandbox |
| `Emerald Success` | `#10B981` | Badge status Lunas/PAID, tombol konfirmasi sukses |
| `Warm Cream Canvas`| `#FCF8FA` | Latar belakang kanvas aplikasi pelanggan |
| `Dark Desk Surface`| `#1E120B` | Latar belakang Enterprise Admin Command Desk |

---

## 📐 4. Tipografi & Sistem Hirarki

Aplikasi Nefakky menggunakan kombinasi 3 keluarga font yang saling melengkapi:

| Font Family | Kategori | Penggunaan Utama | Contoh Komponen |
| :--- | :--- | :--- | :--- |
| **`Playfair Display`** | Serif | Display Title, Judul Hero Banner, Nama Restoran, Kop Struk PDF | `Hero Section`, `Navbar Logo`, `Receipt Header` |
| **`Inter`** | Sans-Serif | Body text, Label Form, Deskripsi Menu, Harga Nominal Rupiah | `Product Cards`, `Checkout Form`, `Reviews` |
| **`JetBrains Mono`** | Monospace | Order ID, Kode VA Midtrans, Kode Voucher, Koordinat GPS | `#NFK-892102`, `01757917992610117704681`, `WEEKENDSERU` |

### Skala Tipografi
- **Hero Title**: `font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#25160E]`
- **Section Heading**: `font-serif text-2xl sm:text-3xl font-bold text-[#25160E]`
- **Card Title**: `font-serif text-lg font-bold text-[#25160E]`
- **Body Regular**: `font-sans text-xs sm:text-sm text-stone-600 leading-relaxed`
- **Monospace Code / VA**: `font-mono text-base sm:text-lg font-bold text-[#102A43] tracking-widest`

---

## 🧱 5. Spesifikasi Komponen & Modul UI Terperinci

### 5.1 Konsol Pembayaran Interaktif Midtrans Sandbox (`/cart`)
Modal pembayaran digital yang terhubung langsung dengan API Midtrans Sandbox resmi:
1. **Header Konsol**:
   - Background Navy `#102A43`, ikon gembok perisai hijau emerald (`ShieldCheck`).
   - Lencana status: `SANDBOX ACTIVE` (Hijau Emerald bercahaya).
2. **Kartu Tagihan & Order ID**:
   - Total tagihan dengan nominal rupiah berformat `font-serif text-xl font-bold text-[#934B19]`.
   - Lencana nomor order monospaced `#{orderId}`.
3. **Wadah Virtual Account & QRIS**:
   - Latar belakang gradien lembut `from-blue-50 to-indigo-50/70` dengan border biru muda.
   - Nomor VA monospaced besar (misal: `01757917992610117704681`).
   - Tombol **"📋 Salin Kode"** dengan efek transisi feedback `Kode Disalin!`.
4. **Tombol Eksternal Simulator**:
   - Tombol penuh warna biru royal `#004B99` hover `#003B7A`: **"🌐 Buka Midtrans Payment Simulator ↗"** (`target="_blank"`).
5. **Panduan 3 Langkah Cepat**:
   - Box instruksi ringkas: 1. Buka Simulator $\rightarrow$ 2. Paste nomor VA $\rightarrow$ 3. Klik Inquire & Pay.
6. **Live Radar Status**:
   - Indikator berdenyut animasi ping (`animate-ping`) warna amber dengan teks *"Menunggu Pembayaran di Simulator..."*.
   - Tombol manual *"Cek Status Sekarang"*.
7. **Pop-up Notifikasi Sukses**:
   - Dialog perayaan hijau emerald dengan ikon melompat (`animate-bounce`), rincian pelunasan, dan tombol *"Lanjut ke Ringkasan Pesanan"*.

### 5.2 Layout 2-Kolom Pelacakan Pesanan & Armada Kurir (`/notifications`)
Struktur layout 2-kolom responsif:
1. **Top Container**:
   - Banner estimasi waktu tiba (`• Estimated Arrival 18:45 WIB`).
   - Pill switcher pesanan aktif untuk navigasi instan antar-pesanan.
2. **Kolom Kiri (`lg:col-span-7`)**:
   - **Stepper Vertikal 5-Tahap**:
     - Tahap 1: *Pesanan Diterima* (Timestamp: `12:30 WIB`)
     - Tahap 2: *Sedang Dimasak* (Timestamp: `12:35 WIB`)
     - Tahap 3: *Menunggu Kurir* (Timestamp: `12:45 WIB`)
     - Tahap 4: *Dalam Perjalanan* (Timestamp: `12:50 WIB`)
     - Tahap 5: *Pesanan Selesai* (Timestamp: `13:05 WIB`)
   - **Kartu Konfirmasi Penerimaan Pelanggan**:
     - Box hijau amber dengan tombol primer **"✅ Konfirmasi Pesanan Telah Sampai (Tiba Tepat Waktu)"**.
3. **Kolom Kanan (`lg:col-span-5`)**:
   - **Peta Animasi SVG Kurir**:
     - Visualisasi jalur jalan berkelok dari Dapur Pusat (*Puri Bojong Lestari 1*) ke Alamat Penerima.
     - Ikon kurir motor bergerak dinamis di sepanjang jalur kurva SVG.
     - Telemetri kecepatan: `Kurir OTW ~35 km/j`.
   - **Profil Kurir Terstandarisasi**:
     - Lencana nama: **"Karyawan Nefakky"** (*Pengantaran Langsung dari Dapur Resto*).
   - **Rincian Biaya Transparan**:
     - Subtotal hidangan.
     - Ongkos Kirim berbasis jarak (misal `4.2 Km`).
     - Diskon voucher promo.
     - Total pembayaran lunas / tagihan COD.

### 5.3 Grid Riwayat Pesanan Realtime (`Riwayat Pesanan Terakhir`)
1. **Pengurutan Newest-First**:
   - Data riwayat pesanan disortir dari yang paling baru ke yang paling lama berdasarkan timestamp `createdAt`.
2. **Interaktivitas Kartu**:
   - Setiap kartu riwayat dapat diklik untuk memuat dan memantau status pesanan tersebut di tracker bagian atas secara mulus.
   - Kartu yang sedang aktif ditandai dengan bingkai terracotta `#934B19` dan ring highlight (`ring-2 ring-[#934B19]/20`).
3. **Tombol Struk Digital**:
   - Tombol cetak struk PDF resmi dengan kop Nefakky siap cetak (`window.print()`).

### 5.4 3-Way Photo Studio Picker (`/profile`)
1. **Unggah dari Galeri**:
   - File picker standar browser untuk memilih berkas gambar (.jpg, .png, .webp).
2. **Ambil Foto Sendiri (Live Webcam Capture)**:
   - Akses live video stream kamera pengguna via WebRTC `navigator.mediaDevices.getUserMedia`.
   - Preview video realtime dalam bingkai melingkar dengan tombol rana jepret (*Shutter Button*).
   - Konversi snapshot instan ke format Base64 Data URL untuk disimpan ke profil.
3. **Avatar Akun Google**:
   - Sinkronisasi 1-klik dengan foto profil akun Google SSO pengguna.

---

## 📱 6. Sistem Grid & Responsivitas Antarmuka

| Breakpoint | Target Layar | Perilaku Grid |
| :--- | :--- | :--- |
| **Mobile (`< 640px`)** | Smartphone | 1 Kolom penuh, floating bottom action bar, modal drawer |
| **Tablet (`640px - 1024px`)** | iPad / Tablet | 2 Kolom katalog menu, navigasi tab horizontal |
| **Desktop (`1024px - 1280px`)** | Laptop / PC | Layout 2-kolom pelacakan (`7:5`), grid 3-kolom riwayat |
| **Wide Screen (`> 1280px`)** | Desktop Monitor | Max container width `1280px` (Customer) & `1440px` (Admin) |

---

## ⚡ 7. Micro-Animations & Dynamic States

1. **Hover Lift Effect**: Elevasi bayangan halus pada kartu produk saat pointer mouse berada di atas elemen (`transform: translateY(-4px)`).
2. **Live Radar Ping**: Denyut radar pada konsol pembayaran Midtrans (`animate-ping`) menandakan *active background polling*.
3. **Animated Courier Movement**: Animasi translasi kurir di sepanjang kurva jalur SVG peta pengantaran.
4. **Celebration Pop-up Bounce**: Animasi ikon memantul saat pembayaran Midtrans Sandbox terverifikasi sukses.
5. **Sequential Stepper Transition**: Animasi pergerakan bilah progress bar dan penanda waktu aktif pada alur pelacakan 5-tahap.
