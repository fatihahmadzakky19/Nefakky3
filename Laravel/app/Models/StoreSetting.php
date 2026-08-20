<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Model StoreSetting
 * 
 * Model Eloquent ini merepresentasikan tabel 'store_settings' di database.
 * Berfungsi sebagai penyimpan pasangan kunci-nilai (Key-Value) untuk parameter operasional
 * toko, seperti koordinat GPS Central Kitchen, tarif ongkir dasar, dan tarif pajak PB1.
 */
class StoreSetting extends Model
{
    /**
     * Kolom-kolom yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'key',         // Kunci unik konfigurasi (contoh: "kitchen_lat", "base_shipping_fee")
        'value',       // Nilai data konfigurasi
        'group',       // Kelompok konfigurasi (general, kitchen, shipping, tax)
        'description', // Deskripsi penjelasan kegunaan konfigurasi
    ];

    /**
     * Helper Static PBO: Mengambil nilai pengaturan berdasarkan kuncinya dengan nilai bawaan (fallback).
     *
     * @param string $key Kunci pengaturan
     * @param mixed $default Nilai default jika kunci tidak ditemukan
     * @return mixed Nilai konfigurasi
     */
    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Helper Static PBO: Menyimpan atau memperbarui nilai pengaturan secara instan.
     *
     * @param string $key Kunci pengaturan
     * @param mixed $value Nilai baru yang disimpan
     * @param string $group Kelompok konfigurasi
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
