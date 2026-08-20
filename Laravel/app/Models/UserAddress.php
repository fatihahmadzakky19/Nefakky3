<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model UserAddress
 * 
 * Model Eloquent ini merepresentasikan tabel 'user_addresses' di database.
 * Mengelola buku alamat multi-lokasi pelanggan (Rumah, Kantor, Apartemen),
 * nama dan nomor HP penerima, titik koordinat GPS decimal(10, 7), serta status alamat default.
 */
class UserAddress extends Model
{
    /**
     * Kolom-kolom yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',        // Foreign key
        'label',          // String (50)
        'label_type',     // ENUM: 'Rumah', 'Kantor', 'Apartemen', 'Kos', 'Lainnya'
        'receiver_name',  // String (100)
        'receiver_phone', // String (20)
        'address',        // TEXT
        'postal_code',    // String (10)
        'latitude',       // DECIMAL (10, 7)
        'longitude',      // DECIMAL (10, 7)
        'notes',          // String (255)
        'is_default',     // BOOLEAN
        'last_used_at',   // DATETIME
    ];

    /**
     * Konversi tipe data otomatis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_default' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
        'last_used_at' => 'datetime',
    ];

    /**
     * Relasi Many-to-One ke User.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
