<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model SalesReport
 * 
 * Model Eloquent ini merepresentasikan tabel 'sales_reports' di database.
 * Bertanggung jawab mencatat ringkasan omset penjualan bulanan, keuntungan bersih,
 * volume transaksi pesanan, analisis performa bazar kuliner, dan metrik AOV (Average Order Value).
 */
class SalesReport extends Model
{
    /**
     * Kolom-kolom yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'year',          // Tahun periode laporan (contoh: "2026")
        'month_year',    // Label bulan dan tahun (contoh: "Juni 2026")
        'gross_revenue', // Total pendapatan kotor dalam Rupiah (Rp)
        'net_profit',    // Laba bersih operasional setelah dipotong modal HPP
        'total_orders',  // Total jumlah pesanan yang berhasil diselesaikan
        'event_tag',     // Penanda atau nama event bazar khusus
        'is_bazar',      // Boolean: apakah berasal dari event bazar kuliner
    ];

    /**
     * Konversi tipe data otomatis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'gross_revenue' => 'float',
        'net_profit' => 'float',
        'total_orders' => 'integer',
        'is_bazar' => 'boolean',
    ];

    /**
     * Metode Bisnis PBO: Menghitung Average Order Value (AOV) / Nilai rata-rata per transaksi pesanan.
     *
     * @return float Nilai rata-rata omset per pesanan
     */
    public function getAverageOrderValue(): float
    {
        if ($this->total_orders > 0) {
            return round($this->gross_revenue / $this->total_orders);
        }
        return 0;
    }

    /**
     * Metode Bisnis PBO: Menghitung persentase margin keuntungan bersih (Net Margin %).
     *
     * @return float Persentase margin laba
     */
    public function getProfitMarginPercent(): float
    {
        if ($this->gross_revenue > 0) {
            return round(($this->net_profit / $this->gross_revenue) * 100, 1);
        }
        return 0;
    }
}