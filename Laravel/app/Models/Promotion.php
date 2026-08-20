<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model Promotion
 * 
 * Model Eloquent ini merepresentasikan tabel 'promotions' di database.
 * Bertanggung jawab mengelola banner promosi visual, event bazar offline,
 * periode tanggal aktif, serta batas kuota penukaran promosi.
 */
class Promotion extends Model
{
    use SoftDeletes;

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
        'promotion_id', // ID unik promosi (contoh: "promo-1")
        'title',        // Judul utama banner kampanye promosi
        'subtitle',     // Sub-judul atau penjelasan singkat promo
        'tag',          // Tag kategori banner (contoh: "Spesial Agustus", "Event Bazar")
        'badge',        // Label status visual ("Active", "Scheduled", "Ended")
        'image',        // URL file gambar banner promosi
        'duration',     // Keterangan periode masa aktif promosi
        'type',         // Tipe penempatan banner ("Banner Utama", "Banner Event", dsb)
        'used_count',   // Jumlah kuota promosi yang telah diklaim
        'total_limit',  // Batas maksimal kuota penukaran
        'is_active',    // Status aktif/tidaknya banner (true/false)
    ];

    /**
     * Konversi tipe data otomatis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'used_count' => 'integer',
        'total_limit' => 'integer',
        'is_active' => 'boolean',
    ];
}
