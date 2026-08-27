# Spesifikasi Referensi RESTful API: Nefakky Backend (Laravel 12)

**Versi API**: v1.0.0  
**Base URL**: `http://localhost:8000/api` (atau domain produksi: `https://api.nefakky.com/api`)  
**Format Payload**: JSON (`Content-Type: application/json`, `Accept: application/json`)  
**Standar Otentikasi**: Laravel Sanctum Bearer Token (`Authorization: Bearer <TOKEN>`)  
**Dokumentasi Interaktif**: Akses `http://localhost:8000/docs/api` (Scramble OpenAPI Viewer)  

---

## 1. Format Standar Respons API

Seluruh respons dari API Nefakky mengikuti standar JSON seragam:

### Respons Berhasil (200 OK / 201 Created)
```json
{
  "success": true,
  "status": "success",
  "code": 200,
  "message": "Data pesanan berhasil diambil",
  "data": { ... }
}
```

### Respons Gagal / Validasi Galat (400 / 422 / 500)
```json
{
  "success": false,
  "status": "error",
  "code": 422,
  "message": "Validasi input gagal",
  "errors": {
    "customer_name": ["Nama pelanggan wajib diisi"],
    "phone": ["Nomor telepon harus valid"]
  }
}
```

---

## 2. Ringkasan Endpoint Utama Berdasarkan Modul

### 2.1 Health Check & Server Status
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Memeriksa status kesehatan server dan koneksi database | Publik |

---

### 2.2 Autentikasi & Pengguna (Auth API)
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Mendaftarkan akun pelanggan baru | Publik |
| `POST` | `/auth/login` | Login dengan email dan password, mengembalikan Sanctum token | Publik |
| `POST` | `/auth/google` | Autentikasi / SSO dengan token akun Google | Publik |
| `GET` | `/auth/me` | Mengambil data profil pengguna yang sedang login | Autentikasi |
| `PUT` | `/auth/profile` | Memperbarui nama, telepon, dan foto avatar | Autentikasi |
| `POST` | `/auth/change-password` | Mengubah password akun lama ke password baru | Autentikasi |
| `POST` | `/auth/logout` | Mencabut token akses dan mengakhiri sesi | Autentikasi |

---

### 2.3 Katalog Produk & Stok (Products API)
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Mengambil daftar seluruh produk (dengan filter kategori & search) | Publik |
| `GET` | `/products/visible` | Mengambil produk aktif yang ditampilkan untuk pelanggan | Publik |
| `GET` | `/products/{id}` | Mengambil rincian 1 produk hidangan | Publik |
| `POST` | `/products` | Menambahkan produk hidangan baru ke katalog | Admin |
| `PUT` | `/products/{id}` | Memperbarui data produk hidangan | Admin |
| `DELETE` | `/products/{id}` | Menghapus produk dari katalog | Admin |
| `POST` | `/products/{id}/stock` | Mengubah jumlah stok produk secara langsung | Admin |
| `POST` | `/products/{id}/toggle-visibility` | Mengaktifkan/menonaktifkan tampilnya produk di katalog | Admin |

---

