# Alur Kerja Bisnis & Operasional (WORKFLOW.md) — Nefakky Marketplace

**Versi Dokumen**: 4.8.0 (Updated September 2026 — 5-Stage Kitchen POS, Centralized Orders API Realtime Sync, Manual CS Live Desk, & Hardware Audio Telemetry)  
**Target Modul**: Alur Hidup Pesanan (Order Lifecycle), State Machine 5-Tahap Dapur, Webhook Gateway Pembayaran Midtrans, Server API Realtime Bridge, Live Camera Snapshot Capture, dan Tutup Buku Tahunan.  
**Penulis**: Tim Pengembang Nefakky (Fatih Ahmad Zakky)  

---

## 1. Alur Transaksi & State Machine Pesanan 5-Tahap

Setiap transaksi pesanan makanan di Nefakky melalui mesin status (*State Machine*) terstruktur yang menjamin keteraturan operasional dapur dan transparansi pelacakan bagi pelanggan.

```mermaid
stateDiagram-v2
    [*] --> RECEIVED : Checkout Pelanggan (Stok Dikurangi)
    
    RECEIVED --> PREPARING : Staf Dapur Tekan "Mulai Masak"
    RECEIVED --> CANCELLED : Dibatalkan Pelanggan/Dapur (Stok Dipulihkan)
    
    PREPARING --> READY : Koki Tekan "Makanan Siap & Dikemas"
    PREPARING --> CANCELLED : Dibatalkan Darurat
    
    READY --> DELIVERING : Kurir Ambil Makanan & Upload Bukti POD
    
    DELIVERING --> DELIVERED : Kurir / Pelanggan Konfirmasi Tiba
    
    DELIVERED --> COMPLETED : Verifikasi Pelunasan Kasir COD / Midtrans Settlement
    
    COMPLETED --> [*] : Transaksi Selesai & Masuk Buku Besar
    CANCELLED --> [*] : Transaksi Batal (Audit Log Tercatat)
```

---

## 2. Rincian 5 Tahapan Alur Kerja Dapur

### Tahap 1: `RECEIVED` (Pesanan Masuk & Diterima Dapur)
* **Pemicu**: Pelanggan menekan tombol "Bayar Sekarang" (Midtrans) atau "Konfirmasi Pesanan" (COD) di halaman `/cart`.
* **Proses Sistem**:
  1. Validasi ketersediaan stok setiap item menu (`stock >= quantity`).
  2. Mengurangi kuantitas stok produk secara atomik di state global dan database.
  3. Menerbitkan nomor order unik (format: `#NFK-XXXXXX` atau `ORD-XXXXXX`).
  4. **Direct Server Store Push**: Tiket pesanan langsung dikirimkan melalui HTTP POST ke `/api/orders` dan dicatat ke dalam berkas `.orders_store.json`.
  5. **Cross-Incognito Background Synchronizer**: Interval sinkronisasi 1500ms dan listener `visibilitychange` di `DataContext.tsx` memastikan panel admin di browser/jendela lain langsung menerima pesanan tanpa perlu refresh halaman.
  6. **Hardware Audio Synthesizer**: Web Audio API membunyikan audio chime lonceng dapur 4-akord (C5-E5-G5-C6) di browser admin.
  7. **Floating Alert Toast**: Muncul banner notifikasi hijau mengambang di pojok kanan bawah admin (`⚡ Pesanan Baru Diterima: [Nama Pelanggan] ([ID Pesanan])`) dengan tombol aksi 1-klik *"Buka Kitchen Desk"*.
  8. **Inkrementasi Counter Otomatis**: Badge indikator "Hari Ini" dan kartu metrik "Pesanan Masuk" bertambah secara instan.

