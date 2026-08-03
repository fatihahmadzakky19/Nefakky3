# Product Requirement Document (PRD) — Nefakky

**Nama Produk**: Nefakky - Artisanal Food & Culinary Marketplace  
**Versi**: 1.1.0  
**Tanggal Terakhir Diperbarui**: 3 Agustus 2026  
**Status**: Production / Live  
**Penulis / Team**: Tim Pengembang Nefakky (Fatih Ahmad Zakky)  

---

## 1. Ringkasan Eksekutif & Visi Produk

### 1.1 Visi Produk
**Nefakky** adalah platform e-commerce dan *kuliner premium* berteknologi tinggi yang dirancang untuk menghubungkan penikmat kuliner (*epicureans*) dengan hidangan otentik berkualitas tinggi. Platform ini menggabungkan pengalaman belanja digital yang elegan, intuitif, cepat, serta didukung oleh sistem transaksi aman (*Midtrans Payment Gateway*) dan manajemen operasional *real-time*.

### 1.2 Tujuan Bisnis
* **Transformasi Digital Toko**: Menyediakan kanal pemesanan langsung (*Direct-to-Consumer*) yang seamless tanpa ketergantungan penuh pada platform agregator pihak ketiga.
* **Pengalaman Pengguna Tanpa Hambatan**: Menghadirkan proses dari pemilihan menu hingga pembayaran (*checkout*) dalam waktu kurang dari 2 menit.
* **Transparansi Transaksi**: Menyediakan sistem pelacakan status pesanan secara transparan (*Pending*, *Cooking*, *Shipping*, *Completed*) serta fitur ulasan asli pelanggan.
* **Keamanan & Sinkronisasi Real-time**: Menjamin integritas data akun pengguna, validasi status sesi secara *real-time* dengan Firebase Authentication, serta pembersihan sesi otomatis apabila akun dihapus atau dinonaktifkan.

---

## 2. Target Pengguna (User Personas)

### 2.1 Pelanggan (*Customer / Consumer*)
* **Profil**: Penikmat kuliner, pekerja kantoran, keluarga, atau mahasiswa yang membutuhkan pemesanan makanan premium secara online dengan jaminan kualitas dan pengiriman cepat.
* **Kebutuhan Utama**:
  * Katalog menu lengkap dengan informasi bahan, kalori, dan panduan konsumsi.
  * Opsi pembayaran digital lengkap (QRIS, E-Wallet, Transfer Bank, COD).
  * Kecepatan proses checkout dan kejelasan status batas waktu pembayaran (*Countdown Timer*).
  * Layanan bantuan pelanggan (*Customer Support Chat*) langsung.
  * Autentikasi yang aman dan responsif, serta kemudahan pendaftaran ulang jika akun diperbarui.

### 2.2 Administrator (*Admin / Operational Manager*)
* **Profil**: Pengelola toko / pemilik usaha (*Fatih Ahmad Zakky*) yang mengontrol operasional harian toko.
* **Kebutuhan Utama**:
  * Dashboard analytics untuk memantau pendapatan, jumlah pesanan, dan status pengiriman.
  * Manajemen stok produk dan status publikasi menu secara *real-time*.
  * Pembuatan dan pengaturan campaign promosi & voucher diskon.
  * Moderasi ulasan dan pembalasan pesan bantuan pelanggan.
  * Manajemen akun pengguna dan keamanan hak akses terpusat (*RBAC*).

---

## 3. Lingkup Produk & Fitur Utama (Product Scope & Features)

### 3.1 Modul Pelanggan (*Customer Facing*)
1. **Autentikasi & Manajemen Daur Hidup Pengguna (`AuthContext`)**:
   * Login & Registrasi via Email / Password dengan enkripsi & penanganan error presisi (`auth/user-not-found`, `auth/invalid-credential`, `auth/wrong-password`).
   * Single Sign-On (SSO) via Google OAuth dengan registrasi otomatis.
   * **Verifikasi Real-time & Keamanan Sesi**:
     * Sinkronisasi sesi otomatis ke server Firebase Auth (`fbUser.reload()`) pada *auth state change*.
     * Deteksi dan pembersihan otomatis sesi lokal (*auto sign-out & local storage cleanup*) ketika akun dihapus/dinonaktifkan dari Firebase Console.
     * Pembersihan cache pendaftaran lokal (*local registered users cache*) untuk mencegah akses akun ghost/terhapus.
   * Sinkronisasi Sesi Lintas Tab (*Cross-Tab Sync*) menggunakan `StorageEvent` listener.
   * Pembatasan Hak Akses Berbasis Peran (*Role-Based Access Control*: `admin` vs `customer`).

2. **Katalog Produk Interaktif (`/menu`)**:
   * Filter berdasarkan Kategori (*Makanan Berat*, *Minuman*, *Cemilan*).
   * Fitur Pencarian Kata Kunci (*Instant Search*).
   * Detail Produk: Foto galeri high-res, harga, diskon, ketersediaan stok, batas jarak pengiriman, serta informasi nilai gizi (kalori, lemak, gula).