### 2.4 Transaksi & Pengiriman Pesanan (Orders API)
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/orders` | Mengambil daftar pesanan (filter: status, email, tanggal) | Autentikasi |
| `POST` | `/orders` | Membuat pesanan baru (mengurangi stok & memicu broadcast) | Publik / Auth |
| `GET` | `/orders/{id}` | Mengambil detail lengkap pesanan dan rincian item | Autentikasi |
| `PUT` | `/orders/{id}` | Memperbarui informasi data pesanan | Admin |
| `DELETE` | `/orders/{id}` | Menghapus data pesanan (soft delete) | Admin |
| `GET` | `/orders/stats` | Ringkasan statistik jumlah pesanan per status | Admin |
| `POST` | `/orders/{id}/advance-stage` | Memajukan status 5-tahap (RECEIVED $\rightarrow$ COOKING $\rightarrow$ READY $\rightarrow$ DELIVERING $\rightarrow$ COMPLETED) | Admin |
| `POST` | `/orders/{id}/confirm` | Konfirmasi penerimaan pesanan oleh pelanggan | Autentikasi |
| `POST` | `/orders/{id}/cancel` | Membatalkan pesanan dan mengembalikan kuantitas stok | Autentikasi / Admin |
| `POST` | `/orders/{id}/proof` | Mengunggah foto bukti serah terima / transfer pembayaran | Autentikasi |
| `GET` | `/orders/{id}/invoice-pdf` | Mengunduh berkas struk invoice resmi dalam format PDF | Publik / Auth |

---

### 2.5 Kupon Diskon & Voucher Promo (Vouchers API)
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/vouchers` | Mengambil daftar voucher diskon yang sedang aktif | Publik |
| `GET` | `/vouchers/all` | Mengambil seluruh voucher (aktif & nonaktif) | Admin |
| `POST` | `/vouchers/validate` | Memvalidasi kode kupon promo dan menghitung diskon | Publik |
| `POST` | `/vouchers` | Membuat kupon promo diskon baru | Admin |
| `PUT` | `/vouchers/{id}` | Memperbarui ketentuan voucher | Admin |
| `DELETE` | `/vouchers/{id}` | Menghapus kupon promo | Admin |
| `POST` | `/vouchers/{id}/toggle-status` | Mengaktifkan atau menonaktifkan voucher promo | Admin |

---

### 2.6 Ulasan, Rating & Moderasi (Reviews API)
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/reviews` | Mengambil daftar ulasan pelanggan | Publik |
| `POST` | `/reviews` | Mengirimkan ulasan pengalaman rasa hidangan | Autentikasi |
| `GET` | `/reviews/summary` | Mengambil statistik rata-rata rating dan distribusi bintang | Publik |
| `POST` | `/reviews/{id}/like` | Menambahkan likes pada ulasan pengguna | Autentikasi |
| `POST` | `/reviews/{id}/reply` | Mengirimkan balasan resmi CS admin pada ulasan | Admin |
| `POST` | `/reviews/{id}/moderate` | Memoderasi status ulasan (Approved, Hidden, Pinned) | Admin |

---

### 2.7 Laporan Finansial & Omset Penjualan (Sales Reports API)
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/reports/sales` | Mengambil rekapitulasi omset bulanan, laba, dan AOV | Admin |
| `GET` | `/reports/sales/years` | Mengambil daftar tahun yang memiliki catatan pembukuan | Admin |
| `POST` | `/reports/sales` | Menyimpan / memperbarui omset bulanan atau bazar POS | Admin |
| `DELETE` | `/reports/sales/{id}` | Menghapus baris catatan laporan omset | Admin |
| `GET` | `/reports/sales/export-excel` | **Mengekspor laporan keuangan ke format spreadsheet (.xlsx via FastExcel)** | Admin |
| `GET` | `/weekly-recaps/month/{month}`| Mengambil rekap penjualan mingguan & performa bazar kuliner | Admin |

---

### 2.8 Payment Gateway Midtrans (Midtrans API)
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `POST` | `/midtrans/token` | Membuat Snap Token transaksi Midtrans untuk popup checkout | Publik / Auth |
| `POST` | `/midtrans/charge` | Memproses pembayaran Core API (VA, QRIS, Kartu Kredit) | Publik / Auth |
| `GET` | `/midtrans/status/{orderId}` | Memeriksa status transaksi pembayaran ke server Midtrans | Publik / Auth |
| `POST` | `/midtrans/webhook` | Webhook receiver otomatis notifikasi pelunasan Midtrans | Server Midtrans |

---

### 2.9 Geolocation & Kalkulator Haversine
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `POST` | `/haversine/distance` | Menghitung jarak kilometer dan tarif ongkir antar 2 koordinat GPS | Publik |

---

### 2.10 Live Chat Dukungan Pelanggan (Chats API)
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/chats` | Mengambil riwayat pesan obrolan per email pelanggan | Autentikasi |
| `POST` | `/chats` | Mengirimkan pesan chat baru dan memicu broadcast WebSocket | Autentikasi |
| `POST` | `/chats/read` | Menandai pesan sebagai telah dibaca (*Read Receipts*) | Autentikasi |
