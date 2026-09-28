# 🧪 Nefakky Marketplace — Web Test Report

> **Laporan Pengujian Otomatis Aplikasi Web Nefakky**  
> *Laporan ini diperbarui secara otomatis setiap kali perintah `npm test` atau pengujian dieksekusi.*

---

## 📌 Ringkasan Pengujian

| Parameter | Hasil |
| :--- | :--- |
| **Status Keseluruhan** | **PASSED ✅** |
| **Waktu Eksekusi** | 28/9/2026, 08.56.56 WIB |
| **Total Pengujian** | 11 Tes |
| **Berhasil (Passed)** | **11** ✅ |
| **Gagal (Failed)** | **0** ❌ |
| **Durasi Eksekusi** | 24293 ms |

---

## 📋 Detail Pengujian per Modul


### 1. 1. TypeScript Compilation — tsc --noEmit type check
- **Status**: ✅ PASS
- **Waktu Eksekusi**: 19201 ms
- **Keterangan**: Pengujian berhasil tanpa masalah.


### 2. 2. Route Integrity — Core application routes existence
- **Status**: ✅ PASS
- **Waktu Eksekusi**: 6 ms
- **Keterangan**: Pengujian berhasil tanpa masalah.


### 3. 3. Product Catalog Integrity — Default 6 product items complete in DataContext
- **Status**: ✅ PASS
- **Waktu Eksekusi**: 2 ms
- **Keterangan**: Pengujian berhasil tanpa masalah.


### 4. 4. Review System — Bahasa Indonesia product reviews helper (reviews.ts)
- **Status**: ✅ PASS
- **Waktu Eksekusi**: 1 ms
- **Keterangan**: Pengujian berhasil tanpa masalah.


### 5. 5. Cart & Promo Engine — Voucher & discount logic in DataContext & CartContext
- **Status**: ✅ PASS
- **Waktu Eksekusi**: 1 ms
- **Keterangan**: Pengujian berhasil tanpa masalah.


### 6. 6. Firebase Configuration — Firebase app initialization in lib/firebase.ts
- **Status**: ✅ PASS
- **Waktu Eksekusi**: 0 ms
- **Keterangan**: Pengujian berhasil tanpa masalah.


### 7. 7. Midtrans Sandbox API Integrity — Charge & Status API Routes (/api/midtrans/*)
- **Status**: ✅ PASS
- **Waktu Eksekusi**: 1 ms
- **Keterangan**: Pengujian berhasil tanpa masalah.


### 8. 8. Distance Shipping Engine — Distance shipping calculation logic (<=10km flat 10k, >10km +2.5k/2km)
- **Status**: ✅ PASS
- **Waktu Eksekusi**: 1 ms
- **Keterangan**: Pengujian berhasil tanpa masalah.


### 9. 9. Order Timezone Integrity — Tanggal pesanan konsisten WIB & tab "Hari Ini" benar (orderTimeUtils)
- **Status**: ✅ PASS
- **Waktu Eksekusi**: 4823 ms
- **Keterangan**: Pengujian berhasil tanpa masalah.


### 10. 10. Product Variant Isolation — Non-drink menus must not inherit DRINK_VARIANTS and activeDrinkVariant must be guarded
- **Status**: ✅ PASS
- **Waktu Eksekusi**: 2 ms
- **Keterangan**: Pengujian berhasil tanpa masalah.


### 11. 11. Voucher Deduplication — Strict deduplication of promo codes and IDs
- **Status**: ✅ PASS
- **Waktu Eksekusi**: 251 ms
- **Keterangan**: Pengujian berhasil tanpa masalah.


---

## 🛠️ Modul Yang Diuji
1. **TypeScript Type Compiler**: Memastikan 0 error tipe data (`TS2345`, `TS2322`, tipe data tidak valid, atau sintaks yang rusak) di seluruh codebase.
2. **Integritas Rute & Komponen**: Verifikasi ketersediaan rute halaman utama, katalog, detail menu dinamis, keranjang belanja, admin console, auth modal, komentar, notifikasi, dan profile.
3. **Katalog Produk & Data Master**: Memastikan 6 produk master lengkap (*Ayam Bakar, Nasi Bakar, Krecek, Gudeg, Garang Asam, Jus*) dan sinkron dengan DataContext.
4. **Sistem Ulasan & Komentar**: Memastikan helper ulasan (*reviews.ts*) menghasilkan komentar Bahasa Indonesia yang kaya dan relevan dengan cita rasa hidangan.
5. **Logika Keranjang & Promo Diskon**: Memastikan kalkulasi keranjang belanja, diskon voucher `WEEKENDSERU` (30%), dan batasan minimum transaksi bekerja akurat.
6. **Integrasi Firebase Cloud**: Verifikasi kesiapan inisialisasi Firebase Auth & Realtime Firestore Database.
7. **Integritas Midtrans Sandbox API**: Memastikan route handler charge (`/api/midtrans/charge`) dan cek status (`/api/midtrans/status`) terpasang dengan validasi orderId & transaction_status.
8. **Mesin Kalkulasi Ongkir GPS Haversine**: Menguji formula jarak tarif flat Rp10.000 (≤10 km) dan penambahan Rp2.500 per 2 km berikutnya.
9. **Integritas Timezone Pesanan WIB**: Memastikan format tanggal pesanan standar ISO & WIB dan tab "Hari Ini" pada Admin Panel memfilter rentang hari yang tepat.
10. **Isolasi Varian Minuman**: Memastikan hidangan non-minuman tidak mewarisi varian es/panas/gula serta mencegah crash rendering `activeDrinkVariant`.
11. **Deduplikasi & Integritas Voucher**: Memastikan normalisasi string voucher, sanitasi uppercase/trim, pencegahan duplikasi kode promo, dan auto-reset siklus ISO-Week.

---

*Laporan dibuat otomatis oleh Nefakky Automated Test Runner.*
