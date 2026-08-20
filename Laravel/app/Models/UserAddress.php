<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model UserAddress
 * 
 * Model Eloquent ini merepresentasikan tabel 'user_addresses' di database.
 * Mengelola buku alamat multi-lokasi pelanggan (Rumah, Kantor, Apartemen),
 * nama dan nomor HP penerima, titik koordinat, serta status alamat utama (default).
 */
class UserAddress extends Model
{
    /**
     * Kolom-kolom yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',        // Foreign key ke tabel users
        'label',          // Label nama alamat (contoh: "Rumah", "Kantor", "Apartemen")
        'receiver_name',  // Nama lengkap orang penerima paket
        'receiver_phone', // Nomor telepon / WhatsApp penerima
        'address',        // Alamat lengkap detail (jalan, nomor rumah, RT/RW)
        'latitude',       // Koordinat garis lintang (latitude)
        'longitude',      // Koordinat garis bujur (longitude)
        'notes',          // Petunjuk patokan kurir (contoh: "Pagar hitam depan pos satpam")
        'is_default',     // Boolean: apakah alamat ini merupakan alamat pengiriman utama
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
    ];

    /**
     * Relasi Many-to-One: Alamat ini dimiliki oleh satu akun pengguna (User).
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
