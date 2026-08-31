<?php

// -----------------------------------------------------------------------------
// NAMESPACE: Mengelompokkan class ProductItem ke dalam ruang lingkup model aplikasi.
// Konsep PBO: Struktur hierarki direktori & isolasi namespace class.
// -----------------------------------------------------------------------------
namespace App\Models;

// -----------------------------------------------------------------------------
// IMPORT DEPENDENCY: Mengimpor class dasar Eloquent & tipe relasi database.
// Konsep PBO: Pola Pewarisan (Inheritance) & Relasi Objek (Object Association).
// -----------------------------------------------------------------------------
use Illuminate\Database\Eloquent\Model;              // Superclass Eloquent Model
use Illuminate\Database\Eloquent\Relations\HasMany;  // Representasi Relasi One-to-Many

/**
 * =============================================================================
 * CLASS: ProductItem (Pemrograman Berorientasi Objek / PBO)
 * =============================================================================
 * Blueprint objek produk makanan & minuman di katalog kuliner Nefakky.
 *
 * Konsep PBO yang Diterapkan:
 * 1. INHERITANCE   : Mewarisi kapabilitas ORM database dari 'Model'.
 * 2. ENKAPSULASI   : Mengamankan properti & state transition (stok, status, rating).
 * 3. BUSINESS LOGIC: Perhitungan diskon, mutasi stok ACID, & agregasi rating.
 * 4. ASOSIASI      : Relasi One-to-Many ke Review dan OrderItem.
 * =============================================================================
 */
class ProductItem extends Model
{
    // -------------------------------------------------------------------------
    // ENKAPSULASI PRIMARY KEY: Menentukan kunci utama custom tabel
    // -------------------------------------------------------------------------
    // Menetapkan kolom 'item_id' sebagai primary key (contoh: "PROD-001")
    protected $primaryKey = 'item_id';
    
    // Memberitahu Eloquent bahwa ID produk menggunakan string custom (non-incrementing)
    public $incrementing = false;
    
    // Menetapkan tipe data primary key berupa string
    protected $keyType = 'string';

    /**
     * ENKAPSULASI MASS ASSIGNMENT ($fillable):
     * Membatasi atribut yang boleh diisi saat pembuatan/pembaruan objek produk.
     * Mencegah eksploitasi data sensitif di database.
     *
     * @var list<string>
     */
    protected $fillable = [
        'item_id',             // String (30) Primary Key Unik (e.g. "PROD-001")
        'sku',                 // String (40) Unik Stock Keeping Unit untuk audit gudang
        'name',                // String (150) Nama menu hidangan kuliner
        'category',            // String (50) Nama kategori menu (e.g. "Makanan Utama")
        'price',               // DECIMAL (12, 2) Harga reguler produk dalam Rupiah
        'discount',            // DECIMAL (5, 2) Persentase diskon promosi (0 - 100%)
        'stock',               // UNSIGNED INTEGER Jumlah ketersediaan porsi hidangan
        'visibility',          // BOOLEAN Status tayang di katalog (true: Tampil, false: Sembunyi)
        'status',              // ENUM: 'Active', 'Low Stock', 'Inactive'
        'portion_size',        // ENUM Ukuran porsi: 'Regular', 'Large', 'Jumbo', 'Family Pack'
        'rating',              // DECIMAL (3, 2) Skor kepuasan rata-rata pelanggan (1.0 - 5.0)
        'reviews_count',       // UNSIGNED INTEGER Total banyaknya ulasan yang disetujui
        'sold_units',          // UNSIGNED INTEGER Total porsi hidangan yang sudah terjual
        'sold_count',          // String label display di antarmuka (e.g. "120 Terjual")
        'image',               // String URL foto utama hidangan resolusi tinggi
        'gallery',             // JSON Array kumpulan URL foto galeri pendukung
        'description',         // TEXT Deskripsi lengkap bahan, rasa, & kelezatan makanan
        'badge',               // String lencana khusus (e.g. "BEST SELLER", "TERPOPULER")
        'ingredients',         // TEXT Rincian komposisi bahan baku hidangan
        'usage_advice',        // TEXT Petunjuk konsumsi & saran penyajian optimal
        'origin',              // TEXT Daerah asal kuliner nusantara (e.g. "Yogyakarta")
        'calories',            // String informasi gizi energi (e.g. "350 kcal")
        'fat',                 // String informasi kadar lemak (e.g. "12g")
        'sugar',               // String informasi kadar gula (e.g. "4g")
        'sat_fat',             // String informasi kadar lemak jenuh (e.g. "2g")
        'preparation_minutes', // UNSIGNED TINYINTEGER Waktu estimasi meracik makanan di dapur
        'max_delivery_km',     // UNSIGNED SMALLINTEGER Batas maksimal radius kirim aman (Km)
        'is_coming_soon',      // BOOLEAN Penanda menu yang akan segera diluncurkan
        'release_date',        // String tanggal peluncuran menu baru
        'restocked_at',        // DATETIME Waktu terakhir kali stok hidangan diisi ulang
    ];

