<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Model User
 * 
 * Model Eloquent ini merepresentasikan tabel 'users' di database.
 * Mengelola autentikasi pengguna (Admin, Staff, Customer), penerbitan Bearer Token Sanctum,
 * multi-alamat pengiriman, tanggal lahir (date), riwayat login (datetime), dan counter login (unsignedInteger).
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Kolom-kolom yang dapat diisi secara massal (Mass Assignment).
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',           // String (100)
        'email',          // String (150) unik
        'password',       // String (255)
        'role',           // ENUM: 'admin', 'customer', 'staff', 'cashier'
        'gender',         // ENUM: 'Laki-laki', 'Perempuan', 'Lainnya'
        'birth_date',     // DATE (YYYY-MM-DD)
        'last_login_at',  // DATETIME (YYYY-MM-DD HH:MM:SS)
        'phone',          // String (20)
        'avatar',         // String (500)
        'is_active',      // BOOLEAN
        'login_count',    // UNSIGNED INTEGER
    ];

    /**
     * Kolom-kolom yang disembunyikan saat serialisasi JSON.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Konversi tipe data otomatis.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'birth_date' => 'date',
            'last_login_at' => 'datetime',
            'is_active' => 'boolean',
            'login_count' => 'integer',
            'password' => 'hashed',
        ];
    }

    /**
     * Relasi One-to-Many ke UserAddress.
     *
     * @return HasMany
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(UserAddress::class);
    }

    /**
     * Relasi One-to-Many ke Order.
     *
     * @return HasMany
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'user_id', 'id');
    }

    /**
     * Metode Bisnis PBO: Cek apakah user adalah admin.
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
