<?php

namespace Database\Seeders;

use App\Models\Promotion;
use Illuminate\Database\Seeder;

/**
 * Class PromotionSeeder
 * 
 * Seeder ini bertanggung jawab untuk mengisi data banner promosi utama
 * dan banner informasi kampanye event bazar kuliner.
 */
class PromotionSeeder extends Seeder
{
    /**
     * Menjalankan proses seeding banner promosi ke database.
     *
     * @return void
     */
    public function run(): void
    {
        // Daftar data banner promosi toko
        $promos = [
            [
                'promotion_id' => 'promo-1', // Primary key custom string
                'title' => 'Pesta Kuliner Kemerdekaan Diskon s/d 50%', // Judul utama banner
                'subtitle' => 'Nikmati kelezatan aneka olahan ayam bakar dan jus buah segar dengan promo merdeka.', // Sub-judul
                'tag' => 'Spesial Agustus', // Tag highlight
                'badge' => 'Active', // Status tampilan ('Active', 'Scheduled', 'Ended')
                'image' => '/images/ayam_bakar.jpg', // Gambar ilustrasi promosi
                'duration' => '1 - 31 Agustus 2026', // Teks periode masa promosi
                'type' => 'Banner Utama', // Jenis banner
                'used_count' => 120, // Jumlah kuota terpakai
                'total_limit' => 500, // Total kuota promosi
                'is_active' => true, // Flag aktif
            ],
            [
                'promotion_id' => 'promo-2',
                'title' => 'Bazar Kuliner Bojong Gede & Promo Weekend Hemat',
                'subtitle' => 'Kunjungi booth offline kami di Bazar Puri Bojong Lestari atau pesan langsung via website.',
                'tag' => 'Event Bazar',
                'badge' => 'Active',
                'image' => '/images/paket_hemat.jpg',
                'duration' => 'Setiap Sabtu & Minggu',
                'type' => 'Banner Event',
                'used_count' => 85,
                'total_limit' => 300,
                'is_active' => true,
            ],
        ];

        // Menyimpan data banner promosi ke database
        foreach ($promos as $p) {
            Promotion::updateOrCreate(
                ['promotion_id' => $p['promotion_id']],
                $p
            );
        }
    }
}
