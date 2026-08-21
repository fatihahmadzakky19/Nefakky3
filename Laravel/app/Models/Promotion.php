<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model Promotion
 * 
 * Model Eloquent ini merepresentasikan tabel 'promotions' di database.
 * Bertanggung jawab mengelola banner promosi visual, tipe penempatan banner,
 * periode datetime (start_datetime, end_datetime), serta prioritas tampilan.
 */
class Promotion extends Model
{
    // Mengatur Primary Key menggunakan string custom (contoh: "promo-1")
    protected $primaryKey = 'promotion_id';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Kolom-kolom yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'promotion_id',     // String (30)
        'title',            // String (150)
        'subtitle',         // String (255)
        'tag',              // String (50)
        'badge',            // ENUM: 'Active', 'Scheduled', 'Ended', 'Draft'
        'type',             // ENUM: 'Banner Utama', 'Banner Event', 'Popup Modal', 'Notification Bar'
        'image',            // String (500)
        'duration',         // String (100)
        'start_datetime',   // DATETIME
        'end_datetime',     // DATETIME
        'used_count',       // UNSIGNED INTEGER
        'total_limit',      // UNSIGNED INTEGER
        'display_priority', // UNSIGNED SMALLINTEGER
        'is_active',        // BOOLEAN
    ];

    /**
     * Konversi tipe data otomatis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'used_count' => 'integer',
        'total_limit' => 'integer',
        'display_priority' => 'integer',
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'is_active' => 'boolean',
    ];
}
