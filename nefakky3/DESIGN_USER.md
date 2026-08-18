# 🎨 Design System & UI/UX Guidelines — Nefakky User Application

**Produk**: Nefakky - Artisanal Food & Culinary Marketplace (Aplikasi Pelanggan)  
**Versi Design**: 3.0.0 (Google Stitch AI UI System & Dual Firebase Architecture)  
**Tanggal Terakhir Diperbarui**: 18 Agustus 2026  
**Status**: Production Standard  
**Penulis**: Tim Pengembang Nefakky (Fatih Ahmad Zakky) & Google Stitch AI Design System  

---

## 📖 1. Visi & Prinsip Utama Desain Antarmuka Pelanggan

Antarmuka Pelanggan **Nefakky** mengadopsi filosofi **"Google Stitch Artisanal Luxury"**. Desain ini dirancang khusus untuk menciptakan pengalaman pemesanan makanan premium khas Nusantara yang hangat, responsif, dan estetik, dengan transisi yang mulus dari katalog hingga pelacakan pesanan *real-time*.

### Prinsip Utama UI/UX:
1. **Google Stitch Color System**: Kombinasi warna tanah (*earthy tones*) eksklusif: `#25160E` Deep Espresso, `#3C2A21` Espresso Container, `#934B19` Terracotta Accent, `#FFA26A` Soft Amber, `#FBF9F5` Warm Cream Canvas.
2. **Visual Appetite Appeal**: Foto produk kuliner resolusi tinggi (*High-Res Culinary Photography*), indikator rasa, rating bintang `★ 4.9`, dan typography `Playfair Display` serif yang mewah.
3. **Pilihan Varian 3-Jus Dalam 1 Halaman**: Kategori Minuman mendukung pemilihan 3 varian rasa jus (*Mangga Aromanis, Sirsak Madu, Jambu Merah*) secara dinamis pada 1 modal/halaman yang sama tanpa perpidahan link.
4. **Alamat Produksi Resmi**: Seluruh item menampilkan lokasi produksi resmi terpusat: *Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Jawa Barat*.
5. **Alur Checkout 4-Tahap & Payment Gateway Engine**: Visualisasi stepper transaksi yang intuitif (`1. Keranjang` $\rightarrow$ `2. Pengiriman & GPS` $\rightarrow$ `3. Pembayaran Midtrans Snap` $\rightarrow$ `4. Selesai`) terintegrasi dengan Midtrans Snap API & Sandbox Payment Simulator.
6. **Pelacakan Status Pesanan 5-Tahap Real-Time**: Integrasi langsung ke **Firebase Realtime Database** (`rtdb`) region `asia-southeast1` untuk pembaruan status pesanan tanpa *refresh* browser.
7. **Floating Real-time Tracker & Live CS Chat**: Mini-widget pelacak pesanan mengambang di seluruh halaman dan ruang obrolan langsung dengan customer service pada menu profil.

---

## 🎨 2. Toko Warna & Tokens CSS (`globals.css`)

```css
:root {
  /* Brand Primary Colors */
  --primary-espresso: #25160E;          /* Deep Espresso Navbar & Primary Accent */
  --primary-espresso-container: #3C2A21;/* Dark Container & Active Buttons */
  --primary-on-container: #AA9084;       /* Subtitle Muted Text */

  /* Brand Secondary & Accent Colors */
  --secondary-terracotta: #934B19;      /* Terracotta CTA Buttons & Active State */
  --secondary-amber: #FFA26A;           /* Soft Amber Highlight Container */
  --accent-gold: #D97706;               /* Star Rating & Price Accent */

  /* Surface & Canvas Colors */
  --surface-warm-cream: #FBF9F5;        /* Main Page Background Canvas */
  --surface-white: #FFFFFF;             /* Pure White Card Background */
  --surface-muted-cream: #F5F3EF;       /* Soft Fill Inputs & Secondary Cards */
  --surface-border: rgba(147, 75, 25, 0.15); /* Subtle Terracotta Border */

  /* Status Colors */
  --status-completed: #10B981;          /* Emerald Green - Paid / Completed */
  --status-cooking: #934B19;            /* Terracotta - Cooking / Processing */
  --status-delivering: #3B82F6;         /* Royal Blue - Shipping / On The Way */
}
```

