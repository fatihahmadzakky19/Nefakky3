# Status Backend Django (NONAKTIF / DISABLED) — Nefakky Architecture

> [!NOTE]
> Modul backend **Django 5 (Python)** di folder `backend_django/` saat ini berstatus **NONAKTIF (DISABLED / REFERENCE ONLY)** sesuai keputusan arsitektur final proyek Nefakky.
> 
> **Backend Produksi Aktif Utama**:
> - **Framework & Versi**: **Laravel 12 (PHP 8.2+)**
> - **Realtime Engine**: **Laravel Reverb WebSockets** (`ws://localhost:8080`)
> - **Base REST API URL**: `http://localhost:8000/api`
> - **Client Connector Frontend**: [`src/lib/laravelApi.ts`](file:///f:/UKK/nefakky3/src/lib/laravelApi.ts)
> - **Standar Otentikasi**: Laravel Sanctum Token & Firebase ID Token
> - **Database**: SQLite / MySQL terpadu dengan Dual-Sync Google Firebase Firestore
> 
> Seluruh alur data bisnis berikut diproses secara eksklusif oleh **Laravel 12 API & Firebase**:
> 1. CRUD Katalog Menu & Saklar Ketersediaan Stok (*In-Stock / Sold-Out*).
> 2. Alur Transaksi Pesanan Dapur 5-Tahap (`RECEIVED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `DELIVERING` $\rightarrow$ `DELIVERED` / `COMPLETED`).
> 3. Mesin Validasi Voucher Promo & Diskon Bertingkat.
> 4. Moderasi Ulasan Komunitas & Rating Bintang Emas.
> 5. Kalkulator Jarak Haversine & Ongkir Otomatis dari Dapur Pusat.
> 6. Pembayaran Digital Midtrans Snap Gateway & Webhook Signature Verification.
> 7. CS Live Desk Chat & Broadcast Telemetri Dapur via Reverb WebSocket.