    /**
     * ENKAPSULASI CASTING TIPE DATA ($casts):
     * Mengonversi atribut tabel ke tipe data spesifik PHP secara otomatis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'float',                     // Otomatis dikonversi ke float
        'discount' => 'float',                  // Otomatis dikonversi ke float
        'stock' => 'integer',                   // Otomatis dikonversi ke integer
        'visibility' => 'boolean',              // Otomatis dikonversi ke boolean
        'is_coming_soon' => 'boolean',          // Otomatis dikonversi ke boolean
        'rating' => 'float',                    // Otomatis dikonversi ke float
        'reviews_count' => 'integer',           // Otomatis dikonversi ke integer
        'sold_units' => 'integer',              // Otomatis dikonversi ke integer
        'preparation_minutes' => 'integer',     // Otomatis dikonversi ke integer
        'max_delivery_km' => 'integer',         // Otomatis dikonversi ke integer
        'gallery' => 'array',                   // Otomatis didekode dari JSON menjadi Array PHP
        'restocked_at' => 'datetime',           // Dikonversi ke objek DateTime Carbon
    ];

    /**
     * =========================================================================
     * RELASI PBO: HasMany (One-to-Many) ke Model Review
     * =========================================================================
     * Mengaitkan satu menu produk hidangan dengan banyak ulasan pelanggan.
     *
     * @return HasMany
     */
    public function reviews(): HasMany
    {
        // Relasi: Satu produk (ProductItem) memiliki banyak ulasan (Review)
        return $this->hasMany(Review::class, 'product_id', 'item_id');
    }

    /**
     * =========================================================================
     * RELASI PBO: HasMany (One-to-Many) ke Model OrderItem
     * =========================================================================
     * Mengaitkan satu menu produk dengan catatan transaksi pembelian pelanggan.
     *
     * @return HasMany
     */
    public function orderItems(): HasMany
    {
        // Relasi: Satu produk (ProductItem) dapat tercatat di banyak rincian pesanan (OrderItem)
        return $this->hasMany(OrderItem::class, 'product_id', 'item_id');
    }

    /**
     * =========================================================================
     * METODE LOGIKA BISNIS PBO: getFinalPrice()
     * =========================================================================
     * Menghitung harga bersih hidangan setelah dipotong persentase diskon.
     *
     * @return float Harga akhir dalam Rupiah
     */
    public function getFinalPrice(): float
    {
        // Jika terdapat diskon lebih dari 0%, hitung potongan harga
        if ($this->discount > 0) {
            // Rumus: Harga Asli - (Harga Asli * Diskon / 100)
            return round($this->price - ($this->price * ($this->discount / 100)));
        }
        
        // Kembalikan harga normal jika tidak ada diskon
        return (float) $this->price;
    }

