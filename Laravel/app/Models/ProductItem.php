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
    // Menggunakan trait SoftDeletes agar penghapusan data bersifat sementara (dapat dipulihkan)
    use SoftDeletes;

    // Mengatur Primary Key menggunakan string custom (contoh: "PROD-001")
    protected $primaryKey = 'item_id';
    // Menandakan bahwa primary key tidak bertipe auto-increment integer
    public $incrementing = false;
    // Menentukan tipe data dari primary key adalah string
    protected $keyType = 'string';

    /**
     * Daftar kolom tabel yang diizinkan untuk diisi secara massal (Mass Assignment).
     *
     * @var list<string>
     */
    protected $fillable = [
        'item_id',         // ID unik produk (contoh: "PROD-001")
        'sku',             // Kode Stock Keeping Unit pergudangan (contoh: "NK-AYM-01")
        'name',            // Nama lengkap menu hidangan
        'category',        // Nama kategori menu (Makanan Utama, Minuman, Rice Bowl, dll)
        'price',           // Harga dasar hidangan dalam Rupiah (Rp)
        'discount',        // Besaran potongan diskon produk dalam persen (%)
        'stock',           // Sisa jumlah ketersediaan stok fisik produk
        'visibility',      // Status tampil di etalase katalog pengunjung (true/false)
        'status',          // Status ketersediaan ("Active", "Low Stock", "Inactive")
        'rating',          // Nilai rata-rata rating ulasan (1.0 - 5.0)
        'reviews_count',   // Total akumulasi jumlah ulasan yang diterima
        'sold_count',      // Label teks akumulasi produk terjual (contoh: "150 Terjual")
        'image',           // Path URL file gambar utama produk
        'gallery',         // Array URL foto-foto galeri pendukung (format JSON di DB)
        'description',     // Deskripsi lengkap cita rasa dan keunggulan hidangan
        'badge',           // Label lencana promosi ("BEST SELLER", "TERPOPULER", dll)
        'ingredients',     // Daftar komposisi bahan makanan
        'usage_advice',    // Saran penyajian atau petunjuk penyimpanan
        'calories',        // Informasi kandungan kalori makanan (contoh: "420 kcal")
        'fat',             // Informasi kandungan lemak (contoh: "14g")
        'sugar',           // Informasi kandungan gula (contoh: "5g")
        'sat_fat',         // Informasi kandungan lemak jenuh
        'max_delivery_km', // Batas maksimal jarak antar aman dari Central Kitchen (km)
    ];

    /**
     * Konversi tipe data otomatis (Casting) saat membaca data dari database.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'float',             // Mengubah harga ke tipe data desimal float
        'discount' => 'float',          // Mengubah diskon ke tipe data desimal float
        'stock' => 'integer',           // Mengubah stok ke tipe data integer
        'visibility' => 'boolean',      // Mengubah visibilitas ke tipe data boolean
        'rating' => 'float',            // Mengubah rating ke tipe data desimal float
        'reviews_count' => 'integer',   // Mengubah jumlah ulasan ke tipe integer
        'gallery' => 'array',           // Mengubah JSON galeri menjadi array PHP native
        'max_delivery_km' => 'integer', // Mengubah jarak maksimal ke tipe integer
    ];

    /**
     * Relasi One-to-Many: Satu produk memiliki banyak ulasan pelanggan (Review).
     *
     * @return HasMany
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'product_id', 'item_id');
    }

    /**
     * Relasi One-to-Many: Satu produk dapat tercatat di banyak rincian pesanan (OrderItem).
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
        // Jika produk memiliki persentase diskon di atas 0%
        if ($this->discount > 0) {
            // Hitung harga diskon dan bulatkan ke bilangan terdekat
            return round($this->price - ($this->price * ($this->discount / 100)));
        }
        // Jika tidak ada diskon, kembalikan harga dasar asli
        return (float) $this->price;
    }

    /**
     * Metode Bisnis PBO: Mengurangi kuantitas stok produk saat pesanan berhasil dibuat
     * dan memperbarui status ketersediaan barang secara otomatis.
     *
     * @param int $quantity Jumlah unit yang dipesan
     * @return bool True jika pengurangan berhasil, False jika stok tidak mencukupi
     */
    public function reduceStock(int $quantity): bool
    {
        // Periksa apakah stok yang ada mencukupi permintaan pesanan
        if ($this->stock >= $quantity) {
            $this->stock -= $quantity;
            $this->updateStockStatus(); // Perbarui status Active / Low Stock / Inactive
            return $this->save();
        }
        return false;
    }

    /**
     * Metode Bisnis PBO: Mengembalikan kuantitas stok produk saat pesanan dibatalkan/direfund.
     *
     * @param int $quantity Jumlah unit yang dikembalikan
     * @return bool
     */
    public function restoreStock(int $quantity): bool
    {
        $this->stock += $quantity;
        $this->updateStockStatus();
        return $this->save();
    }

    /**
     * Metode Bisnis PBO: Menentukan status kelangkaan stok secara dinamis berdasarkan sisa unit.
     *
     * @return void
     */
    public function updateStockStatus(): void
    {
        if ($this->stock <= 0) {
            $this->stock = 0;
            $this->status = 'Inactive'; // Stok habis, status menjadi Inactive
        } elseif ($this->stock <= 5) {
            $this->status = 'Low Stock'; // Stok menipis (<= 5 unit), status menjadi Low Stock
        } else {
            $this->status = 'Active'; // Stok aman, status menjadi Active
        }
    }

    /**
     * Metode Bisnis PBO: Menghitung ulang nilai rata-rata rating kepuasan pelanggan
     * berdasarkan seluruh ulasan yang telah disetujui (Approved / Published).
     *
     * @return void
     */
    public function recalculateRating(): void
    {
        // Ambil ulasan produk yang disetujui
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
            $this->rating = 5.0; // Default rating awal 5.0
            $this->reviews_count = 0;
        }
        $this->save();
    }
}
