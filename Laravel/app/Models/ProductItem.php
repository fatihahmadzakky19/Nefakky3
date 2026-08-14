<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductItem extends Model
{
    protected $primaryKey = 'item_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'item_id',
        'sku',
        'name',
        'category',
        'price',
        'discount',
        'stock',
        'visibility',
        'status',
        'rating',
        'reviews_count',
        'sold_count',
        'image',
        'description',
        'badge',
        'ingredients',
        'usage_advice',
        'calories',
        'fat',
        'sugar',
    ];

    protected $casts = [
        'price' => 'float',
        'discount' => 'float',
        'stock' => 'integer',
        'visibility' => 'boolean',
        'rating' => 'float',
        'reviews_count' => 'integer',
    ];

    /**
     * Metode PBO: Hitung harga akhir setelah diskon
     */
    public function getFinalPrice(): float
    {
        if ($this->discount > 0) {
            return round($this->price - ($this->price * ($this->discount / 100)));
        }
        return $this->price;
    }

    /**
     * Metode PBO: Pengurangan stok otomatis
     */
    public function reduceStock(int $quantity): bool
    {
        if ($this->stock >= $quantity) {
            $this->stock -= $quantity;
            if ($this->stock == 0) {
                $this->status = 'Inactive';
            } elseif ($this->stock <= 5) {
                $this->status = 'Low Stock';
            }
            return $this->save();
        }
        return false;
    }
}
