<?php

// Namespace penempat Model dalam struktur folder Laravel Eloquent
namespace App\Models;

// Mengimpor kelas dasar Model dari Eloquent ORM Laravel
use Illuminate\Database\Eloquent\Model;

// Class Model ProductItem yang merepresentasikan tabel 'product_items' di database
class ProductItem extends Model
{
    // Mengatur nama Primary Key khusus yaitu 'item_id' (bukan id bawaan)
    protected $primaryKey = 'item_id';
    // Menandakan bahwa primary key berbentuk string/custom, bukan auto-increment integer
    public $incrementing = false;
    // Menentukan tipe data dari Primary Key adalah string
    protected $keyType = 'string';

    // Daftar kolom tabel yang diizinkan untuk diisi secara massal (Mass Assignment)
    protected $fillable = [
        'item_id', // ID unik produk (cth: "prod-001")
        'sku', // Kode Stock Keeping Unit (cth: "SKU-BEEF-01")
        'name', // Nama menu makanan/minuman
        'category', // Kategori menu (Kebab, Beverage, Rice Bowl, dll)
        'price', // Harga dasar produk (Rp)
        'discount', // Diskon produk dalam persen (%)
        'stock', // Jumlah sisa stok produk
        'visibility', // Status keterlihatan produk di katalog (true/false)
        'status', // Status kondisi stok ("In Stock", "Low Stock", "Inactive")
        'rating', // Nilai rata-rata rating (1.0 - 5.0)
        'reviews_count', // Total jumlah ulasan yang diterima produk
        'sold_count', // Jumlah akumulasi produk yang telah terjual
        'image', // URL/Path file gambar produk
        'description', // Deskripsi lengkap produk
        'badge', // Badge penanda produk (cth: "Best Seller", "Chef Pick")
        'ingredients', // Daftar bahan/komposisi utama
        'usage_advice', // Saran penyajian/penyimpanan
        'calories', // Informasi nilai kalori (cth: "450 kcal")
        'fat', // Informasi kandungan lemak (cth: "18g")
        'sugar', // Informasi kandungan gula (cth: "4g")
    ];

    // Konversi tipe data otomatis (Casting) saat membaca data dari database
    protected $casts = [
        'price' => 'float', // Konversi harga ke tipe desimal/float
        'discount' => 'float', // Konversi diskon ke tipe desimal/float
        'stock' => 'integer', // Konversi stok ke tipe integer
        'visibility' => 'boolean', // Konversi visibilitas ke tipe boolean (true/false)
        'rating' => 'float', // Konversi rating ke tipe desimal/float
        'reviews_count' => 'integer', // Konversi jumlah ulasan ke tipe integer
    ];

    /**
     * Metode PBO: Hitung harga akhir produk setelah dipotong persen diskon
     */
    public function getFinalPrice(): float
    {
        // Jika terdapat persen diskon lebih dari 0
        if ($this->discount > 0) {
            // Hitung harga setelah diskon dan bulatkan ke angka terdekat
            return round($this->price - ($this->price * ($this->discount / 100)));
        }
        // Jika tidak ada diskon, kembalikan harga asli
        return $this->price;
    }

    /**
     * Metode PBO: Pengurangan stok otomatis dan pembaruan status kelangkaan barang secara dinamis
     */
    public function reduceStock(int $quantity): bool
    {
        // Periksa apakah jumlah stok yang tersedia mencukupi permintaan pesanan
        if ($this->stock >= $quantity) {
            // Kurangi nilai stok sejumlah kuantitas pesanan
            $this->stock -= $quantity;
            // Jika stok habis (0), ubah status menjadi Inactive
            if ($this->stock == 0) {
                $this->status = 'Inactive';
            } elseif ($this->stock <= 5) { // Jika stok menipis (<= 5), ubah status menjadi Low Stock
                $this->status = 'Low Stock';
            }
            // Simpan perubahan ke database dan kembalikan nilai boolean true (sukses)
            return $this->save();
        }
        // Jika stok tidak mencukupi, kembalikan nilai false (gagal)
        return false;
    }
}

