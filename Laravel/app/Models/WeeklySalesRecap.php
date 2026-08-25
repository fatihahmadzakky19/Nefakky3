<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model WeeklySalesRecap
 * 
 * Merepresentasikan catatan rekapitulasi penjualan mingguan dan performa bazar kuliner
 * pada bulan Juli dan Agustus 2026.
 */
class WeeklySalesRecap extends Model
{
    use HasFactory;

    protected $table = 'weekly_sales_recaps';

    protected $fillable = [
        'year',
        'month',
        'week_number',
        'week_label',
        'sales_category',
        'gross_revenue',
        'net_profit',
        'operational_details',
        'is_total_row',
    ];

    protected $casts = [
        'year' => 'integer',
        'week_number' => 'integer',
        'gross_revenue' => 'float',
        'net_profit' => 'float',
        'is_total_row' => 'boolean',
    ];
}
