<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model Category
 * 
 * Model Eloquent ini merepresentasikan tabel 'categories' di database.
 * Bertanggung jawab mengelola klasifikasi kategori menu (Makanan, Minuman, Paket, Tambahan),
 * urutan tampilan (unsignedSmallInteger), slug SEO, dan status aktif.
 */
class Category extends Model
{
    /**
     * Kolom-kolom yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',          // String (50)
        'slug',          // String (60) unik
        'type',          // ENUM: 'Makanan', 'Minuman', 'Paket', 'Tambahan'
        'display_order', // UNSIGNED SMALLINTEGER
        'icon',          // String (100)
        'description',   // TEXT
        'is_active',     // BOOLEAN
    ];

    /**
     * Konversi tipe data otomatis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'display_order' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Relasi One-to-Many ke ProductItem.
     *
     * @return HasMany
     */
    public function products(): HasMany
    {
        return $this->hasMany(ProductItem::class, 'category', 'name');
    }
}
