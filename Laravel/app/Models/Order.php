<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $primaryKey = 'order_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'order_id',
        'customer_name',
        'customer_email',
        'avatar',
        'address',
        'phone',
        'item_count',
        'payment_method',
        'payment_badge',
        'delivery_type',
        'status',
        'subtotal',
        'shipping_cost',
        'discount',
        'total',
        'customer_confirmed',
    ];

    protected $casts = [
        'item_count' => 'integer',
        'subtotal' => 'float',
        'shipping_cost' => 'float',
        'discount' => 'float',
        'total' => 'float',
        'customer_confirmed' => 'boolean',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'order_id');
    }

    /**
     * Metode PBO: Pembaruan Status Alur Pengiriman Live 5-Tahap
     */
    public function advanceStatus(): string
    {
        $statusFlow = ['RECEIVED', 'COOKING', 'READY', 'DELIVERING', 'COMPLETED'];
        $currIdx = array_search($this->status, $statusFlow);
        if ($currIdx !== false && $currIdx < count($statusFlow) - 1) {
            $this->status = $statusFlow[$currIdx + 1];
            $this->save();
        }
        return $this->status;
    }
}
