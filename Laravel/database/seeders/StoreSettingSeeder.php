<?php

namespace Database\Seeders;

use App\Models\StoreSetting;
use Illuminate\Database\Seeder;

/**
 * Class StoreSettingSeeder
 * 
 * Seeder ini bertanggung jawab untuk menginisialisasi parameter konfigurasi toko,
 * profil brand, titik koordinat Central Kitchen untuk kalkulasi jarak Haversine,
 * tarif ongkos kirim, dan tarif pajak restoran PB1.
 */
class StoreSettingSeeder extends Seeder
{
    /**
     * Menjalankan proses seeding konfigurasi pengaturan toko.
     *
     * @return void
     */
    public function run(): void
    {
        // Daftar konfigurasi parameter sistem toko
        $settings = [
            ['key' => 'store_name', 'value' => 'Nefakky Marketplace & Catering', 'group' => 'general', 'description' => 'Nama brand toko kuliner'],
            ['key' => 'store_tagline', 'value' => 'Rasa Autentik Tradisional, Kualitas Bintang Lima', 'group' => 'general', 'description' => 'Slogan brand toko'],
            ['key' => 'kitchen_lat', 'value' => '-6.4789', 'group' => 'kitchen', 'description' => 'Latitude Central Kitchen (Bojong Gede, Bogor)'],
            ['key' => 'kitchen_lon', 'value' => '106.7912', 'group' => 'kitchen', 'description' => 'Longitude Central Kitchen (Bojong Gede, Bogor)'],
            ['key' => 'kitchen_address', 'value' => 'Puri Bojong Lestari AF No 41, Bojong Gede, Bogor', 'group' => 'kitchen', 'description' => 'Alamat fisik Central Kitchen'],
            ['key' => 'contact_phone', 'value' => '+6281234567890', 'group' => 'general', 'description' => 'Nomor WhatsApp / CS Toko'],
            ['key' => 'contact_email', 'value' => 'admin@nefakky.com', 'group' => 'general', 'description' => 'Email Resmi Toko'],
            ['key' => 'base_shipping_fee', 'value' => '8000', 'group' => 'shipping', 'description' => 'Biaya ongkir dasar (0-3 km)'],
            ['key' => 'per_km_shipping_fee', 'value' => '2000', 'group' => 'shipping', 'description' => 'Biaya ongkir tambahan per km'],
            ['key' => 'max_delivery_range_km', 'value' => '25', 'group' => 'shipping', 'description' => 'Batas maksimal radius pengantaran aman'],
            ['key' => 'tax_rate_percent', 'value' => '10', 'group' => 'tax', 'description' => 'Pajak Restoran PB1 (Persen)'],
        ];

        // Menyimpan data konfigurasi ke tabel store_settings
        foreach ($settings as $s) {
            StoreSetting::updateOrCreate(
                ['key' => $s['key']],
                $s
            );
        }
    }
}
