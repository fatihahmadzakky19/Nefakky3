<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model ProductItem
 * 
 * Model Eloquent ini merepresentasikan tabel 'product_items' di database.
 * Bertanggung jawab mengelola data hidangan kuliner, penghitungan diskon,
 * pengurangan dan pemulihan stok otomatis, penentuan status ketersediaan,
 * serta kalkulasi ulang rating kepuasan pelanggan.
 */
class ProductItem extends Model
{
    use SoftDeletes;

    // Mengatur Primary Key menggunakan string custom (contoh: "PROD-001")
    protected $primaryKey = 'item_id';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Daftar kolom tabel yang diizinkan untuk diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'item_id',             // String (30) Primary Key
        'sku',                 // String (40) unik
        'name',                // String (150)
        'category',            // String (50)
        'price',               // DECIMAL (12, 2)
        'discount',            // DECIMAL (5, 2)
        'stock',               // UNSIGNED INTEGER
        'visibility',          // BOOLEAN
        'status',              // ENUM: 'Active', 'Low Stock', 'Inactive'
        'portion_size',        // ENUM: 'Regular', 'Large', 'Jumbo', 'Family Pack'
        'rating',              // DECIMAL (3, 2)
        'reviews_count',       // UNSIGNED INTEGER
        'sold_units',          // UNSIGNED INTEGER
        'sold_count',          // String (50)
        'image',               // String (500)
        'gallery',             // JSON Array
        'description',         // TEXT
        'badge',               // String (50)
        'ingredients',         // TEXT
        'usage_advice',        // TEXT
        'calories',            // String (30)
        'fat',                 // String (30)
        'sugar',               // String (30)
        'sat_fat',             // String (30)
        'preparation_minutes', // UNSIGNED TINYINTEGER
        'max_delivery_km',     // UNSIGNED SMALLINTEGER
        'restocked_at',        // DATETIME
    ];

    /**
     * Konversi tipe data otomatis (Casting).
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'float',
        'discount' => 'float',
        'stock' => 'integer',
        'visibility' => 'boolean',
        'rating' => 'float',
        'reviews_count' => 'integer',
        'sold_units' => 'integer',
        'preparation_minutes' => 'integer',
        'max_delivery_km' => 'integer',
        'gallery' => 'array',
        'restocked_at' => 'datetime',
    ];

    /**
     * Relasi One-to-Many ke Review.
     *
     * @return HasMany
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'product_id', 'item_id');
    }

    /**
     * Relasi One-to-Many ke OrderItem.
     *
     * @return HasMany
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'product_id', 'item_id');
    }

    /**
     * Metode Bisnis PBO: Menghitung harga akhir hidangan setelah dipotong persen diskon.
     *
     * @return float
     */
    public function getFinalPrice(): float
    {
        if ($this->discount > 0) {
            return round($this->price - ($this->price * ($this->discount / 100)));
        }
        return (float) $this->price;
    }

    /**
     * Metode Bisnis PBO: Mengurangi stok produk saat checkout berhasil.
     *
     * @param int $quantity
     * @return bool
     */
    public function reduceStock(int $quantity): bool
    {
        if ($this->stock >= $quantity) {
            $this->stock -= $quantity;
            $this->sold_units = ($this->sold_units ?? 0) + $quantity;
            $this->sold_count = "{$this->sold_units} Terjual";
            $this->updateStockStatus();
            return $this->save();
        }
        return false;
    }

    /**
     * Metode Bisnis PBO: Memulihkan stok saat pembatalan pesanan.
     *
     * @param int $quantity
     * @return bool
     */
    public function restoreStock(int $quantity): bool
    {
        $this->stock += $quantity;
        if ($this->sold_units >= $quantity) {
            $this->sold_units -= $quantity;
            $this->sold_count = "{$this->sold_units} Terjual";
        }
        $this->updateStockStatus();
        return $this->save();
    }

    /**
     * Metode Bisnis PBO: Menentukan status kelangkaan stok secara dinamis.
     *
     * @return void
     */
    public function updateStockStatus(): void
    {
        if ($this->stock <= 0) {
            $this->stock = 0;
            $this->status = 'Inactive';
        } elseif ($this->stock <= 5) {
            $this->status = 'Low Stock';
        } else {
            $this->status = 'Active';
        }
    }

    /**
     * Metode Bisnis PBO: Menghitung ulang rata-rata rating ulasan produk.
     *
     * @return void
     */
    public function recalculateRating(): void
    {
        $approvedReviews = $this->reviews()
            ->where(function ($q) {
                $q->where('status', 'PUBLISHED')->orWhere('status', 'APPROVED');
            })
            ->get();

        $count = $approvedReviews->count();
        if ($count > 0) {
            $this->rating = round($approvedReviews->avg('rating'), 1);
            $this->reviews_count = $count;
        } else {
            $this->rating = 5.0;
            $this->reviews_count = 0;
        }
        $this->save();
    }
}
