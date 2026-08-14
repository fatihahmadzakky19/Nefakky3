<?php

// Namespace penempat Model dalam struktur folder Laravel Eloquent
namespace App\Models;

// Mengimpor kelas dasar Model dari Eloquent ORM Laravel
use Illuminate\Database\Eloquent\Model;

// Class Model SalesReport yang merepresentasikan laporan keuangan di tabel 'sales_reports'
class SalesReport extends Model
{
    // Kolom-kolom yang diizinkan untuk diisi secara massal
    protected $fillable = [
        'month_year', // Periode bulan & tahun laporan (cth: "Agu 2026")
        'gross_revenue', // Total omzet/pendapatan kotor bulanan (Rp)
        'net_profit', // Total laba/keuntungan bersih bulanan (Rp)
        'total_orders', // Jumlah total transaksi sukses pada bulan tersebut
        'event_tag', // Tag nama event khusus jika ada (cth: "Promo Kemerdekaan")
    ];

    // Casting tipe data kolom
    protected $casts = [
        'gross_revenue' => 'float', // Konversi pendapatan kotor ke tipe float
        'net_profit' => 'float', // Konversi keuntungan bersih ke tipe float
        'total_orders' => 'integer', // Konversi total transaksi ke tipe integer
    ];
}

