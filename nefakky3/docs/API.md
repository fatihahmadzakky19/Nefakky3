# Spesifikasi Referensi RESTful API: Nefakky Backend

**Versi API**: v1.2.0 (Updated September 2026 — Reverb WebSocket & Multi-Provider Telemetry)  
**Base URL**: `http://localhost:8000/api` (Pengembangan Lokal) / `https://api.nefakky.com/api` (Produksi)  
**Format Payload**: JSON (`Content-Type: application/json`, `Accept: application/json`)  
**Standar Otentikasi**: Laravel Sanctum Bearer Token (`Authorization: Bearer <TOKEN>`) & Firebase ID Token  
**WebSocket Server**: `ws://localhost:8080` (Laravel Reverb / Pusher Protocol v7)  

---

## 1. Format Standar Respons API

### 1.1 Respons Sukses (200 OK / 201 Created)
```json
{
  "success": true,
  "status": "success",
  "code": 200,
  "message": "Data berhasil diproses",
  "data": { ... }
}
```

### 1.2 Respons Gagal / Validasi Galat (400 / 422 / 500)
```json
{
  "success": false,
  "status": "error",
  "code": 422,
  "message": "Validasi input formulir gagal",
  "errors": {
    "customer_name": ["Nama pelanggan wajib diisi"],
    "phone": ["Nomor telepon harus berformat nomor Indonesia yang valid"]
  }
}
```

---

## 2. Rincian Endpoint REST API

### 2.1 Health Check & Server Status
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Memeriksa ketersediaan server API, status koneksi database, dan Reverb | Publik |

---

### 2.2 Autentikasi & Pengguna (Auth API)
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Mendaftarkan akun pelanggan baru (nama, email, password, telepon) | Publik |
| `POST` | `/auth/login` | Login menggunakan email dan password, mengembalikan Sanctum Bearer Token | Publik |
| `POST` | `/auth/google` | Autentikasi SSO via Google OAuth token | Publik |
| `GET` | `/auth/me` | Mengambil data profil pengguna yang sedang aktif | User Token |
| `PUT` | `/auth/profile` | Memperbarui informasi nama, nomor telepon, dan URL foto profil | User Token |
| `POST` | `/auth/logout` | Mencabut token akses aktif dan mengakhiri sesi | User Token |

---

### 2.3 Katalog Produk & Manajemen Stok (Products API)
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Mengambil daftar seluruh hidangan aktif dengan filter kategori & pencarian | Publik |
| `GET` | `/products/{id}` | Mengambil rincian hidangan lengkap (nutrisi, varian sambal, ulasan) | Publik |
| `POST` | `/admin/products` | Menambahkan menu hidangan baru ke katalog resto | Admin |
| `PUT` | `/admin/products/{id}` | Memperbarui data hidangan, harga, rempah, dan komposisi | Admin |
| `PATCH` | `/admin/products/{id}/stock` | Mengubah saklar ketersediaan stok (*In-Stock* / *Sold-Out*) secara instan | Admin |
| `DELETE` | `/admin/products/{id}` | Menghapus atau mengarsipkan hidangan dari katalog | Admin |

---

### 2.4 Transaksi & Dapur 5-Tahap (Orders & POS API)
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders/checkout` | Membuat transaksi pesanan baru (kalkulasi ongkir Haversine & voucher) | User / Publik |
| `GET` | `/orders/{orderId}` | Mengambil detail dan histori pelacakan pesanan 5-tahap | User Token / ID |
| `GET` | `/admin/orders` | Mengambil antrean pesanan dapur (filter status, waktu, pencarian pelanggan) | Admin |
| `PATCH` | `/admin/orders/{orderId}/status` | Mengubah status tahapan pesanan (`RECEIVED`, `PREPARING`, `READY`, `DELIVERING`, `DELIVERED`, `COMPLETED`) | Admin |
| `POST` | `/admin/orders/{orderId}/proof-photo` | Mengunggah foto bukti serah terima kurir via kamera langsung atau berkas | Admin |
| `POST` | `/orders/{orderId}/customer-confirm` | Konfirmasi penerimaan pesanan oleh pelanggan dengan opsi foto kepuasan | User Token |
| `GET` | `/admin/orders/{orderId}/receipt` | Mengambil payload data siap cetak untuk printer thermal kasir 58mm/80mm | Admin |

---

### 2.5 Kupon & Promosi (Promotions API)
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/vouchers` | Mengambil daftar voucher promosi aktif yang dapat diklaim | Publik |
| `POST` | `/vouchers/validate` | Memvalidasi kode kupon terhadap total belanja dan batas kuota pengguna | Publik |
| `POST` | `/admin/vouchers` | Membuat kode voucher promo baru (tipe persen atau nominal rupiah) | Admin |
| `DELETE` | `/admin/vouchers/{id}` | Menghapus atau menonaktifkan kode voucher | Admin |

