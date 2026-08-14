<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesReport extends Model
{
    protected $fillable = [
        'month_year',
        'gross_revenue',
        'net_profit',
        'total_orders',
        'event_tag',
    ];

    protected $casts = [
        'gross_revenue' => 'float',
        'net_profit' => 'float',
        'total_orders' => 'integer',
    ];
}
