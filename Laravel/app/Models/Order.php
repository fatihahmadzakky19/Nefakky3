<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model Order
 * 
 * Model Eloquent ini merepresentasikan tabel 'orders' di database.
 * Bertanggung jawab mengelola alur status transaksi pesanan 5-tahap,
 * relasi item belanjaan, pembatalan pesanan, serta integrasi pemulihan stok produk.
 */
class Order extends Model
{
    use SoftDeletes;

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
        'order_id',             // Kode ID pesanan unik (contoh: "ORD-88219")
        'user_id',              // Foreign Key ke tabel users (opsional untuk tamu)
        'customer_name',        // Nama penerima pesanan
        'customer_email',       // Alamat email pelanggan
        'avatar',               // URL avatar profil pemesan
        'address',              // Alamat lengkap tujuan pengiriman
        'phone',                // Nomor WhatsApp / HP penerima yang dapat dihubungi
        'item_count',           // Jumlah total porsi/item yang dipesan
        'payment_method',       // Metode pembayaran yang dipilih (Midtrans QRIS, Transfer BCA, dll)
        'payment_badge',        // Status pembayaran ("PENDING", "PAID", "EXPIRED", "FAILED")
        'delivery_type',        // Tipe pengiriman ("STANDARD", "EXPRESS")
        'status',               // Tahap alur pesanan ("RECEIVED", "COOKING", "READY", "DELIVERING", "COMPLETED", "CANCELLED")
        'subtotal',             // Total harga makanan sebelum ongkir dan diskon
        'shipping_cost',        // Biaya ongkos kirim hasil kalkulasi jarak Haversine
        'discount',             // Nilai potongan harga dari voucher promo
        'total',                // Total tagihan akhir yang wajib dibayar
        'customer_confirmed',   // Boolean flag apakah pembeli telah mengonfirmasi terima barang
        'confirmed_at',         // Timestamp saat pembeli menekan konfirmasi terima
        'proof_photo',          // URL foto bukti serah terima pesanan dari kurir
        'payment_proof_photo',  // URL foto bukti transfer pembayaran manual
        'voucher_code',         // Kode voucher yang digunakan
        'applied_promo',        // Judul promo yang diterapkan
        'notes',                // Catatan instruksi khusus untuk koki/kurir (contoh: "Jangan pedas")
    ];

    /**
     * Konversi tipe data otomatis (Casting).
     *
     * @var array<string, string>
     */
    protected $casts = [
        'subtotal' => 'float',
        'shipping_cost' => 'float',
        'discount' => 'float',
        'total' => 'float',
        'item_count' => 'integer',
        'customer_confirmed' => 'boolean',
        'confirmed_at' => 'datetime',
    ];

    /**
     * Relasi Many-to-One: Pesanan terkait dengan satu akun pengguna (User).
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Relasi One-to-Many: Satu pesanan memiliki banyak rincian item (OrderItem).
     *
     * @return HasMany
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'order_id');
    }

    /**
     * Metode Bisnis PBO: Memajukan status pesanan ke tahap berikutnya secara otomatis
     * berdasarkan alur 5-tahap (RECEIVED -> COOKING -> READY -> DELIVERING -> COMPLETED).
     *
     * @return string Status baru setelah dimajukan
     */
    public function advanceStatus(): string
    {
        $currentIndex = array_search($this->status, self::STAGES);

        // Jika status saat ini valid dan belum mencapai status COMPLETED
        if ($currentIndex !== false && $currentIndex < count(self::STAGES) - 1) {
            $nextStatus = self::STAGES[$currentIndex + 1];
            $this->status = $nextStatus;

            // Jika status mencapai COMPLETED, set flag konfirmasi dan timestamp
            if ($nextStatus === 'COMPLETED') {
                $this->customer_confirmed = true;
                $this->confirmed_at = now();
            }

            $this->save();
            return $nextStatus;
        }

        return $this->status;
    }

    /**
     * Metode Bisnis PBO: Mengonfirmasi bahwa pesanan telah diterima secara baik oleh pembeli.
     *
     * @return bool
     */
    public function confirmReceived(): bool
    {
        $this->customer_confirmed = true;
        $this->confirmed_at = now();
        $this->status = 'COMPLETED';
        return $this->save();
    }

    /**
     * Metode Bisnis PBO: Membatalkan pesanan serta mengembalikan kuantitas stok seluruh item produk terkait.
     *
     * @return bool
     */
    public function cancelOrder(): bool
    {
        // Hanya pesanan yang belum selesai atau belum dibatalkan yang boleh dibatalkan
        if ($this->status !== 'CANCELLED' && $this->status !== 'COMPLETED') {
            $this->status = 'CANCELLED';

            // Memulihkan stok untuk setiap item produk dalam pesanan
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
