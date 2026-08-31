<?php

// -----------------------------------------------------------------------------
// NAMESPACE: Mengelompokkan class OrderItem ke dalam namespace model aplikasi.
// Konsep PBO: Manajemen struktur paket & isolasi nama class.
// -----------------------------------------------------------------------------
namespace App\Models;

// -----------------------------------------------------------------------------
// IMPORT DEPENDENCY: Mengimpor class dasar Eloquent & tipe relasi database.
// Konsep PBO: Pola Pewarisan (Inheritance) & Asosiasi Objek.
// -----------------------------------------------------------------------------
use Illuminate\Database\Eloquent\Model;                    // Superclass Model Eloquent
use Illuminate\Database\Eloquent\Relations\BelongsTo;      // Kontrak relasi Many-to-One

/**
 * =============================================================================
 * CLASS: OrderItem (Pemrograman Berorientasi Objek / PBO)
 * =============================================================================
 * Blueprint objek rincian menu hidangan yang dibeli dalam satu transaksi pesanan.
 *
 * Konsep PBO yang Diterapkan:
 * 1. INHERITANCE   : Mewarisi operasi database dari parent class 'Model'.
 * 2. ENKAPSULASI   : Mengamankan properti via $fillable & $casts.
 * 3. ASOSIASI/RELASI: Menghubungkan baris transaksi ke Order dan ProductItem.
 * 4. BUSINESS LOGIC: Kalkulasi subtotal harga per baris item (Price x Quantity).
 * =============================================================================
 */
class OrderItem extends Model
{
    /**
     * ENKAPSULASI MASS ASSIGNMENT ($fillable):
     * Kolom-kolom yang diizinkan untuk diisi secara massal saat penyimpanan rincian item.
     *
     * @var list<string>
     */
    protected $fillable = [
        'order_id',   // Foreign Key penghubung ke entitas induk Order (e.g. "ORD-12345")
        'product_id', // ID unik produk kuliner yang dipesan (e.g. "PROD-001")
        'name',       // Snapshot nama produk saat transaksi terjadi
        'price',      // Snapshot harga satuan produk saat checkout dilakukan (Rp)
        'quantity',   // Kuantitas porsi hidangan yang dibeli
        'image',      // URL foto menu hidangan saat dipesan
    ];

    /**
     * ENKAPSULASI CASTING TIPE DATA ($casts):
     * Konversi tipe data otomatis dari database menjadi tipe data primitif PHP.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'float',       // Otomatis dikonversi menjadi bilangan pecahan (float)
        'quantity' => 'integer',  // Otomatis dikonversi menjadi bilangan bulat (integer)
    ];

    /**
     * =========================================================================
     * RELASI PBO: BelongsTo (Many-to-One) ke Model Order
     * =========================================================================
     * Mengaitkan baris rincian item ini ke objek transaksi pesanan induk (Order).
     *
     * @return BelongsTo
     */
    public function order(): BelongsTo
    {
        // Relasi: Banyak baris item (OrderItem) dimiliki oleh Satu pesanan induk (Order)
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }

    /**
     * =========================================================================
     * RELASI PBO: BelongsTo (Many-to-One) ke Model ProductItem
     * =========================================================================
     * Menghubungkan rincian pesanan ke objek master data produk (ProductItem).
     *
     * @return BelongsTo
     */
    public function product(): BelongsTo
    {
        // Relasi: Banyak rincian pesanan (OrderItem) merujuk ke Satu produk hidangan (ProductItem)
        return $this->belongsTo(ProductItem::class, 'product_id', 'item_id');
    }

    /**
     * =========================================================================
     * METODE LOGIKA BISNIS PBO: getSubtotal()
     * =========================================================================
     * Menghitung total nilai transaksi untuk satu baris item (Harga Satuan x Jumlah Porsi).
     *
     * @return float Total subtotal baris dalam Rupiah
     */
    public function getSubtotal(): float
    {
        // Rumus: price * quantity
        return (float) ($this->price * $this->quantity);
    }
}

