# Product Requirement Document (PRD) — Nefakky Marketplace

**Nama Produk**: Nefakky - Artisanal Food & Culinary Marketplace  
**Versi**: 3.5.0 (Enterprise Architecture: Laravel 12 REST Backend, Next.js 14 App Router, Google Stitch AI UI System, Midtrans Sandbox Payment Gateway & Simulator Polling, Dual Firebase Architecture, Live Camera Studio & Storybook Suite)  
**Tanggal Terakhir Diperbarui**: 22 Agustus 2026  
**Status**: Production Standard (100% Passed Test Suite)  
**Penulis / Team**: Tim Pengembang Nefakky (Fatih Ahmad Zakky) & Google Stitch AI Design System  

---

## 1. Ringkasan Eksekutif & Visi Produk

### 1.1 Visi Produk
**Nefakky** adalah platform *artisanal e-commerce* dan marketplace kuliner premium berteknologi modern yang menghubungkan penikmat kuliner (*epicureans*) dengan hidangan tradisional khas Nusantara berkualitas tinggi. Platform ini menggabungkan pengalaman belanja digital yang hangat, estetik, dan responsif dengan integrasi gerbang pembayaran *real-time* (**Midtrans Core API & Snap Engine** dengan integrasi resmi Midtrans Sandbox Simulator), sistem kalkulasi ongkos kirim berbasis jarak (**Distance-Based Shipping Engine**), pemetaan armada kurir visual (**Animated SVG Live Courier Fleet Map**), modul pengambilan foto 3 arah (**3-Way Photo Studio Picker: Galeri, Kamera Langsung, Google SSO**), arsitektur ganda database awan *real-time* (**Firebase Cloud Firestore DB & Firebase Realtime Database `asia-southeast1`**), backend berkinerja tinggi (**Laravel 12 REST API Engine**), serta sistem pengelolaan operasional toko terpadu (**Enterprise Admin Command Center**).