### Tahap 2: `PREPARING` (Sedang Dimasak Koki)
* **Pemicu**: Staf dapur menekan tombol aksi **"Mulai Masak"** di [AdminOrdersTab.tsx](file:///f:/UKK/nefakky3/src/components/admin/AdminOrdersTab.tsx).
* **Proses Sistem**:
  1. Status pesanan diperbarui menjadi `PREPARING`.
  2. Mengaktifkan durasi waktu memasak standar (~30 menit) atau mode lonjakan (*High Demand*) (~45 menit).
  3. Layar pelacakan pelanggan (`/notifications`) menampilkan animasi wajan masak `CookingPot` kustom dan estimasi menit hidangan matang.

### Tahap 3: `READY` (Makanan Siap & Dikemas Rapi)
* **Pemicu**: Koki menyelesaikan hidangan dan menekan tombol **"Makanan Siap"**.
* **Proses Sistem**:
  1. Status diperbarui menjadi `READY`.
  2. Masakan dibungkus dengan kemasan higienis berstempel segel sanitasi.
  3. Mengirimkan sinyal kesiapan paket ke kurir pengantar.

### Tahap 4: `DELIVERING` (Dalam Perjalanan Kurir)
* **Pemicu**: Kurir mengambil paket pesanan dan admin/kurir menekan tombol **"Kirim Kurir"**.
* **Proses Sistem**:
  1. Mengaktifkan fitur **Live Camera Capture** (`LiveCameraModal.tsx`) untuk mengambil foto kurir membawa paket hidangan.
  2. Foto disimpan sebagai bukti serah terima paket (*Proof-of-Delivery / POD*).
  3. Pelanggan melihat status kurir sedang meluncur menuju koordinat alamat tujuan.

### Tahap 5: `DELIVERED` & `COMPLETED` (Tiba di Lokasi & Transaksi Selesai)
* **Pemicu**: Pelanggan menekan tombol *"Konfirmasi Pesanan Diterima"* di aplikasi atau kurir menyelesaikan pengantaran.
* **Proses Sistem**:
  1. Pelanggan dapat mengunggah foto makanan yang sampai dan memberikan skor ulasan 1-5 bintang emas.
  2. Untuk transaksi tunai (COD), kurir menyetorkan uang fisik ke kasir resto, dan status diubah menjadi `COMPLETED`.
  3. Transaksi dicatat ke dalam buku besar omset dan grafik pendapatan bulanan.

---

## 3. Alur Verifikasi Pembayaran Digital Midtrans Snap

```mermaid
sequenceDiagram
    autonumber
    actor C as Pelanggan
    participant F as Frontend (Next.js)
    participant B as Backend API
    participant M as Midtrans Gateway

    C->>F: Pilih Pembayaran Digital (QRIS / VA / E-Wallet)
    F->>B: POST /api/midtrans/create-snap-token
    B->>M: Request Snap Token (Gross Amount, Customer Details)
    M-->>B: Snap Token & Redirect URL
    B-->>F: Return Snap Token
    F->>M: Buka Modal Snap Popup (window.snap.pay)
    C->>M: Selesaikan Pembayaran di Aplikasi Bank / E-Wallet
    M-->>F: Callback onPending / onSuccess
    M->>B: HTTP POST Webhook /api/midtrans/notification
    Note over B: Verifikasi Signature Key SHA512
    B->>B: Update payment_status = settlement
    B->>F: WebSocket Broadcast (OrderStatusUpdated)
    F-->>C: Notifikasi "Pembayaran Berhasil Diverifikasi!"
```

---

## 4. Protokol Darurat Lonjakan Pesanan (High Demand Surge Protocol)

Ketika dapur mengalami lonjakan pesanan ekstrem (misal: jam makan siang kantor atau bazar kuliner weekend):
1. Admin mengaktifkan saklar **"Mode Resto Membludak (High Demand)"** di [AdminSettingsTab.tsx](file:///f:/UKK/nefakky3/src/components/admin/AdminSettingsTab.tsx).
2. Sistem secara global:
   - Menambahkan durasi memasak otomatis (+15 menit).
   - Menampilkan banner peringatan darurat bernuansa amber di beranda dan keranjang belanja pelanggan: *"Dapur saat ini sedang melayani pesanan padat. Waktu memasak bertambah ~15 menit untuk menjaga kualitas rasa terbaik."*
   - Memperbarui estimasi stepper pelacakan dari ~30m menjadi ~45m.
3. Setelah antrean dapur kembali terkendali, admin mematikan saklar dan sistem kembali ke waktu normal secara instan.

---

## 5. Alur Sensor Tutup Buku & Arsip Tahunan Otomatis

1. Komponen `annualArchive.ts` membaca waktu kalender nyata sistem.
2. Ketika tahun berganti (misal: dari 2026 ke 2027):
   - Sistem secara otomatis mengunci seluruh rekapitulasi data pesanan tahun 2026.
   - Membuat rekaman arsip permanen `AnnualArchiveRecord` yang berisi ringkasan omset bulanan (Jan–Des).
   - Menyediakan tombol 1-klik untuk mengunduh laporan pembukuan resmi dalam format **Excel Spreadsheet** dan **PDF Akuntansi Resmi**.

---

## 6. Alur Layanan Pelanggan (CS Live Desk 100% Manual Response)

Nefakky menjunjung tinggi sentuhan keramahan kuliner otentik Indonesia dengan meniadakan jawaban otomatis bot (*No Automated Bots*):

1. **Pengiriman Pesan Pelanggan**:
   - Pelanggan mengetikkan pertanyaan melalui widget floating chat di sudut bawah layar.
   - Pesan dikirim ke `/api/chat` (`action: "send"`) dan disimpan ke `.chat_store.json`.
2. **Alert Staf Admin Realtime**:
   - Web Audio API di browser admin membunyikan audio chime sinus lembut (D5 -> A5).
   - Muncul floating notification toast di panel admin dengan cuplikan teks pesan dan tombol *"Balas Chat Sekarang"*.
   - Badge merah di sidebar navigasi admin pada menu **CS Live Desk** menampilkan jumlah pesan belum dibaca.
3. **Respon Manual Personal oleh Admin**:
   - Staf admin membuka utas percakapan dan mengetikkan balasan secara manual dan penuh perhatian.
   - Balasan diposting ke `/api/chat` dan otomatis diterima di jendela browser pelanggan dalam waktu $\le 1.5$ detik tanpa perlu refresh.

---

## 7. Alur Sanitasi & Klaim Voucher Diskon

1. **Normalisasi Kode Input**:
   - Kode kupon yang dimasukkan pelanggan (misal: `#nefakky10` atau ` NEFAKKY10 `) disanitasi secara otomatis oleh `cleanPromoCode` menjadi `NEFAKKY10`.
2. **Validasi Kuota & Minimal Belanja**:
   - Sistem memverifikasi syarat minimal belanja (`minSpend`) dan memastikan pengguna belum pernah mengklaim voucher khusus pengguna baru jika sudah pernah berbelanja.
3. **Klaim Permanen & Auto-Reset Mingguan**:
   - Saat checkout berhasil, ID pengguna dan email dicatat ke dalam daftar pemakai voucher (`claimVoucherRedemption`).
   - Setiap awal pekan ISO baru (Senin dini hari), rekaman voucher mingguan direset otomatis (`nefakky_used_vouchers_week`) sehingga voucher promosi berkala dapat kembali digunakan.
