<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model Order
 * 
 * Model Eloquent ini merepresentasikan tabel 'orders' di database.
 * Mengelola transaksi pesanan, alur status 5-tahap, kalkulasi jarak Haversine,
 * serta integrasi pemulihan stok saat pembatalan.
 */
class Order extends Model
{
    // Mengatur Primary Key menggunakan string custom (contoh: "ORD-88219")
    protected $primaryKey = 'order_id';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Definisi urutan 5-tahap status pengantaran pesanan hidangan dapur.
     */
    public const STAGES = [
        'RECEIVED',   // 1. Pesanan Diterima & Masuk Antrian Dapur
        'COOKING',    // 2. Sedang Dimasak & Diracik oleh Chef
        'READY',      // 3. Hidangan Siap & Telah Dikemas Rapi (Packaging)
        'DELIVERING', // 4. Sedang Diantar oleh Kurir Menuju Alamat Pembeli
        'COMPLETED',  // 5. Pesanan Telah Sampai & Diterima Pelanggan
    ];

    /**
     * Kolom-kolom yang dapat diisi secara massal (Mass Assignment).
     *
     * @var list<string>
     */
    protected $fillable = [
        'order_id',                   // String (30)
        'user_id',                    // Foreign Key
        'customer_name',              // String (100)
        'customer_email',             // String (150)
        'avatar',                     // String (500)
        'address',                    // TEXT
        'phone',                      // String (20)
        'item_count',                 // UNSIGNED SMALLINTEGER
        'payment_method',             // ENUM
        'payment_badge',              // ENUM
        'delivery_type',              // ENUM
        'status',                     // ENUM
        'subtotal',                   // DECIMAL (12, 2)
        'shipping_cost',              // DECIMAL (10, 2)
        'discount',                   // DECIMAL (10, 2)
        'tax_amount',                 // DECIMAL (10, 2)
        'total',                      // DECIMAL (12, 2)
        'distance_km',                // DECIMAL (6, 2)
        'estimated_delivery_minutes', // UNSIGNED SMALLINTEGER
        'customer_confirmed',         // BOOLEAN
        'order_datetime',             // DATETIME
        'confirmed_at',               // DATETIME
        'paid_at',                    // DATETIME
        'delivered_at',               // DATETIME
        'proof_photo',                // String (500)
        'payment_proof_photo',        // String (500)
        'voucher_code',               // String (50)
        'applied_promo',              // String (150)
        'notes',                      // TEXT
    ];

    /**
     * Konversi tipe data otomatis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'subtotal' => 'float',
        'shipping_cost' => 'float',
        'discount' => 'float',
        'tax_amount' => 'float',
        'total' => 'float',
        'distance_km' => 'float',
        'item_count' => 'integer',
        'estimated_delivery_minutes' => 'integer',
        'customer_confirmed' => 'boolean',
        'order_datetime' => 'datetime',
        'confirmed_at' => 'datetime',
        'paid_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    /**
     * Relasi Many-to-One ke User.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Relasi One-to-Many ke OrderItem.
     *
     * @return HasMany
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'order_id');
    }

    /**
     * Metode Bisnis PBO: Memajukan status pesanan ke tahap berikutnya secara otomatis.
     *
     * @return string
     */
    public function advanceStatus(): string
    {
        $currentIndex = array_search($this->status, self::STAGES);

        if ($currentIndex !== false && $currentIndex < count(self::STAGES) - 1) {
            $nextStatus = self::STAGES[$currentIndex + 1];
            $this->status = $nextStatus;

            if ($nextStatus === 'COMPLETED') {
                $this->customer_confirmed = true;
                $this->confirmed_at = now();
                $this->delivered_at = now();
            }

            $this->save();
            return $nextStatus;
        }

        return $this->status;
    }

    /**
     * Metode Bisnis PBO: Menandai pesanan telah lunas terbayar via Midtrans / Transfer.
     *
     * @return bool
     */
    public function markAsPaid(): bool
    {
        $this->payment_badge = 'PAID';
        $this->paid_at = now();
        if ($this->status === 'PENDING') {
            $this->status = 'RECEIVED';
        }
        return $this->save();
    }

    /**
     * Metode Bisnis PBO: Mengonfirmasi pesanan telah diterima pembeli.
     *
     * @return bool
     */
    public function confirmReceived(): bool
    {
        $this->customer_confirmed = true;
        $this->confirmed_at = now();
        $this->delivered_at = now();
        $this->status = 'COMPLETED';
        return $this->save();
    }

    /**
     * Metode Bisnis PBO: Membatalkan pesanan serta mengembalikan kuantitas stok produk.
     *
     * @return bool
     */
    public function cancelOrder(): bool
    {
        if ($this->status !== 'CANCELLED' && $this->status !== 'COMPLETED') {
            $this->status = 'CANCELLED';

            foreach ($this->items as $item) {
                $product = ProductItem::find($item->product_id);
                if ($product) {
                    $product->restoreStock($item->quantity);
                }
            }

            return $this->save();
        }

        return false;
    }
}
