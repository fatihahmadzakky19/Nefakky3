# 🍲 Nefakky — Artisanal Culinary Marketplace & Enterprise Operations Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5_Strict-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Custom Icons](https://img.shields.io/badge/Anti--AI--Slop-33_Bespoke_Icons-FF5400?style=for-the-badge)](src/components/icons/CustomIcons.tsx)
[![Laravel Reverb](https://img.shields.io/badge/Laravel_Reverb-WebSockets_Active-FF2D20?style=for-the-badge)](https://laravel.com/docs/reverb)
[![Midtrans](https://img.shields.io/badge/Midtrans-Snap_Sandbox-004B99?style=for-the-badge)](https://midtrans.com/)
[![Test Suite](https://img.shields.io/badge/Test_Suite-100%25_Passed_(0_Errors)-success?style=for-the-badge)](docs/TEST_REPORT.md)

---

## 📖 Ringkasan Eksekutif & Gambaran Umum

**Nefakky** adalah platform *artisanal e-commerce* dan marketplace kuliner terpadu yang dirancang khusus untuk menyajikan hidangan autentik khas nusantara secara higienis, transparan, dan akuntabel.

Aplikasi ini menolak estetika generic buatan template AI (*Anti-AI-Slop*) dengan mengusung **33 ikon kustom buatan manusia** yang di-render melalui teknik CSS mask vektor (`mask-image: url(...)` + `bg-current`), dipadukan dengan tipografi modern Google Fonts Outfit, sistem pelacakan pesanan 5-tahap sekuensial, integrasi kamera langsung untuk bukti pengantaran kurir (*Live Camera Snapshot Proof-of-Delivery*), perhitungan ongkos kirim berbasis koordinat GPS riil (*Haversine Distance Formula*), pembayaran digital Midtrans Snap & Tunai COD, serta modul **Enterprise Admin Command Studio** dengan fitur tutup buku tahunan otomatis dan ekspor laporan resmi **Excel (.xlsx)** & **PDF**.

---

## 📚 Indeks Dokumentasi Lengkap Proyek (`/docs`)

Seluruh spesifikasi teknis dan dokumentasi sistem tersimpan rapi pada direktori [`docs/`](docs/):

| Dokumen | Deskripsi & Cakupan |
| :--- | :--- |
| 📋 **[PRD.md](docs/PRD.md)** | Product Requirement Document: visi bisnis, user personas, spesifikasi fungsional & non-fungsional. |
| 🎨 **[DESIGN.md](docs/DESIGN.md)** | Master Design System: arsitektur 33 ikon kustom Anti-AI-slop, token warna, tipografi, dan micro-interactions. |
| 🛒 **[DESIGN_USER.md](docs/DESIGN_USER.md)** | Spesifikasi UI/UX antarmuka belanja pelanggan (Beranda, Menu, Cart, Tracking 5-tahap, Ulasan Rasa, Chat). |
| 🏢 **[DESIGN_ADMIN.md](docs/DESIGN_ADMIN.md)** | Spesifikasi UI/UX Enterprise Admin Command Studio (Dashboard KPI, Kitchen Desk, POS Logger, Settings). |
| 🏗️ **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Arsitektur sistem menyeluruh, komponen frontend Next.js 14, backend Laravel 12, Reverb, dan Firestore. |
| 📡 **[API.md](docs/API.md)** | Spesifikasi endpoint RESTful API, webhook Midtrans, payload JSON, dan kanal WebSocket Reverb. |
| 🗄️ **[DATABASE.md](docs/DATABASE.md)** | Skema basis data, ERD (Entity Relationship Diagram), koleksi Firestore NoSQL, dan migrasi SQLite/MySQL. |
| 🔄 **[WORKFLOW.md](docs/WORKFLOW.md)** | Alur kerja bisnis: siklus hidup pesanan 5-tahap, protokol lonjakan pesanan High Demand, dan tutup buku tahunan. |
| 💻 **[INSTALLATION.md](docs/INSTALLATION.md)** | Panduan instalasi dan setup lingkungan lokal (Next.js 14, Python icon generator, Laravel, Firebase, Reverb). |
| 🧪 **[TEST_REPORT.md](docs/TEST_REPORT.md)** | Laporan pengujian otomatis & manual: Typecheck 0 errors, integrasi Midtrans, dan benchmark WebSockets. |
| 📜 **[CHANGELOG.md](docs/CHANGELOG.md)** | Catatan riwayat versi dari v1.0.0 hingga rilis v4.5.0. |
| 🤝 **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** | Panduan kontribusi, standard code style, prosedur penambahan ikon baru, dan alur kerja Git. |

---

## 🚀 Fitur Unggulan Platform

### 🛒 1. Modul Pelanggan (Customer Experience)
* **Arsitektur Ikon Kustom Anti-AI-Slop**: 100% bebas dari emoji 3D kartun dan ikon template generic; didukung 33 ikon vektor presisi buatan tangan.
* **Single Active Order Protection**: Mencegah multi-order tumpang tindih dengan mengunci checkout baru sebelum pesanan aktif selesai atau dikonfirmasi.
* **Katalog Hidangan & Varian Sambal**: Menampilkan informasi gizi (kalori, protein, lemak), komposisi rempah, dan opsi varian kepedasan.
* **Perhitungan Ongkir GPS Haversine**: Penentuan titik alamat via Leaflet OpenStreetMap / Google Maps dengan rumus jarak lengkung bola bumi presisi.
* **Pembayaran Ganda Terintegrasi**: QRIS, GoPay, ShopeePay, Virtual Account Bank via Midtrans Snap, serta Cash on Delivery (COD).
* **Pelacakan Pesanan 5-Tahap Realtime**: Telemetri tahapan `RECEIVED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `DELIVERING` $\rightarrow$ `DELIVERED` dengan alert lonjakan jam sibuk (*High Demand*).
* **Ulasan Komunitas & Rating Emas**: Mengunggah foto masakan riil via kamera atau galeri dengan rating bintang 1–5.
* **CS Live Chat Instan**: Obrolan dua arah langsung dengan admin dapur restoran.

### 🏢 2. Modul Admin Command Studio (`/admin`)
* **Executive Dark Header & Realtime Clock**: Jam digital WIB presisi dan telemetri status koneksi database.
* **Dashboard Analitik & Bar Chart**: Visualisasi omset kotor, estimasi laba bersih 40%, volume order, dan sensor tutup buku tahunan otomatis.
* **Kitchen Desk 5-Tahap & Hardware Live Camera POD**: Kontrol status pemrosesan dapur dan pengambilan foto bukti serah terima kurir langsung melalui webcam/kamera perangkat.
* **Cetak Struk Kasir Thermal**: Format nota struk kasir 58mm / 80mm standar POS lengkap dengan rincian hidangan dan barcode.
* **Katalog Produk & Kontrol Stok**: Saklar instan *In-Stock* / *Sold-Out* untuk mencegah pemesanan hidangan saat bahan habis.
* **Voucher Builder**: Pembuat kode promo dengan batas minimum transaksi dan kuota klaim.
* **Pengaturan Resto & Peta**: Konfigurasi koordinat Central Kitchen, pemilihan provider peta, dan saklar darurat *High Demand*.

---

## ⚡ Panduan Cepat Menjalankan Proyek

```bash
# 1. Masuk ke direktori frontend
cd f:\UKK\nefakky3

# 2. Pasang dependensi
npm install

# 3. Generate 33 ikon kustom
npm run icons

# 4. Jalankan pengecekan TypeScript (wajib 0 error)
npx tsc --noEmit

# 5. Jalankan server pengembangan
npm run dev
```

Buka peramban di: **`http://localhost:3000`**  
Kredensial Admin Demo: `admin@nefakky.com` / `admin123`
