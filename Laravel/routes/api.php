<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SalesReportController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MidtransController;
use App\Http\Controllers\Api\HaversineController;
use App\Http\Controllers\Api\StoreSettingController;
use App\Http\Controllers\Api\WeeklySalesRecapController;

/*
|--------------------------------------------------------------------------
| Nefakky Marketplace - Laravel 12 API Routes
|--------------------------------------------------------------------------
| File ini mendefinisikan seluruh endpoint RESTful API backend Nefakky.
| Seluruh endpoint terkelompok secara modular berdasarkan domain bisnis,
| menggunakan standar REST, otentikasi Laravel Sanctum, dan respons JSON seragam.
*/

// =========================================================================
// 1. HEALTH CHECK & STATUS SERVER
// =========================================================================
// Endpoint untuk memeriksa status operasional backend, versi Laravel, dan konektivitas database
Route::get('/health', function () {
    return response()->json([
        'status' => 'online',
        'service' => 'Nefakky Laravel Main Backend API',
        'framework' => 'Laravel 12 (PHP 8.2)',
        'version' => '3.0.0',
        'database' => config('database.default'),
        'timestamp' => now()->toIso8601String(),
    ]);
});

// =========================================================================
// 2. MODUL AUTENTIKASI PENGGUNA (AUTH API)
// =========================================================================
Route::prefix('auth')->group(function () {
    // Endpoint publik: Login akun dan pembuatan Bearer Token Sanctum
    Route::post('/login', [AuthController::class, 'login']);
    // Endpoint publik: Registrasi akun pelanggan baru
    Route::post('/register', [AuthController::class, 'register']);

    // Endpoint terproteksi: Wajib menyertakan Header 'Authorization: Bearer <token>'
    Route::middleware('auth:sanctum')->group(function () {
        // Mengambil profil data user yang sedang login beserta daftar alamat
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::get('/me', [AuthController::class, 'profile']);
        // Memperbarui informasi profil (nama, no telepon, avatar)
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        // Mengganti password akun pengguna
        Route::post('/change-password', [AuthController::class, 'changePassword']);
        // Mengakhiri sesi dan mencabut token autentikasi aktif
        Route::post('/logout', [AuthController::class, 'logout']);

        // Manajemen Multi-Alamat Pengiriman Pengguna
        Route::get('/addresses', [AuthController::class, 'listAddresses']);
        Route::post('/addresses', [AuthController::class, 'storeAddress']);
        Route::put('/addresses/{id}', [AuthController::class, 'updateAddress']);
        Route::post('/addresses/{id}/default', [AuthController::class, 'setDefaultAddress']);
        Route::delete('/addresses/{id}', [AuthController::class, 'deleteAddress']);
    });
});

// =========================================================================
// 3. MODUL PRODUK & KATALOG MENU KULINER (PRODUCTS API)
// =========================================================================
// Mengambil daftar produk aktif untuk etalase katalog publik
Route::get('/products/visible', [ProductController::class, 'visible']);
// Mengubah status tampil/sembunyi produk di katalog secara cepat
Route::post('/products/{id}/toggle-visibility', [ProductController::class, 'toggleVisibility']);
// Memperbarui kuantitas stok produk secara instan
Route::post('/products/{id}/stock', [ProductController::class, 'updateStock']);
// RESTful CRUD Master Produk (index, store, show, update, destroy)
Route::apiResource('products', ProductController::class);

// =========================================================================
// 4. MODUL MASTER KATEGORI MENU (CATEGORIES API)
// =========================================================================
// RESTful CRUD Kategori (Makanan Utama, Minuman, Rice Bowl, Cemilan, Paket Hemat)
Route::apiResource('categories', CategoryController::class);

// =========================================================================
// 5. MODUL TRANSAKSI PESANAN & LIVE TRACKING (ORDERS API)
// =========================================================================
// Mengambil statistik ringkasan jumlah order per status pengiriman
Route::get('/orders/stats', [OrderController::class, 'stats']);
// Memajukan status pengiriman 5-tahap (RECEIVED -> COOKING -> READY -> DELIVERING -> COMPLETED)
Route::post('/orders/{id}/advance_stage', [OrderController::class, 'advanceStage']);
Route::post('/orders/{id}/advance-stage', [OrderController::class, 'advanceStage']);
// Konfirmasi penerimaan pesanan oleh pelanggan
Route::post('/orders/{id}/confirm', [OrderController::class, 'confirmReceived']);
// Mengunggah foto bukti serah terima / bukti transfer pembayaran
Route::post('/orders/{id}/proof', [OrderController::class, 'uploadProof']);
// Membatalkan pesanan dan mengembalikan kuantitas stok produk
Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
// RESTful CRUD Pesanan (index, store, show, update, destroy)
Route::apiResource('orders', OrderController::class);

// =========================================================================
// 6. MODUL VOUCHER & PROMO ENGINE (VOUCHERS API)
// =========================================================================
// Mengambil seluruh data voucher untuk keperluan panel admin
Route::get('/vouchers/all', [VoucherController::class, 'all']);
// Memvalidasi kode kupon promo, syarat min spend, kuota, dan menghitung nominal potongan harga
Route::post('/vouchers/claim', [VoucherController::class, 'validateVoucher']);
Route::post('/vouchers/validate', [VoucherController::class, 'validateVoucher']);
// Mengaktifkan atau menonaktifkan status kupon promo
Route::post('/vouchers/{id}/toggle-status', [VoucherController::class, 'toggleStatus']);
// RESTful CRUD Voucher Promo (index, store, show, update, destroy)
Route::apiResource('vouchers', VoucherController::class);

