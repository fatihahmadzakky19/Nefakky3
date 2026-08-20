<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model StoreSetting
 * 
 * Model Eloquent ini merepresentasikan tabel 'store_settings' di database.
 * Menyimpan konfigurasi key-value untuk parameter toko, kelompok pengaturan (enum),
 * tipe data value (enum), dan flag status publik (boolean).
 */
class StoreSetting extends Model
{
    /**
     * Kolom-kolom yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'key',         // String (50) unik
        'value',       // TEXT
        'group',       // ENUM: 'general', 'kitchen', 'shipping', 'tax', 'payment', 'system'
        'type',        // ENUM: 'string', 'number', 'boolean', 'json'
        'description', // String (255)
        'is_public',   // BOOLEAN
    ];

    /**
     * Konversi tipe data otomatis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_public' => 'boolean',
    ];

    /**
     * Helper Static PBO: Mengambil nilai pengaturan berdasarkan kuncinya.
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Helper Static PBO: Menyimpan atau memperbarui nilai pengaturan.
     *
     * @param string $key
     * @param mixed $value
     * @param string $group
     * @return self
     */
    public static function set(string $key, $value, string $group = 'general')
    {
        return self::updateOrCreate(
            ['key' => $key],
            ['value' => (string) $value, 'group' => $group]
        );
    }
}