3. **Keranjang Belanja & Kalkulasi Promo (`CartContext` & `/cart`)**:
   * **Keranjang Berbasis Pengguna (User-Scoped Cart)**: Penyimpanan keranjang belanja terisolasi secara otomatis berdasarkan `user.uid` (`nefakky_cart_${user.uid}`).
   * Manajemen kuantitas porsi secara fleksibel dan pembersihan keranjang setelah checkout.
   * Klaim Voucher Diskon dengan validasi syarat *Minimum Spend* dan kuota.
   * Kalkulasi otomatis Subtotal, Ongkos Kirim (berdasarkan layanan *Standard*, *Express*, *Same Day*), Biaya Layanan, dan Potongan Promo.

4. **Checkout & Gateway Pembayaran (`Midtrans Integration`)**:
   * Manajemen Alamat Pengiriman lengkap dengan peta penentuan posisi.
   * Modal Interaktif Snap Midtrans (QRIS Instan, BCA/Mandiri/BNI Virtual Account, GoPay, ShopeePay, Credit Card).
   * Fitur *Countdown Timer* Batas Waktu Pembayaran 24 Jam (`HH:MM:SS`) yang berjalan secara *real-time*.

5. **Pelacakan Pesanan & Riwayat (`/profile`)**:
   * Pemantauan tahapan pesanan: `PENDING` $\rightarrow$ `COOKING` $\rightarrow$ `SHIPPING` $\rightarrow$ `COMPLETED`.

6. **Rating & Ulasan Pelanggan (`/comments`)**:
   * Pemberian skor rating (bintang 1 - 5), teks ulasan, serta foto bukti pembelian.

7. **Layanan Chat CS Support**:
   * Percakapan langsung (*Live Support*) dengan Admin Toko.

---

### 3.2 Modul Administrator (*Admin Control Panel*)
1. **Dashboard Operasional & Analisis (`/admin`)**:
   * Ringkasan KPI: Total Omset (IDR/USD), Total Pesanan, Pelanggan Aktif, dan Jumlah Produk.
2. **Kelola Katalog Produk (CRUD)**:
   * Tambah produk baru, ubah harga/diskon, atur stok, ganti status (*Active*, *Low Stock*, *Inactive*).
3. **Manajemen Pesanan Masuk**:
   * Perbarui status pesanan pelanggan (*Memasak*, *Mengirim*, *Selesai*, *Batal*).
4. **Manajemen Promo & Voucher Diskon**:
   * Pembuatan kode kupon baru, pengaturan persentase potongan, tanggal kadaluarsa, dan batas kuota klaim.
5. **Moderasi Ulasan & Layanan Chat**:
   * Menyematkan ulasan unggulan (*Pin*), menyembunyikan ulasan yang tidak layak, dan membalas pesan chat pelanggan.

---

## 4. Persyaratan Non-Fungsional (Non-Functional Requirements)

| Kategori | Standar Persyaratan |
| :--- | :--- |
| **Kinerja (Performance)** | Waktu muat halaman awal (*First Contentful Paint*) $< 1.5$ detik. Responsiveness 60fps. |
| **Keamanan (Security)** | Enkripsi data sensitif, verifikasi server Firebase Auth real-time (`reload()`), proteksi pembatalan sesi saat akun dihapus, dan HTTPS SSL terenkripsi pada API Snap Midtrans. |
| **Ketersediaan (Availability)** | *Uptime SLA* $99.9\%$, didukung oleh arsitektur Serverless Next.js App Router. |
| **Aksesibilitas (A11y)** | Standar warna kontras tinggi, navigasi ramah keyboard, dan dukungan pembaca layar (*Screen Reader*). |
| **Responsivitas UI/UX** | Desain *Fluid Responsive* untuk perangkat Seluler (Mobile), Tablet, dan Komputer (Desktop). |

---

## 5. Arsitektur Teknologi (Tech Stack & Infrastructure)

* **Framework Utama**: Next.js 14 (App Router & React 18)
* **Bahasa Pemrograman**: TypeScript (Strict Mode)
* **Styling & UI**: Vanilla CSS / Tailwind CSS v3, Lucide React Icons, Google Fonts (Inter & Playfair Display)
* **Autentikasi & User Management**: Firebase Auth (Email/Password & Google OAuth Provider) + Real-time Server Verification & Storage Sync
* **Database & State**: React Context API (`AuthContext`, `CartContext`, `DataContext`), Browser LocalStorage Persistence & API State
* **Payment Gateway**: Midtrans Snap Payment API (Sandbox & Live Production Ready)

---

## 6. Metrik Keberhasilan (Key Performance Indicators / KPIs)

1. **Conversion Rate**: $> 15\%$ pengunjung halaman katalog berhasil menyelesaikan transaksi hingga checkout.
2. **Pembayaran Sukses**: $> 95\%$ transaksi via Midtrans/QRIS selesai tanpa kegagalan teknis.
3. **User Retention**: $> 35\%$ pelanggan melakukan pemesanan ulang (*Repeat Order*) dalam waktu 30 hari.
4. **Waktu Respons CS**: Rata-rata balasan pesan pelanggan oleh Admin CS $< 5$ menit.
5. **Keandalan Sesi Auth**: $100\%$ validasi status pengguna secara *real-time* saat terjadi penghapusan/penonaktifan akun oleh administrator di Firebase Console.
