<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Model User
 * 
 * Model Eloquent ini merepresentasikan tabel 'users' di database.
 * Bertanggung jawab mengelola autentikasi pengguna (Admin & Pelanggan),
 * penerbitan Bearer Token via Laravel Sanctum, relasi multi-alamat pengiriman,
 * serta verifikasi role hak akses.
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
        'name',     // Nama lengkap pengguna
        'email',    // Alamat email unik untuk login
        'password', // Hash kata sandi akun
        'role',     // Hak akses akun: 'admin' atau 'customer'
        'phone',    // Nomor WhatsApp / HP pengguna
        'avatar',   // URL foto profil avatar
    ];

    /**
     * Kolom-kolom yang disembunyikan saat serialisasi JSON (keamanan).
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
            'password' => 'hashed',
        ];
    }

    /**
     * Relasi One-to-Many: Satu pengguna dapat menyimpan banyak alamat pengiriman (UserAddress).
     *
     * @return HasMany
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(UserAddress::class);
    }

    /**
     * Relasi One-to-Many: Satu pengguna dapat memiliki riwayat banyak transaksi pesanan (Order).
     *
     * @return HasMany
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'user_id', 'id');
    }

    /**
     * Metode Bisnis PBO: Memeriksa apakah pengguna memiliki hak akses Administrator.
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
