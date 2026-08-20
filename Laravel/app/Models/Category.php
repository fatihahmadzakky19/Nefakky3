<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model Category
 * 
 * Model Eloquent ini merepresentasikan tabel 'categories' di database.
 * Bertanggung jawab mengelola klasifikasi master kategori menu (Makanan Utama,
 * Minuman, Rice Bowl, Cemilan, Paket Hemat) beserta slug SEO dan status aktif.
 */
class Category extends Model
{
    /**
     * Kolom-kolom yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',        // Nama kategori (contoh: "Makanan Utama")
        'slug',        // URL slug yang ramah SEO (contoh: "makanan-utama")
        'icon',        // Identifier ikon kategori
        'description', // Deskripsi singkat penjelasan kategori
        'is_active',   // Status ketersediaan kategori (true/false)
    ];

    /**
     * Konversi tipe data otomatis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Relasi One-to-Many: Satu kategori mengelompokkan banyak menu produk (ProductItem).
     *
     * @return HasMany
     */
    public function products(): HasMany
    {
        return $this->hasMany(ProductItem::class, 'category', 'name');
    }
}
