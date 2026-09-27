# Catatan Riwayat Perubahan (CHANGELOG.md) — Nefakky Marketplace

Semua pembaruan penting, penambahan fitur, perbaikan bug, dan peningkatan desain pada proyek **Nefakky Artisanal Culinary Marketplace** didokumentasikan dalam berkas ini.

Format pencatatan mengacu pada standar [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan mengikuti kaidah [Semantic Versioning](https://semver.org/).

---

## [4.8.0] — 2026-09-27 (Centralized Orders API, Cross-Incognito Kitchen Desk Realtime Sync, Hardware Audio Chime & Floating Order Toast)

### 🚀 Ditambahkan (Added)
* **Server API Pesanan Terpusat (`/api/orders`)**:
  - Dibuat rute backend Next.js `src/app/api/orders/route.ts` dengan persistensi permanen ke `.orders_store.json` dan in-memory caching berlatensi rendah.
  - Mendukung seluruh siklus hidup pesanan: `create` (pesanan baru), `update_status` (tahap dapur 5-tahap), `proof_photo` (foto bukti POD kurir & COD), `cancel`, `delete`, dan `sync` (bulk merge LWW).
* **Jembatan Realtime Lintas-Jendela Penyamaran (Cross-Incognito Synchronization)**:
  - Mengatasi isolasi Chromium pada mode Incognito/Private yang memblokir `localStorage` dan `BroadcastChannel`.
  - Integrasi background synchronizer di `DataContext.tsx` dengan interval polling 1.5 detik serta pemicu instan saat tab dibuka kembali (`document.addEventListener('visibilitychange')`).
  - Sinkronisasi dua arah otomatis antara window browser pembeli dan panel admin Kitchen Desk tanpa memerlukan refresh halaman manual.
* **Backup Push Langsung pada Proses Checkout (`src/app/cart/page.tsx`)**:
  - Pengiriman tiket pesanan langsung ke `/api/orders` sesaat setelah pembayaran Midtrans (Virtual Account / QRIS / Kartu) atau COD terverifikasi, menjamin pesanan tersimpan di server sebelum pengalihan halaman selesai.
* **Audio Synth Chime Bel Dapur & Floating Alert Toast (`AdminLayout.tsx`)**:
  - Sintesis audio Web Audio API berbasis perangkat keras tanpa aset audio eksternal: memainkan akord lonceng segitiga harmonik (C5 -> E5 -> G5 -> C6) saat pesanan baru masuk.
  - Floating toast alert interaktif berdesain mewah dengan tombol aksi 1-klik *"Buka Kitchen Desk"* untuk langsung memproses hidangan pelanggan.

### 🛠️ Diperbaiki (Fixed)
* **Tiket Pesanan Online Midtrans Hilang di Panel Dapur Admin**:
  - Memperbaiki masalah di mana transaksi pengujian online Midtrans (seperti pesanan `#NFK-890783` atas nama `anonim1`) hanya tersimpan di browser pembeli dan tidak muncul di Kitchen Desk Admin.
  - Memastikan stempel waktu `createdAt` dan `isOrderToday` sinkron secara presisi dengan zona waktu Indonesia Barat (WIB Asia/Jakarta), menginkrementasi counter "Hari Ini" dan "Pesanan Masuk" secara realtime.

---

## [4.7.0] — 2026-09-25 (Voucher Integrity, Normalization & ISO-Week Auto-Reset Engine)

### 🚀 Ditambahkan (Added)
* **Mesin Sanitasi & Normalisasi Voucher (`cleanPromoCode`)**:
  - Menghapus karakter awalan tanda pagar (`#`), spasi acak, dan menormalisasi kode ke format huruf kapital (*uppercase*) seragam.
* **Deduplikasi Kupon Promo Ketat**:
  - Menghilangkan kemunculan voucher ganda di halaman promo dan keranjang belanja dengan penyaringan unik berbasis kode dan ID.
* **Auto-Reset Mingguan ISO (`nefakky_used_vouchers_week`)**:
  - Mengatur siklus klaim voucher pengguna agar ter-reset secara otomatis setiap awal pekan ISO baru, memungkinkan pelanggan setia memanfaatkan promo mingguan secara berkelanjutan.

---

## [4.6.0] — 2026-09-24 (Manual CS Live Chat Desk & Realtime Multi-Window Synchronization)

### 🚀 Ditambahkan (Added)
* **Layanan Pelanggan CS 100% Manual (Human-Only Agent Response)**:
  - Menghapus seluruh logika bot auto-reply otomatis; seluruh jawaban atas pertanyaan pelanggan kini dikirimkan secara manual oleh staf admin dari meja CS Live Desk.
* **Server API Obrolan Terpusat (`/api/chat`)**:
  - Menyimpan percakapan pelanggan dan admin secara persisten di `.chat_store.json`.
  - Sinkronisasi realtime pesan obrolan antara pelanggan di jendela penyamaran (Incognito) dan admin di jendela normal.
* **Audio Chime Notifikasi Pesan Masuk**:
  - Sintesis Web Audio API (nada D5 -> A5) dan floating toast pesan masuk di bilah navigasi admin.

---

## [4.5.0] — 2026-09-14 (Anti-AI-Slop 33 Bespoke Vector Icons, Live Camera Hardware Capture & Telemetry)

### 🚀 Ditambahkan (Added)
* **Arsitektur Ikon Kustom Anti-AI-Slop (33 Ikon Vektor Autentik)**:
  * Menghapus ketergantungan ikon generik bawaan dan emoji kartun 3D yang berkesan "AI slop".
  * Mengintegrasikan 33 ikon kustom buatan manusia yang dikompilasi secara otomatis via script generator `scripts/gen_icons.py` ke dalam komponen inti `src/components/icons/CustomIcons.tsx`.
  * Menggunakan teknik rendering modern CSS `mask-image: url(...)` dengan `bg-current` untuk ikon monokromatik (sehingga mewarisi warna teks Tailwind seperti `#FF5400`, `#FFB703`, `text-slate-400` secara sempurna).
  * Dukungan ikon berwarna penuh (*full-color badge*) untuk Gmail, ShieldCheck, dan CheckCircle.
  * Drop-in alias lengkap yang 100% kompatibel dengan komponen standar:
    - *Batch 1*: `Search`, `ShoppingBag`, `ShoppingCart`, `Home`, `Phone`, `MapPin`.
    - *Batch 2*: `Lock`, `Gmail`, `Google`, `Mail`, `Clock`, `User`.
    - *Batch 3*: `LogOut`, `Leaf`, `Ticket`, `Tag`, `Flame`, `ShieldCheck`.
    - *Batch 4*: `Star`, `Hourglass`, `BarChart`, `BarChart2`, `BarChart3`, `MessageSquare`, `MessageCircle`, `Calendar`, `CalendarClock`.
    - *Batch 5*: `Download`, `FileDown`, `Pdf`, `FileSpreadsheet`, `Printer`, `Receipt`, `FileText`, `File`.
    - *Batch 6*: `Pencil`, `Edit`, `Edit3`, `Trash`, `Trash2`, `Eye`, `CheckCircle`, `CheckCircle2`, `Camera`.
    - *Batch 7*: `CookingPot`, `Utensils`, `UtensilsCrossed`, `ChefHat`, `Megaphone`, `Bell`, `Radio`, `Settings`, `Settings2`, `Sliders`, `SlidersHorizontal`.
* **Modul Kamera Langsung untuk Proof-of-Delivery (`LiveCameraModal.tsx`)**:
  * Mengakses perangkat kamera langsung melalui `navigator.mediaDevices.getUserMedia` tanpa memerlukan aplikasi pihak ketiga.
  * Fitur penangkapan foto kurir (*snapshot capture*) saat serah terima makanan dan pembayaran tunai COD.
* **Integrasi Ikon Autentik pada Sidebar Admin (`AdminSidebar.tsx`)**:
  * Mengganti seluruh ikon Material Symbols dan Lucide dengan `BarChart3`, `ShoppingBag`, `CookingPot`, `Megaphone`, `Star`, `MessageSquare`, dan `Settings`.

### 🛠️ Diperbaiki (Fixed)
* **Pembersihan Seluruh Impor Lucide**:
  * Menggantikan seluruh referensi icon generic di `RealtimeToastBanner.tsx`, `RealtimeOrderTracker.tsx`, `Navbar.tsx`, `ActiveOrderBlockerModal.tsx`, `AdminOrdersTab.tsx`, `AdminDashboardTab.tsx`, `page.tsx`, `menu/page.tsx`, `comments/page.tsx`, `notifications/page.tsx`, dan `AutoMapPickerModal.tsx`.
* **Kompilasi TypeScript 100% Bersih**:
  * Menjalankan `npx tsc --noEmit` dengan hasil **0 errors**.

---

## [3.7.0] — 2026-08-31 (Single Active Order Policy, Multi-Voucher Stacking & UI Polishing)

### 🚀 Ditambahkan (Added)
* **Single Active Order Policy (Pembatasan Pesanan Aktif Berjalan)**:
  * Proteksi sistem yang mencegah pengguna melakukan checkout/transaksi pembelian baru jika masih memiliki pesanan aktif yang belum selesai (`RECEIVED`, `PREPARING`, `READY`, `DELIVERING`, atau belum dikonfirmasi pelanggan).
  * Komponen modal pop-up mewah `ActiveOrderBlockerModal.tsx` yang menampilkan detail status pesanan berjalan dan tombol pintas *"Lacak & Selesaikan Pesanan Ini"* menuju halaman pelacakan.
  * Banner peringatan informatif di langkah 1 Keranjang Belanja dan penguncian tombol checkout.
  * Tombol *"Konfirmasi Pesanan Telah Sampai"* di halaman `/notifications` yang secara realtime menyelesaikan pesanan dan langsung membuka kembali akses checkout bagi pengguna.
* **Multi-Voucher Promo Stacking (Maksimal 2 Voucher Bersamaan)**:
  * Dukungan penggunaan hingga maksimal 2 voucher diskon bersamaan di keranjang belanja (`CartContext.tsx`).
  * Akumulasi persentase diskon otomatis dan pemotongan total belanja.

---

## [3.6.0] — 2026-08-27 (Enterprise Modernization & Code Refactor)

### 🚀 Ditambahkan (Added)
* **Pustaka Frontend Modern**:
  * `@tanstack/react-query` untuk caching cerdas dan auto-revalidasi data API.
  * `zustand` untuk state management keranjang belanja.
  * `framer-motion` untuk transisi halaman dan efek mikro-animasi.
  * `embla-carousel-react` untuk slider banner responsif.
  * `canvas-confetti` untuk animasi perayaan saat pesanan sukses.
  * `leaflet` + `react-leaflet` untuk visualisasi peta geografis rute kurir pengantaran.
* **Pustaka Backend Laravel 12**:
  * `barryvdh/laravel-dompdf` untuk cetak struk nota dan invoice resmi PDF.
  * `rap2hpoutre/fast-excel` untuk ekspor laporan omset dan keuangan ke Excel Spreadsheet.
  * `spatie/laravel-activitylog` untuk audit trail riwayat aksi admin.
  * `dedoc/scramble` untuk dokumentasi interaktif OpenAPI otomatis (`/docs/api`).
* **Dokumentasi Terpadu**: Pembuatan dokumen arsitektur komprehensif (`ARCHITECTURE.md`, `API.md`, `DATABASE.md`, `WORKFLOW.md`, `INSTALLATION.md`, `CHANGELOG.md`, `CONTRIBUTING.md`).
