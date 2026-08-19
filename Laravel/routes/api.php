<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SalesReportController;
use App\Http\Controllers\Api\MidtransController;
use App\Http\Controllers\Api\HaversineController;

/*
|--------------------------------------------------------------------------
| Nefakky Marketplace - Laravel 12 API Routes
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'online',
        'service' => 'Nefakky Laravel Main Backend API',
        'version' => '2.7.0',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Products API
Route::get('/products/visible', [ProductController::class, 'visible']);
Route::apiResource('products', ProductController::class);

// Orders API
Route::post('/orders/{id}/advance_stage', [OrderController::class, 'advanceStage']);
Route::apiResource('orders', OrderController::class);

// Vouchers API
Route::post('/vouchers/claim', [VoucherController::class, 'validateVoucher']);
Route::post('/vouchers/validate', [VoucherController::class, 'validateVoucher']);
Route::apiResource('vouchers', VoucherController::class);

// Reviews API
Route::apiResource('reviews', ReviewController::class);

// Sales Reports API
Route::get('/reports/sales/years', [SalesReportController::class, 'years']);
Route::get('/reports/sales', [SalesReportController::class, 'index']);
Route::post('/reports/sales', [SalesReportController::class, 'store']);

// Midtrans Snap Token API
Route::post('/midtrans/token', [MidtransController::class, 'token']);

// Haversine Distance API
Route::post('/haversine/distance', [HaversineController::class, 'calculateDistance']);
