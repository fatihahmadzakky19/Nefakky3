<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model SalesReport
 * 
 * Model Eloquent ini merepresentasikan tabel 'sales_reports' di database.
 * Bertanggung jawab mencatat omset bulanan, laba bersih, total pesanan,
 * analisis event bazar, tanggal periode (date), dan metrik AOV.
 */
class SalesReport extends Model
{
    /**
     * Kolom-kolom yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'year',                 // UNSIGNED SMALLINTEGER
        'month_number',         // UNSIGNED TINYINTEGER
        'month_year',           // String (50)
        'gross_revenue',        // DECIMAL (15, 2)
        'net_profit',           // DECIMAL (15, 2)
        'average_order_value',  // DECIMAL (12, 2)
        'total_orders',         // UNSIGNED INTEGER
        'total_items_sold',     // UNSIGNED INTEGER
        'report_status',        // ENUM: 'DRAFT', 'FINAL', 'VERIFIED'
        'period_start',         // DATE
        'period_end',           // DATE
        'event_tag',            // String (150)
        'is_bazar',             // BOOLEAN
    ];

    /**
     * Konversi tipe data otomatis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'year' => 'integer',
        'month_number' => 'integer',
        'gross_revenue' => 'float',
        'net_profit' => 'float',
        'average_order_value' => 'float',
        'total_orders' => 'integer',
        'total_items_sold' => 'integer',
        'period_start' => 'date',
        'period_end' => 'date',
        'is_bazar' => 'boolean',
    ];

    /**
     * Metode Bisnis PBO: Menghitung Average Order Value (AOV).
     *
     * @return float
     */
    public function getAverageOrderValue(): float
    {
        if ($this->total_orders > 0) {
            return round($this->gross_revenue / $this->total_orders);
        }
        return 0;
    }

    /**
     * Metode Bisnis PBO: Menghitung persentase margin laba bersih.
     *
     * @return float
     */
    public function getProfitMarginPercent(): float
    {
        if ($this->gross_revenue > 0) {
            return round(($this->net_profit / $this->gross_revenue) * 100, 1);
        }
        return 0;
    }
}