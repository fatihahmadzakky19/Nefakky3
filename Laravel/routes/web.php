<?php

// Mengimpor Facade Route dari framework Laravel
use Illuminate\Support\Facades\Route;

// Route Halaman Utama Web (GET /)
Route::get('/', function () {
    // Mengembalikan tampilan view 'welcome' (resources/views/welcome.blade.php)
    return view('welcome');
});

