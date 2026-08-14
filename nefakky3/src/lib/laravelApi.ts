/**
 * Client Layanan API Laravel untuk Nefakky Marketplace
 * Menghubungkan Antarmuka Frontend (Next.js) ke Backend Laravel API (Port 8001)
 */

// Menentukan URL dasar API Laravel dari environment variable atau fallback ke http://localhost:8001/api
const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8001/api';

// Interface tipe data struktur Voucher dari API Laravel
export interface LaravelVoucher {
  id: number; // ID unik voucher
  code: string; // Kode unik promo voucher (cth: PROMO50)
  title: string; // Judul promo voucher
  description: string; // Deskripsi lengkap voucher
  type: 'percent' | 'fixed'; // Tipe potongan: persen (%) atau nominal tetap (Rp)
  discount_value: number; // Nilai persentase/nominal diskon
  min_spend: number; // Minimal total belanja untuk menggunakan voucher
  max_discount?: number; // Maksimal batas diskon (opsional)
  quota: number; // Kuota penggunaan voucher
  used_count: number; // Jumlah voucher yang sudah digunakan
  is_active: boolean; // Status keaktifan voucher (true/false)
}

// Interface tipe data Ulasan Pelanggan dari API Laravel
export interface LaravelReview {
  id?: number; // ID ulasan (opsional saat submit)
  product_id: string; // ID produk yang diulas
  customer_name: string; // Nama pelanggan pengulas
  customer_email?: string; // Email pelanggan (opsional)
  rating: number; // Nilai rating (1-5 bintang)
  comment: string; // Komentar testimoni pelanggan
  image_url?: string; // URL foto ulasan (opsional)
  created_at?: string; // Waktu ulasan dibuat (opsional)
}

// Interface tipe data Laporan Penjualan dari API Laravel
export interface LaravelSalesReport {
  month_year: string; // Periode bulan dan tahun (cth: "Agu 2026")
  gross_revenue: number; // Total pendapatan kotor/omzet
  net_profit: number; // Total keuntungan bersih
  total_orders: number; // Total jumlah transaksi
  event_tag?: string; // Label event promo khusus (opsional)
}

// 1. Fungsi Health Check: Memeriksa koneksi & status keaktifan server API Laravel
export async function checkLaravelHealth() {
  try {
    // Kirim request HTTP GET ke endpoint health check Laravel
    const res = await fetch(`${LARAVEL_API_URL}/health`);
    // Kembalikan response JSON berisi status server Laravel
    return await res.json();
  } catch (error) {
    // Tangkap error jika server Laravel tidak dapat dijangkau
    console.error('Laravel Health Check Failed:', error);
    // Kembalikan objek status offline
    return { status: 'offline', error };
  }
}

// 2. Fungsi Fetch Vouchers: Mengambil daftar voucher promo aktif dari backend Laravel
export async function fetchLaravelVouchers(): Promise<LaravelVoucher[]> {
  try {
    // Kirim request HTTP GET ke endpoint vouchers Laravel
    const res = await fetch(`${LARAVEL_API_URL}/vouchers`);
    // Parse response HTTP ke format JSON
    const data = await res.json();
    // Jika status sukses, kembalikan array voucher; jika gagal kembalikan array kosong
    return data.status === 'success' ? data.data : [];
  } catch (error) {
    // Tangkap error jika permintaan API gagal
    console.error('Failed to fetch vouchers from Laravel:', error);
    // Kembalikan array kosong sebagai fallback aman
    return [];
  }
}

// 3. Fungsi Validate Voucher: Memvalidasi kode voucher dan menghitung potongan diskon via Laravel Engine
export async function validateLaravelVoucher(code: string, subtotal: number) {
  try {
    // Kirim request HTTP POST ke endpoint validasi voucher Laravel
    const res = await fetch(`${LARAVEL_API_URL}/vouchers/validate`, {
      method: 'POST', // Metode HTTP POST
      headers: { 'Content-Type': 'application/json' }, // Header tipe konten JSON
      body: JSON.stringify({ code, subtotal }), // Format body request JSON berisi kode voucher dan subtotal
    });
    // Kembalikan hasil kalkulasi diskon dari backend Laravel
    return await res.json();
  } catch (error) {
    // Kembalikan pesan error jika koneksi gagal
    return { status: 'error', message: 'Gagal terhubung ke Laravel Voucher Engine.' };
  }
}

// 4. Fungsi Fetch Reviews: Mengambil ulasan pelanggan dari backend Laravel (dapat difilter per produk)
export async function fetchLaravelReviews(productId?: string) {
  try {
    // Tentukan URL berdasarkan parameter productId (jika ada)
    const url = productId
      ? `${LARAVEL_API_URL}/reviews?product_id=${productId}`
      : `${LARAVEL_API_URL}/reviews`;
    // Kirim request HTTP GET ke endpoint ulasan
    const res = await fetch(url);
    // Kembalikan response data ulasan
    return await res.json();
  } catch (error) {
    // Tangkap error dan kembalikan fallback default rating 5.0
    console.error('Failed to fetch reviews from Laravel:', error);
    return { status: 'error', data: [], average_rating: 5.0, total_reviews: 0 };
  }
}

// 5. Fungsi Submit Review: Mengirimkan ulasan dan rating produk baru ke backend Laravel
export async function submitLaravelReview(review: LaravelReview) {
  try {
    // Kirim request HTTP POST ke endpoint reviews Laravel
    const res = await fetch(`${LARAVEL_API_URL}/reviews`, {
      method: 'POST', // Metode HTTP POST
      headers: { 'Content-Type': 'application/json' }, // Header JSON
      body: JSON.stringify(review), // Ubah objek review ke string JSON
    });
    // Kembalikan response JSON dari server
    return await res.json();
  } catch (error) {
    // Tangkap error jika pengiriman gagal
    return { status: 'error', message: 'Gagal menyimpan ulasan ke Laravel.' };
  }
}

// 6. Fungsi Fetch Sales Reports: Mengambil statistik laporan penjualan & keuangan dari Laravel Analytics
export async function fetchLaravelSalesReports() {
  try {
    // Kirim request HTTP GET ke endpoint laporan penjualan Laravel
    const res = await fetch(`${LARAVEL_API_URL}/reports/sales`);
    // Kembalikan response JSON berisi summary AOV, omzet, dan data bulanan
    return await res.json();
  } catch (error) {
    // Tangkap error dan kembalikan struktur data kosong
    console.error('Failed to fetch sales reports from Laravel:', error);
    return { status: 'error', summary: {}, data: [] };
  }
}

