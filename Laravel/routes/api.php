<?php

// Mengimpor Facade Route dari framework Laravel untuk mendefinisikan route API
use Illuminate\Support\Facades\Route;
// Mengimpor ProductController untuk menangani endpoint data produk
use App\Http\Controllers\Api\ProductController;
// Mengimpor OrderController untuk menangani endpoint pesanan dan alur status
use App\Http\Controllers\Api\OrderController;
// Mengimpor VoucherController untuk menangani klaim & validasi diskon
use App\Http\Controllers\Api\VoucherController;
// Mengimpor ReviewController untuk menangani ulasan/rating pelanggan
use App\Http\Controllers\Api\ReviewController;
// Mengimpor SalesReportController untuk laporan penjualan & statistik keuangan
use App\Http\Controllers\Api\SalesReportController;
// Mengimpor MidtransController untuk integrasi payment gateway Midtrans Snap
use App\Http\Controllers\Api\MidtransController;
// Mengimpor HaversineController untuk kalkulasi jarak pengiriman & estimasi waktu
use App\Http\Controllers\Api\HaversineController;

/*
|--------------------------------------------------------------------------
| Nefakky Marketplace - Laravel 12 API Routes
|--------------------------------------------------------------------------
*/

// Endpoint Health Check: Memeriksa status kesehatan server API Laravel
Route::get('/health', function () {
    // Mengembalikan response format JSON yang berisi status server, versi API, dan timestamp saat ini
    return response()->json([
        'status' => 'online', // Status server aktif
        'service' => 'Nefakky Laravel Main Backend API', // Nama layanan backend
        'version' => '2.7.0', // Versi API backend saat ini
        'timestamp' => now()->toIso8601String(), // Waktu server dalam format ISO-8601
    ]);
});

// Endpoint Produk: Mendapatkan daftar produk yang status visibility-nya aktif/ditampilkan
Route::get('/products/visible', [ProductController::class, 'visible']);
// Endpoint Resource Produk: Menyediakan fungsi CRUD (Create, Read, Update, Delete) otomatis untuk produk
Route::apiResource('products', ProductController::class);

// Endpoint Pesanan: Memajukan tahap alur pengiriman pesanan (RECEIVED -> COOKING -> READY -> DELIVERING -> COMPLETED)
Route::post('/orders/{id}/advance_stage', [OrderController::class, 'advanceStage']);
// Endpoint Resource Pesanan: Menyediakan fungsi CRUD otomatis untuk mengelola pesanan
Route::apiResource('orders', OrderController::class);

// Endpoint Voucher: Mengklaim & menguji validasi kode voucher promo
Route::post('/vouchers/claim', [VoucherController::class, 'validateVoucher']);
// Endpoint Voucher: Memvalidasi potongan harga berdasarkan nilai subtotal pesanan
Route::post('/vouchers/validate', [VoucherController::class, 'validateVoucher']);
// Endpoint Resource Voucher: Menyediakan fungsi CRUD otomatis untuk voucher
Route::apiResource('vouchers', VoucherController::class);

// Endpoint Resource Ulasan: Menyediakan fungsi mendapatkan ulasan dan membuat ulasan baru
Route::apiResource('reviews', ReviewController::class);

// Endpoint Laporan Penjualan: Mendapatkan ringkasan statistik & laporan bulanan
Route::get('/reports/sales', [SalesReportController::class, 'index']);
// Endpoint Laporan Penjualan: Menyimpan atau memperbarui data laporan penjualan bulanan
Route::post('/reports/sales', [SalesReportController::class, 'store']);

// Endpoint Midtrans: Membuat token transaksi Snap untuk pembayaran online
Route::post('/midtrans/token', [MidtransController::class, 'token']);

// Endpoint Haversine: Menghitung jarak KM dan estimasi menit pengiriman dari Dapur Utama
Route::post('/haversine/distance', [HaversineController::class, 'calculateDistance']);

