<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SalesReportController;

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'online',
        'service' => 'Nefakky Laravel Microservice API',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Vouchers API
Route::get('/vouchers', [VoucherController::class, 'index']);
Route::post('/vouchers/validate', [VoucherController::class, 'validateVoucher']);

// Reviews API
Route::get('/reviews', [ReviewController::class, 'index']);
Route::post('/reviews', [ReviewController::class, 'store']);

// Sales Analytics API
Route::get('/reports/sales', [SalesReportController::class, 'index']);
Route::post('/reports/sales', [SalesReportController::class, 'store']);
