<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - Nefakky Marketplace
|--------------------------------------------------------------------------
| Rute web untuk menampilkan antarmuka visual dokumentasi RESTful API interaktif
| yang dapat dibuka langsung melalui web browser oleh penguji UKK atau developer.
|--------------------------------------------------------------------------
*/

// Rute Halaman Utama (Root URL) -> Menampilkan Dokumentasi API
Route::get('/', function () {
    return view('api-docs');
});

// Alias rute /docs -> Menampilkan Dokumentasi API
Route::get('/docs', function () {
    return view('api-docs');
});

// Alias rute /api/docs -> Menampilkan Dokumentasi API
Route::get('/api/docs', function () {
    return view('api-docs');
});