---

## 📐 3. Tipografi & Grid Layout System

### 3.1 Tipografi
* **Body Text & Numbers**: `Inter`, `sans-serif` (Digunakan untuk harga, estimasi jarak, alamat, dan deskripsi porsi).
* **Display Titles & Headers**: `Playfair Display`, `serif` (Digunakan untuk judul hero, header modal, dan nama restoran pada struk PDF).
* **Monospace Codes**: `JetBrains Mono` / `ui-monospace` (Digunakan untuk Order ID `#ORD-4837`, Snap Token, dan Kode VA BCA).

### 3.2 System Grid Layout
* **Halaman Utama & Katalog**: `max-w-[1280px] mx-auto px-6 lg:px-16`.
* **Grid Produk Card**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`.
* **Grid Checkout & Tracking**: `grid grid-cols-1 lg:grid-cols-12 gap-8`.

---

## 🖥️ 4. Spesifikasi Halaman & Komponen Pelanggan

### 4.1 Header Navigation Bar (`src/components/Navbar.tsx`)
* **Styling**: Sticky top navbar dengan efek `backdrop-blur-md bg-[#25160E]/95 text-white border-b border-amber-900/20`.
* **Logo**: Logo `N` Playfair Display dalam badge Espresso dengan teks emas *Nefakky Artisanal Kitchen*.
* **Menu Links**: `Beranda` (`/`), `Katalog Menu` (`/menu`), `Ulasan Rasa` (`/comments`), `Keranjang` (`/cart`).
* **Badges & Quick Action**:
  - Pill Badge Count `Keranjang` dengan nomor item aktif.
  - Tombol Quick Access `Status Pesanan` (`/notifications`) dengan indikator titik pulsa hijau real-time.
  - Avatar Pengguna yang mengarahkan langsung ke Halaman Profil (`/profile`).

---

### 4.2 Halaman Utama & Hero Section (`src/app/page.tsx`)
* **Hero Banner**: Judul Playfair Display Serif *“Nikmati Kehangatan Kuliner Otentik Nusantara”* dengan latar gradasi hangat.
* **Pill Category Filter**: `Semua Menu`, `Makanan Berat` (Ayam Bakar, Gudeg, Garang Asam, Krecek), `Minuman` (Jus 3-Varian), `Menu Hemat` (Kombo Hemat).
* **Product Card Component**:
  - Container White Card `bg-white rounded-3xl p-5 border border-amber-900/10 shadow-xl hover:shadow-2xl transition-all`.
  - Gambar produk High-Res rounded 2xl dengan efek *hover zoom*.
  - Badge Promo Diskon (*15% OFF*).
  - Teks Alamat Produksi Resmi: *Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Jawa Barat*.
  - Indikator Rating Bintang `★ 4.9` & Jumlah Terjual.
  - Tombol Utama `+ Tambah ke Keranjang` dengan feedback toast animasi.

---

### 4.3 Modal & Halaman Detail Produk (`src/components/MenuDetailModal.tsx` & `src/app/menu/[id]/page.tsx`)
* **Pilihan 3-Varian Rasa Jus Minuman (1 Halaman)**:
  - Khusus produk Jus (`m6`), pelanggan dapat memilih 3 varian rasa jus secara langsung di 1 modal/halaman yang sama:
    1. 🥭 **Jus Mangga Aromanis** (`/images/jus_mangga.jpg`)
    2. 🍈 **Jus Sirsak Madu** (`/images/jus_sirsak.jpg`)
    3. 🔴 **Jus Jambu Merah Fresh** (`/images/jus_jambu.jpg`)
  - Foto display utama dan thumbnail strip otomatis berganti gambar sesuai varian rasa yang dipilih.
* **Informasi Detail Makanan**:
  - Rating bintang, ulasan pembeli, estimasi porsi, asal hidangan, dan alamat produksi resmi.
  - Pengatur jumlah porsi (`-`, `+`) dengan kalkulasi total harga real-time.

---

### 4.4 Halaman Keranjang & Checkout 4-Tahap (`src/app/cart/page.tsx`)
* **Horizontal Stepper Component**: `1. Keranjang` $\rightarrow$ `2. Pengiriman & Alamat` $\rightarrow$ `3. Pembayaran Midtrans` $\rightarrow$ `4. Selesai`.
* **Kalkulator Ongkir Auto-GPS (`AutoMapPickerModal.tsx`)**:
  - Modal peta interaktif untuk menentukan lokasi alamat antar via GPS Pinpoint Map.
  - Formula Ongkir: 15% dari subtotal makanan untuk jarak $\le$ 3km + Rp 1.500 per 2km tambahan.
* **Integrasi Gateway Pembayaran Midtrans Snap**:
  - Tombol **Bayar Sekarang** menghubungkan langsung ke API `/api/midtrans/token`.
  - Mendukung BCA Virtual Account, QRIS, GoPay, dan Kartu Kredit Sandbox dengan tautan ke Midtrans Payment Simulator.

---

### 4.5 Lacak Status Pesanan 5-Tahap Real-Time (`src/app/notifications/page.tsx`)
* **Multi-Order Switcher Pills**: Tab switcher pills horizontal di bagian atas untuk navigasi cepat antar pesanan aktif.
* **Visual Stepper Live 5-Tahap**:
  - `1. Pesanan Diterima` $\rightarrow$ `2. Sedang Dimasak` $\rightarrow$ `3. Siap Diambil` $\rightarrow$ `4. Dalam Perjalanan` $\rightarrow$ `5. Pesanan Selesai`.
  - Terhubung langsung ke **Firebase Realtime Database** (`rtdb`) di path `live_orders/{orderId}` via `onValue`. Status pada stepper bergerak otomatis ketika Admin Dapur merubah status.
* **Floating Realtime Tracker Widget (`RealtimeOrderTracker.tsx`)**:
  - Mini widget mengambang di pojok layar pada semua rute halaman.
* **Printable Receipt PDF Modal**:
  - Modal bukti pembayaran resmi Midtrans dengan logo huruf `N`, rincian item porsi, ongkir, diskon promo, dan tombol cetak `Cetak Struk (PDF)` (`window.print()`).

---

### 4.6 Profil & Live CS Chat (`src/app/profile/page.tsx`)
* **Tab Edit Profil**: Form nama lengkap, nomor WhatsApp, alamat pengiriman utama, dan foto avatar Google SSO.
* **Tab Riwayat Pesanan**: Riwayat pesanan permanen dengan opsi pesan ulang (*Re-order*).
* **Tab Live CS Chat**: Antarmuka ruang chat interaktif real-time dengan Admin Customer Service yang tersinkronisasi ke Firebase Realtime Database (`chat_messages`).

---

### 4.7 Ulasan Rasa & Testimonial (`src/app/comments/page.tsx`)
* **Daftar Ulasan Pelanggan**: Grid ulasan lengkap dengan avatar, nama pembeli, rating bintang, dan tanggal posting.
* **Modal Live Camera (`LiveCameraModal.tsx`)**: Pengambilan foto langsung dari webcam / kamera HP untuk ulasan hidangan dengan opsi unggah berkas lokal.

---

### 4.8 Halaman Autentikasi (`/login`, `/register`, `/forgot-password`)
* **Container Glassmorphism**: Card centered `max-w-md w-full bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-amber-900/10 shadow-2xl`.
* **Multi-Option Login**: Tombol Google Sign-In Single-Sign-On (SSO) & Form Email/Password dengan pesan error Bahasa Indonesia yang jelas.

---

*Lihat juga: **[DESIGN_ADMIN.md](file:///f:/UKK/nefakky3/DESIGN_ADMIN.md)** untuk spesifikasi antarmuka admin dan **[DESIGN.md](file:///f:/UKK/nefakky3/DESIGN.md)** untuk Master Design System.*
