<?php

// -----------------------------------------------------------------------------
// NAMESPACE: Mengelompokkan class User ke dalam namespace App\Models.
// Konsep PBO: Isolasi identitas entitas pengguna sistem.
// -----------------------------------------------------------------------------
namespace App\Models;

// -----------------------------------------------------------------------------
// IMPORT DEPENDENCY: Mengimpor basis class Authenticatable & Traits keamanan.
// Konsep PBO: Multi-level Inheritance & Trait Composition.
// -----------------------------------------------------------------------------
use Illuminate\Database\Eloquent\Factories\HasFactory;       // Trait untuk factory database seeder
use Illuminate\Database\Eloquent\Relations\HasMany;         // Tipe relasi One-to-Many
use Illuminate\Foundation\Auth\User as Authenticatable;     // SUPERCLASS: Pewarisan autentikasi user Laravel
use Illuminate\Notifications\Notifiable;                    // Trait untuk pengiriman email notifikasi
use Laravel\Sanctum\HasApiTokens;                           // Trait manajemen Bearer Token Sanctum

/**
 * =============================================================================
 * CLASS: User (Pemrograman Berorientasi Objek / PBO)
 * =============================================================================
 * Blueprint objek akun pengguna (Customer, Admin, Staff Dapur, Kasir).
 *
 * Konsep PBO yang Diterapkan:
 * 1. INHERITANCE   : Mewarisi 'Authenticatable' untuk otentikasi login terenkripsi.
 * 2. TRAIT MIXIN   : Mengadopsi 'HasApiTokens' untuk penerbitan token Bearer API.
 * 3. ENKAPSULASI   : Menyembunyikan password mentah via $hidden & auto hashing.
 * 4. ASOSIASI      : Relasi One-to-Many ke UserAddress dan Order.
 * =============================================================================
 */
class User extends Authenticatable
{
    // Komposisi trait otentikasi Sanctum dan Notifikasi
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * ENKAPSULASI MASS ASSIGNMENT ($fillable):
     * Kolom-kolom profil yang diizinkan untuk diisi secara massal saat registrasi/update.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',           // String (100) Nama lengkap pengguna
        'email',          // String (150) Alamat surel unik untuk autentikasi login
        'password',       // String (255) Kata sandi yang tersimpan dalam format hash
        'role',           // ENUM Peran pengguna: 'admin', 'customer', 'staff', 'cashier'
        'gender',         // ENUM Jenis kelamin: 'Laki-laki', 'Perempuan', 'Lainnya'
        'birth_date',     // DATE Tanggal lahir pengguna (YYYY-MM-DD)
        'last_login_at',  // DATETIME Waktu terakhir kali pengguna login ke aplikasi
        'phone',          // String (20) Nomor telepon / WhatsApp
        'avatar',         // String URL foto profil pengguna
        'is_active',      // BOOLEAN Status keaktifan akun (true: Aktif, false: Ditangguhkan)
        'login_count',    // UNSIGNED INTEGER Counter jumlah total login yang dilakukan
    ];

    /**
     * ENKAPSULASI PRIVASI ($hidden):
     * Kolom sensitif yang disembunyikan dan TIDAK akan pernah diekspos ke JSON output API.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',       // Password hash disembunyikan demi keamanan
        'remember_token', // Remember token disembunyikan
    ];

    /**
     * ENKAPSULASI CASTING TIPE DATA (casts):
     * Mengonversi atribut tabel ke tipe data spesifik PHP & hashing otomatis kata sandi.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',  // Dikonversi ke objek DateTime Carbon
            'birth_date'        => 'date',      // Dikonversi ke objek Date Carbon
            'last_login_at'     => 'datetime',  // Dikonversi ke objek DateTime Carbon
            'is_active'         => 'boolean',   // Dikonversi ke boolean (true/false)
            'login_count'       => 'integer',   // Dikonversi ke integer
            'password'          => 'hashed',    // Otomatis di-hash menggunakan algoritma Bcrypt/Argon2id
        ];
    }

    /**
     * =========================================================================
     * RELASI PBO: HasMany (One-to-Many) ke Model UserAddress
     * =========================================================================
     * Mengaitkan satu pengguna dengan banyak buku alamat pengantaran.
     *
     * @return HasMany
     */
    public function addresses(): HasMany
    {
        // Relasi: Satu pengguna (User) dapat menyimpan banyak alamat pengiriman (UserAddress)
        return $this->hasMany(UserAddress::class);
    }

    /**
     * =========================================================================
     * RELASI PBO: HasMany (One-to-Many) ke Model Order
     * =========================================================================
     * Mengaitkan satu pengguna dengan seluruh riwayat transaksi pesanannya.
     *
     * @return HasMany
     */
    public function orders(): HasMany
    {
        // Relasi: Satu pengguna (User) memiliki banyak transaksi pesanan (Order)
        return $this->hasMany(Order::class, 'user_id', 'id');
    }

    /**
     * =========================================================================
     * METODE LOGIKA BISNIS PBO: isAdmin()
     * =========================================================================
     * Memeriksa apakah objek pengguna memiliki hak akses Administrator.
     *
     * @return bool True jika role adalah 'admin', False jika pelanggan biasa
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}

