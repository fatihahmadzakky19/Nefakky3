<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Class CategorySeeder
 * 
 * Seeder ini bertanggung jawab untuk mengisi data awal master kategori menu kuliner
 * pada database Nefakky Marketplace saat perintah 'php artisan migrate --seed' dijalankan.
 */
class CategorySeeder extends Seeder
{
    /**
     * Menjalankan proses seeding data kategori kuliner ke dalam database.
     *
     * @return void
     */
    public function run(): void
    {
        // Definisi data master kategori menu kuliner default
        $categories = [
            [
                'name' => 'Makanan Utama',
                'icon' => null,
                'description' => 'Hidangan utama lezat seperti olahan ayam bakar, bebek, dan menu spesial nusantara.',
            ],
            [
                'name' => 'Minuman',
                'icon' => null,
                'description' => 'Jus buah segar asli, mocktail, teh dingin, dan aneka minuman penyegar dahaga.',
            ],
            [
                'name' => 'Rice Bowl',
                'icon' => null,
                'description' => 'Sajian nasi hangat praktis dengan aneka lauk topping gurih dan saus istimewa.',
            ],
            [
                'name' => 'Cemilan & Snack',
                'icon' => null,
                'description' => 'Kudapan ringan renyah dan hidangan pembuka favorit keluarga.',
            ],
            [
                'name' => 'Paket Hemat',
                'icon' => null,
                'description' => 'Kombinasi makanan dan minuman dengan harga spesial lebih hemat.',
            ],
        ];

        // Melakukan perulangan untuk menyimpan atau memperbarui data kategori (mencegah duplikasi data)
        foreach ($categories as $cat) {
            Category::updateOrCreate(
                // Kriteria pencarian record berdasarkan nama kategori unik
                ['name' => $cat['name']],
                // Data yang diisi atau diperbarui
                [
                    'slug' => Str::slug($cat['name']), // Menghasilkan slug URL yang ramah SEO (cth: "makanan-utama")
                    'icon' => $cat['icon'], // Identifier icon kategori (disetel null untuk tampilan bersih)
                    'description' => $cat['description'], // Deskripsi penjelasan kategori
                    'is_active' => true, // Menandai kategori dalam kondisi aktif
                ]
            );
        }
    }
}
