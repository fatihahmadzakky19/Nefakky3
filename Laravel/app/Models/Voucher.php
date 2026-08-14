<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $primaryKey = 'voucher_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'voucher_id',
        'code',
        'name',
        'discount_percent',
        'min_spend',
        'expiry',
        'status',
        'is_active',
    ];

    protected $casts = [
        'discount_percent' => 'float',
        'min_spend' => 'float',
        'is_active' => 'boolean',
    ];

    /**
     * Metode PBO: Validasi & Hitung Potongan Diskon
     */
    public function calculateDiscountAmount(float $subtotal): float
    {
        if ($subtotal >= $this->min_spend && $this->is_active && $this->status === 'Active') {
            return round($subtotal * ($this->discount_percent / 100));
        }
        return 0.0;
    }
}