// =========================================================================
// 7. MODUL ULASAN, RATING & MODERASI (REVIEWS API)
// =========================================================================
// Mengambil ringkasan rata-rata rating toko dan distribusi bintang (5/4/3/2/1)
Route::get('/reviews/summary', [ReviewController::class, 'summary']);
// Menambahkan suka (Like) pada ulasan hidangan
Route::post('/reviews/{id}/like', [ReviewController::class, 'like']);
// Mengirimkan balasan penjual/admin pada ulasan pelanggan
Route::post('/reviews/{id}/reply', [ReviewController::class, 'reply']);
// Melakukan moderasi status ulasan (Approved, Flagged, Pinned, Hidden)
Route::post('/reviews/{id}/moderate', [ReviewController::class, 'moderate']);
// RESTful CRUD Ulasan Pelanggan (index, store, show, update, destroy)
Route::apiResource('reviews', ReviewController::class);

// =========================================================================
// 8. MODUL LAPORAN OMSET & KEUANGAN (SALES REPORTS & WEEKLY RECAP API)
// =========================================================================
// Mengambil daftar tahun yang memiliki catatan laporan omset
Route::get('/reports/sales/years', [SalesReportController::class, 'years']);
// Mengambil rekapitulasi omset bulanan, laba bersih, dan metrik AOV
Route::get('/reports/sales', [SalesReportController::class, 'index']);
// Menyimpan atau memperbarui data omset bulanan
Route::post('/reports/sales', [SalesReportController::class, 'store']);
// Menghapus data baris laporan omset bulanan
Route::delete('/reports/sales/{id}', [SalesReportController::class, 'destroy']);

// Laporan Rekap Penjualan Mingguan & Bazar (Juli & Agustus 2026)
Route::get('/weekly-recaps/month/{month}', [WeeklySalesRecapController::class, 'byMonth']);
Route::apiResource('weekly-recaps', WeeklySalesRecapController::class);

// =========================================================================
// 9. MODUL BANNER & EVENT PROMOSI (PROMOTIONS API)
// =========================================================================
// Mengaktifkan atau menonaktifkan banner promosi
Route::post('/promotions/{id}/toggle-status', [PromotionController::class, 'toggleStatus']);
// RESTful CRUD Banner Promosi (index, store, show, update, destroy)
Route::apiResource('promotions', PromotionController::class);

// =========================================================================
// 10. MODUL LIVE CHAT & CUSTOMER SUPPORT (CHATS API)
// =========================================================================
// Mengambil riwayat pesan percakapan pelanggan dan admin
Route::get('/chats', [ChatController::class, 'index']);
// Mengirimkan pesan chat baru
Route::post('/chats', [ChatController::class, 'store']);
// Menandai pesan sebagai telah dibaca (Read Receipts)
Route::post('/chats/read', [ChatController::class, 'markAsRead']);

// =========================================================================
// 11. MODUL DASHBOARD ANALYTICS ADMIN (DASHBOARD API)
// =========================================================================
// Mengambil seluruh ringkasan metrik eksekutif, data grafik, stok menipis, dan menu terpopuler
Route::get('/dashboard/overview', [DashboardController::class, 'overview']);

// =========================================================================
// 12. MODUL PAYMENT GATEWAY MIDTRANS (MIDTRANS API)
// =========================================================================
// Membuat Snap Token transaksi pembayaran Midtrans (dengan simulator mock token saat offline)
Route::post('/midtrans/token', [MidtransController::class, 'token']);
// Webhook handler otomatis untuk menangani notifikasi perubahan status pembayaran dari Midtrans
Route::post('/midtrans/webhook', [MidtransController::class, 'webhook']);

// =========================================================================
// 13. MODUL KALKULATOR JARAK & ONGKOS KIRIM (HAVERSINE API)
// =========================================================================
// Menghitung jarak linier geografis dari Central Kitchen ke pelanggan beserta estimasi waktu & ongkir
Route::post('/haversine/distance', [HaversineController::class, 'calculateDistance']);

// =========================================================================
// 14. MODUL PENGATURAN OPERASIONAL TOKO (STORE SETTINGS API)
// =========================================================================
// Mengambil seluruh konfigurasi pengaturan toko (nama, koordinat kitchen, tarif ongkir, pajak PB1)
Route::get('/settings', [StoreSettingController::class, 'index']);
// Mengambil nilai satu konfigurasi berdasarkan key
Route::get('/settings/{key}', [StoreSettingController::class, 'show']);
// Memperbarui pengaturan operasional toko
Route::post('/settings', [StoreSettingController::class, 'update']);

// =========================================================================
// 15. MODUL INSPEKTUR SKEMA & TIPE DATA DATABASE (DATABASE SCHEMA API)
// =========================================================================
// Mengambil seluruh struktur skema 12 tabel, daftar kolom, tipe data (ENUM, DATETIME, DECIMAL, dll)
Route::get('/database/schema', [\App\Http\Controllers\Api\DatabaseSchemaController::class, 'getFullSchema']);
// Mengambil detail kolom dan sampel data dari satu tabel tertentu
Route::get('/database/schema/{table}', [\App\Http\Controllers\Api\DatabaseSchemaController::class, 'getTableDetails']);