---

### 2.6 Ulasan & Komunitas Rasa (Reviews API)
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/reviews` | Mengambil daftar ulasan pelanggan publik dengan rating bintang | Publik |
| `POST` | `/reviews` | Mengirimkan ulasan hidangan baru (rating 1-5 bintang & unggah foto masakan) | User Token |
| `PATCH` | `/admin/reviews/{id}/visibility` | Mengatur status tayang ulasan di halaman publik (moderasi) | Admin |
| `POST` | `/admin/reviews/{id}/reply` | Mengirimkan balasan resmi dapur/resto pada ulasan pelanggan | Admin |

---

### 2.7 Layanan Pelanggan (CS Live Chat API)
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/chat/messages` | Mengambil riwayat percakapan pengguna dengan admin | User Token |
| `POST` | `/chat/send` | Mengirim pesan obrolan teks baru atau lampiran foto | User / Admin |
| `GET` | `/admin/chat/threads` | Mengambil daftar seluruh percakapan pelanggan yang aktif | Admin |
| `PATCH` | `/chat/read` | Menandai seluruh pesan dalam percakapan sebagai telah dibaca | User / Admin |

---

### 2.8 Pengaturan Restoran & Central Kitchen GPS (Settings API)
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/settings/store` | Mengambil data pengaturan toko, koordinat dapur pusat, dan status jam sibuk | Publik |
| `PUT` | `/admin/settings/store` | Memperbarui nama resto, kontak darurat, dan koordinat lintang/bujur Central Kitchen | Admin |
| `PUT` | `/admin/settings/map-provider` | Mengubah provider peta aktif (`openstreetmap` atau `google_maps`) dan API key | Admin |
| `PATCH` | `/admin/settings/high-demand` | Mengaktifkan/menonaktifkan mode lonjakan pesanan resto membludak | Admin |

---

### 2.9 Integrasi Pembayaran Midtrans Snap
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `POST` | `/midtrans/create-snap-token` | Membuat Snap Payment Token unik dari rincian belanja, ongkir, dan data pemesan | Publik / User |
| `POST` | `/midtrans/notification` | Webhook HTTP POST dari server Midtrans untuk verifikasi status lunas (*settlement*) | Webhook Server |

---

## 3. Spesifikasi WebSocket & Event Telemetri (Laravel Reverb)

Platform Nefakky terhubung ke WebSocket server untuk menyebarkan pembaruan data instan tanpa perlu polling HTTP berulang:

### 3.1 Kanal Publik `orders`
* **Event `OrderPlaced`**: Ditembakkan ketika pesanan baru selesai dibuat.
* **Event `OrderStatusUpdated`**: Ditembakkan saat staf dapur memperbarui tahapan memasak atau kurir mengunggah bukti serah terima.

### 3.2 Kanal Privat `chat.{userEmail}`
* **Event `ChatMessageSent`**: Menyalurkan pesan baru secara instan antara pelanggan dan admin CS Live Desk.

### 3.3 Kanal Publik `products`
* **Event `ProductStockChanged`**: Memberitahu seluruh katalog secara langsung ketika menu hidangan berubah menjadi *Sold-Out*.

---

## 4. Next.js Integrated Server API Routes (Zero-Latency Realtime Bridge)

Selain backend eksternal, aplikasi web Nefakky dilengkapi dengan Next.js Server Route Handlers terintegrasi yang menjamin persistensi server lokal dan sinkronisasi lintas-jendela (termasuk mode Penyamaran / Incognito, multi-device, dan browser berbeda) secara realtime tanpa ketergantungan aturan keamanan klien Firebase atau server Laravel Reverb yang sedang offline.

### 4.1 Endpoint Pesanan Terpusat: `/api/orders`
* **File Rute**: `src/app/api/orders/route.ts`
* **Penyimpanan Berkas**: `.orders_store.json` (root proyek) dengan In-Memory Caching berkinerja tinggi.
* **Header Respons**: `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`

#### A. Mengambil Daftar Seluruh Pesanan (GET)
* **Method**: `GET /api/orders`
* **Akses**: Publik / Admin
* **Format Respons**:
```json
{
  "success": true,
  "orders": [
    {
      "id": "NFK-890783",
      "customerName": "anonim1",
      "customerEmail": "anonim1@gmail.com",
      "userId": "KlOg1Aep9TbKmHy9YatgW3C5thm1",
      "avatar": "https://ui-avatars.com/api/?name=anonim1",
      "address": "Susukan, Bojong Gede, Bogor, Jawa Barat, 16929",
      "phone": "0856838642",
      "items": [
        { "id": "m1", "name": "Ayam Bakar", "price": 35000, "quantity": 1, "image": "/images/ayam_bakar.jpg" },
        { "id": "m2", "name": "Nasi Bakar", "price": 10000, "quantity": 1, "image": "/images/nasi_bakar.jpg" },
        { "id": "m6_Mangga", "name": "Jus Mangga Segar", "price": 5000, "quantity": 1, "image": "/images/jus_mangga.jpg" }
      ],
      "itemCount": 3,
      "paymentMethod": "Virtual Account BCA (Midtrans)",
      "paymentBadge": "PAID",
      "deliveryType": "KURIR NEFAKKY",
      "distance": "3.1 Km",
      "status": "RECEIVED",
      "subtotal": 50000,
      "shippingCost": 10000,
      "discount": 5000,
      "total": 55000,
      "voucherCode": "NEFAKKY10",
      "appliedPromo": "NEFAKKY10",
      "date": "Minggu, 27 Sep 2026 • 19:41:18 WIB",
      "createdAt": 1790512878381,
      "customerConfirmed": false,
      "updatedAt": 1790512878381
    }
  ]
}
```

#### B. Operasi Manipulasi Pesanan (POST)
Endpoint menerima parameter `action` pada request body JSON:

| Aksi (`action`) | Parameter Wajib | Deskripsi |
| :--- | :--- | :--- |
| `create` / `add` | `order: AdminOrder` | Menambahkan pesanan baru hasil checkout (Midtrans atau COD) ke posisi paling atas daftar. |
| `update_status` | `orderId: string`, `status?: string`, `updates?: object` | Memperbarui tahapan status pemrosesan dapur 5-tahap (`COOKING`, `READY`, `DELIVERING`, `COMPLETED`), catatan waktu konfirmasi, atau lunas (`paymentBadge: 'PAID'`). |
| `proof_photo` | `orderId: string`, `proofPhotoUrl` / `proofPhoto`, `paymentProofPhotoUrl` / `paymentProofPhoto` | Menyimpan URL / data gambar bukti foto pengantaran kurir atau bukti bayar tunai COD. |
| `delete` | `orderId: string` | Menghapus tiket pesanan dari store permanen. |
| `cancel` | `orderId: string`, `reason?: string` | Membatalkan pesanan, mengatur status `CANCELLED`, dan menandai pengembalian dana jika sudah dibayar. |
| `sync` | `orders: AdminOrder[]` | Melakukan merge sinkronisasi bulk antara data lokal klien dengan data server menggunakan algoritma LWW (*Last-Write-Wins*). |

---

### 4.2 Endpoint Live Chat CS Terpusat: `/api/chat`
* **File Rute**: `src/app/api/chat/route.ts`
* **Penyimpanan Berkas**: `.chat_store.json` (root proyek) dengan In-Memory Caching.
* **Kebijakan Percakapan**: **100% Manual Human Agent Response** (seluruh pesan otomatis/bot ditiadakan sehingga admin menjawab setiap pertanyaan secara manual dan personal).

#### A. Mengambil Riwayat Percakapan (GET)
* **Method**: `GET /api/chat`
* **Respons**: `{ "success": true, "messages": ChatMessage[] }`

#### B. Mengirim & Mengelola Pesan Chat (POST)
* **`action: "send"`**:
  - Request Body: `{ "action": "send", "message": { "id", "sender": "user"|"admin", "text", "timestamp", "userName", "userEmail", "readByAdmin", "readByUser" } }`
  - Menyimpan pesan ke `.chat_store.json` dan memicu alert realtime.
* **`action: "mark_read_admin"`**:
  - Menandai seluruh pesan dari `userEmail` tertentu sebagai telah dibaca oleh staf admin (`readByAdmin: true`).
* **`action: "mark_read_user"`**:
  - Menandai balasan staf admin sebagai telah dibaca oleh pengguna (`readByUser: true`).
* **`action: "sync"`**:
  - Sinkronisasi riwayat pesan lokal klien ke server store.

---

### 4.3 Spesifikasi Sinkronisasi Realtime di Klien (DataContext Engine)
Untuk mengatasi partisi peramban pada Mode Penyamaran (Incognito) di mana `localStorage` dan `BroadcastChannel` diisolasi oleh Chromium:
1. **Background Polling 1500ms**: `DataContext.tsx` menjalankan interval polling setiap 1.5 detik ke `/api/orders` dan `/api/chat`.
2. **Listener `visibilitychange`**: Saat pengguna atau admin kembali membuka tab aktif (`document.visibilityState === 'visible'`), sinkronisasi instan segera dipicu.
3. **Optimistic Local Update + Server Dispatch**: Setiap mutasi langsung tercermin di UI seketika (0ms), lalu didorong ke server store untuk konsumsi tab/sesi lainnya.
4. **Web Audio API Synth Alert**: Saat pesanan baru masuk ke antrean Kitchen Desk, AdminLayout membunyikan audio chime segitiga harmonik (C5-E5-G5-C6) dan memunculkan floating alert toast interaktif.
