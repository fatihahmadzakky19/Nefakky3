<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model OrderItem
 * 
 * Model Eloquent ini merepresentasikan tabel 'order_items' di database.
 * Menyimpan snapshot data hidangan yang dibeli (nama, harga satuan saat checkout,
 * kuantitas, dan foto) untuk mencegah perubahan histori harga di masa depan.
 */
class OrderItem extends Model
{
    /**
     * Kolom-kolom yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'order_id',   // Foreign key ke tabel orders
        'product_id', // ID unik produk (contoh: "PROD-001")
        'name',       // Nama produk saat transaksi terjadi
        'price',      // Harga satuan produk saat transaksi terjadi
        'quantity',   // Kuantitas porsi yang dibeli
        'image',      // URL foto produk
    ];

    /**
     * Konversi tipe data otomatis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'float',
        'quantity' => 'integer',
    ];

    /**
     * Relasi Many-to-One: Rincian item ini dimiliki oleh satu pesanan induk (Order).
     *
     * @return BelongsTo
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }

    /**
     * Relasi Many-to-One: Rincian item ini terhubung ke master data produk (ProductItem).
     *
     * @return BelongsTo
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(ProductItem::class, 'product_id', 'item_id');
    }

    /**
     * Metode Bisnis PBO: Menghitung total subtotal harga untuk baris item ini (Harga x Kuantitas).
     *
     * @return float
     */
    public function getSubtotal(): float
    {
        return (float) ($this->price * $this->quantity);
    }
}
