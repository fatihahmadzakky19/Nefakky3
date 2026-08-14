<?php

// Namespace penempat Model dalam struktur folder Laravel Eloquent
namespace App\Models;

// Mengimpor UserFactory untuk pengujian data dummy
use Database\Factories\UserFactory;
// Mengimpor trait HasFactory untuk mendukung pembuatan data dummy via factory
use Illuminate\Database\Eloquent\Factories\HasFactory;
// Mengimpor kelas autentikasi Authenticatable untuk manajemen login pengguna
use Illuminate\Foundation\Auth\User as Authenticatable;
// Mengimpor trait Notifiable untuk pengiriman notifikasi ke email/sistem
use Illuminate\Notifications\Notifiable;

// Class Model User yang mengelola akun pengguna/pengguna terdaftar di aplikasi
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Kolom yang diizinkan untuk diisi secara massal saat registrasi/update
     *
     * @var list<string>
     */
    protected $fillable = [
        'name', // Nama pengguna
        'email', // Email pengguna
        'password', // Kata sandi pengguna (tersimpan dalam bentuk hash)
    ];

    /**
     * Kolom yang disembunyikan saat data user diubah ke format JSON/Array
     *
     * @var list<string>
     */
    protected $hidden = [
        'password', // Sembunyikan hash password dari response API demi keamanan
        'remember_token', // Sembunyikan token "remember me"
    ];

    /**
     * Aturan konversi otomatis (Casting) atribut model
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime', // Konversi tanggal verifikasi email ke datetime
            'password' => 'hashed', // Otomatis meng-hash password saat disimpan di DB
        ];
    }
}

