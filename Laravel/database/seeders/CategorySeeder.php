<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Class CategorySeeder
 * 
 * Seeder ini bertanggung jawab untuk mengisi data awal master kategori menu kuliner
 * pada database Nefakky Marketplace sesuai kategori di aplikasi frontend.
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
        $categories = [
            [
                'name' => 'Makanan Berat',
                'type' => 'Makanan',
                'display_order' => 1,
                'icon' => null,
                'description' => 'Hidangan utama lezat berenergi seperti Ayam Bakar, Nasi Bakar, dan Gudeg Komplit.',
            ],
            [
                'name' => 'Minuman',
                'type' => 'Minuman',
                'display_order' => 2,
                'icon' => null,
                'description' => 'Jus buah segar asli (Mangga, Sirsak, Jambu) dan aneka minuman penyegar dahaga.',
            ],
            [
                'name' => 'Menu Hemat',
                'type' => 'Paket',
                'display_order' => 3,
                'icon' => null,
                'description' => 'Pilihan hidangan tradisional nikmat dan hemat seperti Krecek pedas gurih dan Garang Asam segar.',
            ],
            [
                'name' => 'Rice Bowl',
                'type' => 'Makanan',
                'display_order' => 4,
                'icon' => null,
                'description' => 'Sajian nasi mangkuk praktis dengan aneka lauk topping gurih dan saus istimewa.',
            ],
            [
                'name' => 'Cemilan & Snack',
                'type' => 'Tambahan',
                'display_order' => 5,
                'icon' => null,
                'description' => 'Kudapan ringan renyah dan hidangan pembuka favorit keluarga.',
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['name' => $cat['name']],
                [
                    'slug' => Str::slug($cat['name']),
                    'type' => $cat['type'],
                    'display_order' => $cat['display_order'],
                    'icon' => $cat['icon'],
                    'description' => $cat['description'],
                    'is_active' => true,
                ]
            );
        }
    }
}