    /**
     * =========================================================================
     * METODE LOGIKA BISNIS PBO: reduceStock()
     * =========================================================================
     * Mengenkapsulasi proses pengurangan stok produk saat pesanan berhasil dibuat,
     * memperbarui counter porsi terjual, dan mengevaluasi status ketersediaan.
     *
     * @param int $quantity Jumlah porsi yang dipesan
     * @return bool Status keberhasilan pemotongan stok
     */
    public function reduceStock(int $quantity): bool
    {
        // Validasi: Pastikan ketersediaan stok mencukupi kuantitas pembelian
        if ($this->stock >= $quantity) {
            // 1. Kurangi jumlah stok porsi makanan
            $this->stock -= $quantity;
            
            // 2. Tambah counter unit yang terjual
            $this->sold_units = ($this->sold_units ?? 0) + $quantity;
            $this->sold_count = "{$this->sold_units} Terjual";
            
            // 3. Evaluasi otomatis status barang (Active / Low Stock / Inactive)
            $this->updateStockStatus();
            
            // 4. Simpan mutasi state objek ke database
            return $this->save();
        }
        
        // Kembalikan false jika stok tidak mencukupi (Out of Stock)
        return false;
    }

    /**
     * =========================================================================
     * METODE LOGIKA BISNIS PBO: restoreStock()
     * =========================================================================
     * Mengenkapsulasi proses pemulihan stok produk saat pesanan dibatalkan (Cancel).
     *
     * @param int $quantity Jumlah porsi yang dikembalikan ke inventaris
     * @return bool
     */
    public function restoreStock(int $quantity): bool
    {
        // 1. Tambah kembali stok yang batal dibeli
        $this->stock += $quantity;
        
        // 2. Kurangi counter unit terjual jika valid
        if ($this->sold_units >= $quantity) {
            $this->sold_units -= $quantity;
            $this->sold_count = "{$this->sold_units} Terjual";
        }
        
        // 3. Perbarui status ketersediaan stok
        $this->updateStockStatus();
        
        // 4. Simpan perubahan ke database
        return $this->save();
    }

    /**
     * =========================================================================
     * METODE LOGIKA BISNIS PBO: updateStockStatus()
     * =========================================================================
     * Menentukan status kelangkaan stok produk secara otomatis berdasarkan sisa unit.
     *
     * @return void
     */
    public function updateStockStatus(): void
    {
        if ($this->stock <= 0) {
            $this->stock = 0;
            $this->status = 'Inactive';   // Stok habis -> status nonaktif
        } elseif ($this->stock <= 5) {
            $this->status = 'Low Stock';  // Sisa stok <= 5 -> beri status menipis (peringatan)
        } else {
            $this->status = 'Active';     // Stok aman (> 5) -> status aktif siap jual
        }
    }

    /**
     * =========================================================================
     * METODE LOGIKA BISNIS PBO: recalculateRating()
     * =========================================================================
     * Menghitung ulang rata-rata bintang (skor 1-5) dari seluruh relasi Review
     * yang telah disetujui oleh admin (APPROVED / PUBLISHED).
     *
     * @return void
     */
    public function recalculateRating(): void
    {
        // Ambil seluruh review yang telah berstatus PUBLISHED atau APPROVED
        $approvedReviews = $this->reviews()
            ->where(function ($q) {
                $q->where('status', 'PUBLISHED')->orWhere('status', 'APPROVED');
            })
            ->get();

        // Hitung total ulasan yang valid
        $count = $approvedReviews->count();
        if ($count > 0) {
            // Hitung nilai rata-rata rating dengan pembulatan 1 desimal
            $this->rating = round($approvedReviews->avg('rating'), 1);
            $this->reviews_count = $count;
        } else {
            // Nilai default jika belum ada ulasan sama sekali
            $this->rating = 5.0;
            $this->reviews_count = 0;
        }
        
        // Simpan pembaruan rating ke database
        $this->save();
    }
}