### 1.2 Tujuan Utama & Value Proposition
* **Direct-to-Consumer (D2C) Premium**: Menyediakan pemesanan hidangan khas langsung dari dapur Nefakky tanpa perantara komisi yang memotong margin usaha.
* **Alamat Produksi Resmi**: Seluruh produk diproduksi secara otentik di lokasi terpusat: *Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Provinsi Jawa Barat, Indonesia*.
* **Midtrans Sandbox Simulator & Live Status Polling**: Mengintegrasikan API Midtrans resmi (`MIDTRANS_SERVER_KEY` & `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`) untuk menghasilkan Virtual Account (BCA/BNI/BRI/Permata), Mandiri Bill, dan QRIS secara riil. Aplikasi menyediakan tautan 1-klik ke [Midtrans Payment Simulator](https://simulator.sandbox.midtrans.com/bca/va/index), melakukan *background polling* otomatis setiap 2,5 detik, dan memicu notifikasi sukses instan saat pelunasan terjadi.
* **Formula Ongkos Kirim Berbasis Jarak**:
  $$\text{Ongkir} = \begin{cases} \text{Rp } 10.000 & \text{jika } \text{jarak} \le 10\text{ km} \\ \text{Rp } 10.000 + \lceil\frac{\text{jarak} - 10}{2}\rceil \times \text{Rp } 2.500 & \text{jika } \text{jarak} > 10\text{ km} \end{cases}$$
* **Pelacakan 5-Tahap & Konfirmasi Pelanggan**: Alur status pesanan terstruktur (`1. Diterima` $\rightarrow$ `2. Dimasak` $\rightarrow$ `3. Menunggu Kurir` $\rightarrow$ `4. Dalam Perjalanan` $\rightarrow$ `5. Selesai`). Pelanggan wajib mengonfirmasi kedatangan pesanan melalui kartu **"✅ Konfirmasi Pesanan Telah Sampai (Tiba Tepat Waktu)"** yang seketika memberitahu admin dan kurir.
* **Kewajiban Bukti Antar Kurir**: Kurir pengantar (*"Karyawan Nefakky"*) wajib mengirimkan bukti foto pesanan telah tiba via WhatsApp (ditambah bukti penerimaan uang tunai jika transaksi menggunakan Cash on Delivery / COD).
* **Riwayat Pesanan Realtime (Newest-First)**: Daftar riwayat pesanan disortir dari yang paling baru ke yang paling lama dan terhubung langsung secara *live* dengan Firestore `onSnapshot`.
* **3-Way Photo Studio Picker**: Pengguna dapat mengubah foto profil melalui unggah galeri, jepretan kamera langsung (*webcam video stream & canvas snapshot*), atau sinkronisasi otomatis avatar Google SSO.
* **Siklus Data Profil & Alamat**: Pengguna baru yang mendaftar via form memiliki nomor telepon terisi; login via Google membiarkan nomor telepon kosong sampai diisi. Alamat dimulai dari kosong dan otomatis terisi di profil saat pengguna memasukkan alamat pada proses checkout pertama.
* **Enterprise Admin Command Center**: Dashboard pengelolaan pesanan dapur, visualisasi grafik omset interaktif SVG (dimulai dari Juni 2026 >10 Juta), pencatatan omset manual bazar/offline multi-item, dan ekspor laporan ke Excel (.xls), CSV, serta PDF.

---

## 2. Target Pengguna & Personas

### 2.1 Pelanggan (*Customer / Consumer*)
* **Profil**: Penikmat kuliner tradisional, pekerja kantoran, keluarga, atau mahasiswa yang membutuhkan pemesanan makanan berkualitas tinggi secara daring.
* **Kebutuhan Utama**:
  * Katalog menu interaktif dengan 3 kategori (*Makanan Berat*, *Minuman*, *Menu Hemat*) dan modal pemilihan 3 varian jus (Mangga, Sirsak, Jambu) dalam 1 tampilan.
  * Checkout 4-tahap dengan kalkulasi ongkos kirim berbasis jarak yang transparan dan akurat.
  * Pembayaran online via Midtrans Sandbox dengan nomor Virtual Account / QRIS riil, tombol salin instan, dan tautan langsung ke simulator Midtrans.
  * Pilihan transaksi Cash on Delivery (COD) tanpa pembayaran online awal.
  * Pelacakan live status 5-tahap dan visualisasi pergerakan kurir pada peta animasi SVG.
  * Tombol konfirmasi penerimaan barang dan cetak nota resmi PDF.
  * Pengaturan profil fleksibel dengan 3 pilihan foto profil (Galeri, Kamera, Google).

### 2.2 Administrator & Staf Operasional (*Admin & Kitchen*)
* **Profil**: Pemilik usaha (*Fatih Ahmad Zakky*) dan kurir dapur (*Karyawan Nefakky*).
* **Kebutuhan Utama**:
  * Dashboard analitik bisnis riil (Omset Kotor, Laba Bersih 40%, Total Pesanan, AOV).
  * Pengelolaan alur pesanan dapur 5-tahap dengan tombol pembaruan status 1-klik.
  * Notifikasi instan saat pelanggan mengonfirmasi penerimaan barang tepat waktu.
  * Verifikasi bukti foto makanan dan bukti uang tunai COD dari kurir via WhatsApp.
  * Editor grafik omset bulanan SVG dan modal input omset manual untuk bazar offline.
  * Ekspor laporan keuangan ke format Excel (.xls) berstandar korporat dan PDF.

---

## 3. Spesifikasi Kebutuhan Fungsional (Functional Requirements)

### 3.1 Modul Pembayaran Digital Midtrans Sandbox (`/cart` & `/api/midtrans/*`)
* **FR-PAY-01**: Sistem harus menyediakan metode pembayaran: *Virtual Account BCA, Virtual Account Mandiri, Virtual Account BNI, QRIS Instant, E-Wallet (GoPay/ShopeePay), Kartu Kredit*, dan *Cash on Delivery (COD)*.
* **FR-PAY-02**: Endpoint `POST /api/midtrans/charge` harus memanggil Midtrans Sandbox Core API menggunakan `MIDTRANS_SERVER_KEY` dan menghasilkan nomor VA / kode transaksi riil.
* **FR-PAY-03**: Sistem harus menampilkan modal konsol pembayaran interaktif yang memuat:
  - Nomor Virtual Account / QRIS string.
  - Tombol 1-klik untuk menyalin kode ke clipboard.
  - Tombol eksternal **"🌐 Buka Midtrans Payment Simulator ↗"** yang mengarahkan ke `https://simulator.sandbox.midtrans.com/bca/va/index` di tab baru.
* **FR-PAY-04**: Sistem harus melakukan polling otomatis ke `GET /api/midtrans/status?orderId={orderId}` setiap 2.500 ms di latar belakang.
* **FR-PAY-05**: Ketika status transaksi berubah menjadi `settlement` atau `capture`, sistem harus seketika:
  - Menutup modal pembayaran dan menghentikan polling.
  - Menampilkan pop-up dialog perayaan **"🎉 Pembayaran Berhasil!"**.
  - Menyimpan pesanan ke database dengan badge `PAID` dan status `RECEIVED`.
  - Mengosongkan keranjang belanja dan mengarahkan pengguna ke langkah Sukses / Pelacakan Pesanan.
* **FR-PAY-06**: Transaksi COD harus langsung dibuat tanpa memanggil API pembayaran online, dengan status badge `AWAITING` (Menunggu Pembayaran).

### 3.2 Modul Formula Ongkos Kirim Berdasarkan Jarak
* **FR-SHP-01**: Ongkos kirim dihitung berdasarkan jarak kurir pengantaran dengan rumus:
  - Jarak $\le 10$ km: Flat **Rp 10.000**.
  - Jarak $> 10$ km: **Rp 10.000 + $\lceil(\text{jarak} - 10)/2\rceil \times \text{Rp } 2.500$**.
* **FR-SHP-02**: Rincian biaya pada Keranjang, Checkout, Pembayaran, Pelacakan Pesanan, dan Struk Nota harus 100% identik dan transparan tanpa ada biaya tersembunyi.
* **FR-SHP-03**: Semua label `(EXPRESS)` dihapus dan disatukan menjadi layanan pengantaran resmi **"Kurir Nefakky"**.

### 3.3 Modul Pelacakan Pesanan & Verifikasi Pengiriman (`/notifications`)
* **FR-TRK-01**: Halaman pelacakan pesanan harus menggunakan layout 2-kolom responsif:
  - Kolom Kiri (`lg:col-span-7`): Header estimasi waktu, stepper 5-tahap vertikal dengan timestamp riil, dan kartu konfirmasi pelanggan.
  - Kolom Kanan (`lg:col-span-5`): Peta animasi SVG kurir bergerak, badge nama kurir (*"Karyawan Nefakky"*), dan rincian pesanan.
* **FR-TRK-02**: Stepper 5-Tahap mencakup:
  1. *Pesanan Diterima* (`RECEIVED`)
  2. *Sedang Dimasak* (`COOKING`)
  3. *Menunggu Kurir* (`READY`)
  4. *Dalam Perjalanan* (`SHIPPING` / `ON_DELIVERY`)
  5. *Pesanan Selesai* (`COMPLETED` / `DELIVERED`)
* **FR-TRK-03**: Ketika admin menetapkan status pesanan telah diantar ke pelanggan, pelanggan wajib menekan tombol **"✅ Konfirmasi Pesanan Telah Sampai (Tiba Tepat Waktu)"**.
* **FR-TRK-04**: Konfirmasi pelanggan seketika menghentikan animasi kurir di tujuan, menandai pesanan sebagai `COMPLETED`, dan memunculkan notifikasi realtime di dashboard admin.
* **FR-TRK-05**: Kurir pengantar (*"Karyawan Nefakky"*) wajib mengirimkan bukti pengiriman via WhatsApp:
  - Bukti foto hidangan telah tiba (Wajib untuk semua metode pembayaran).
  - Bukti penerimaan uang tunai (Wajib khusus metode pembayaran Cash on Delivery / COD).

### 3.4 Modul Riwayat Pesanan Realtime (Newest-First)
* **FR-HIST-01**: Riwayat pesanan di bagian bawah halaman pelacakan harus diurutkan dari yang paling baru ke yang paling lama berdasarkan timestamp transaksi.
* **FR-HIST-02**: Mengklik kartu riwayat mana pun akan otomatis memuat dan menampilkan rincian pesanan tersebut pada Live Tracker di bagian atas halaman.
* **FR-HIST-03**: Setiap kartu riwayat memiliki tombol **"Struk"** untuk membuka modal nota digital resmi siap cetak via `window.print()`.

### 3.5 Modul Profil Pengguna & 3-Way Photo Studio (`/profile`)
* **FR-PRF-01**: Pengguna dapat memperbarui foto profil melalui 3 cara:
  1. *Galeri*: Unggah file gambar lokal.
  2. *Ambil Foto Sendiri*: Live webcam snapshot via WebRTC stream dan canvas capture.
  3. *Google SSO*: Sinkronisasi otomatis avatar akun Google.
* **FR-PRF-02**: Pengguna baru yang mendaftar via email/password memiliki nomor telepon terisi; registrasi/login via Google membiarkan nomor telepon kosong sampai pengguna mengisinya.
* **FR-PRF-03**: Alamat dimulai dari kosong untuk pengguna baru. Saat pengguna memasukkan alamat pada transaksi checkout pertama, alamat tersebut otomatis tersimpan ke daftar alamat profil sebagai alamat default.

---

## 4. Arsitektur Data & Model Database

### 4.1 Entitas Pesanan (`orders` di Firestore & RTDB)
```typescript
export interface AdminOrder {
  id: string;                      // Contoh: "ORD-9281" atau "NFK-892102"
  userId?: string;                 // UID Pengguna terautentikasi
  customerName: string;            // Nama lengkap pelanggan
  customerEmail: string;           // Alamat email pelanggan
  avatar?: string;                 // URL foto profil pelanggan
  address: string;                 // Alamat pengantaran lengkap
  phone: string;                   // Nomor WhatsApp / Telepon aktif
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    variant?: string;              // Rasa jus khusus m6 (Mangga/Sirsak/Jambu)
  }>;
  itemCount: number;               // Total porsi makanan
  paymentMethod: string;           // "Virtual Account BCA", "QRIS", "Cash on Delivery (COD)"
  paymentBadge: 'PAID' | 'AWAITING'; // Status pelunasan
  deliveryType: string;            // "KURIR NEFAKKY"
  distance?: string;               // Estimasi jarak pengantaran (misal: "4.2 Km")
  status: 'RECEIVED' | 'COOKING' | 'READY' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  subtotal: number;                // Subtotal harga menu
  shippingCost: number;            // Ongkos kirim berbasis jarak
  discount: number;                // Potongan diskon voucher promo
  total: number;                   // Total nominal yang harus dibayar
  voucherCode?: string;            // Kode kupon promo terpakai
  customerConfirmed?: boolean;     // Penanda konfirmasi penerimaan dari pelanggan
  confirmedAt?: string;            // Waktu konfirmasi (misal: "Hari ini, 13:05")
  date: string;                    // Waktu pesanan dibuat
  createdAt?: number;              // Timestamp milidetik untuk pengurutan Newest-First
}
```

---

## 5. Kebutuhan Non-Fungsional & Keamanan (Non-Functional Requirements)

1. **Keamanan & Kredensial**:
   - `MIDTRANS_SERVER_KEY` tersimpan aman di environment server (`.env.local`) dan tidak pernah dikirimkan ke client-side.
   - Menggunakan sanitasi payload Firestore (`cleanForFirestore`) untuk mencegah penyimpanan nilai `undefined`.
2. **Kinerja & Skalabilitas**:
   - Polling status Midtrans dihentikan segera setelah pembayaran terverifikasi untuk menghemat sumber daya jaringan.
   - Waktu respons API charge dan status Midtrans $< 300$ ms.
3. **Kualitas Kode & Testing**:
   - 100% lolos pengecekan tipe TypeScript (`npx tsc --noEmit` $\rightarrow$ 0 error).
   - 100% lolos seluruh suite pengujian otomatis (`npm test` $\rightarrow$ 6/6 PASS).
