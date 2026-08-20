<?php

namespace Database\Seeders;

use App\Models\ProductItem;
use Illuminate\Database\Seeder;

/**
 * Class ProductSeeder
 * 
 * Seeder ini bertanggung jawab untuk mengisi data awal katalog menu kuliner, harga,
 * status stok, informasi nutrisi, komposisi bahan, dan badge promosi.
 */
class ProductSeeder extends Seeder
{
    /**
     * Menjalankan proses seeding data menu makanan dan minuman.
     *
     * @return void
     */
    public function run(): void
    {
        // Daftar data produk kuliner lengkap dengan detail spesifikasi teknis dan nutrisi
        $products = [
            [
                'item_id' => 'PROD-001', // Primary key custom string
                'sku' => 'NK-AYM-01', // Kode identifikasi unik pergudangan / stok
                'name' => 'Ayam Bakar Madu Spesial Dapur Nefakky', // Nama lengkap hidangan
                'category' => 'Makanan Utama', // Relasi ke kategori menu
                'price' => 38000, // Harga dasar dalam Rupiah (Rp)
                'discount' => 10.00, // Potongan diskon dalam persen (%)
                'stock' => 50, // Sisa jumlah stok barang di dapur
                'visibility' => true, // Ditampilkan di etalase katalog pengunjung
                'status' => 'Active', // Status ketersediaan (Active / Low Stock / Inactive)
                'rating' => 4.9, // Nilai rata-rata kepuasan pelanggan (1 - 5)
                'reviews_count' => 120, // Total akumulasi ulasan
                'sold_count' => '150 Terjual', // Label teks jumlah terjual
                'image' => '/images/ayam_bakar.jpg', // Path gambar utama produk
                'gallery' => ['/images/ayam_bakar.jpg', '/images/ayam_bakar_detail.jpg'], // Galeri foto tambahan
                'description' => 'Ayam bakar pilihan diolah dengan bumbu rempah pilihan khas Jawa dan olesan madu murni hutan asli.',
                'badge' => 'BEST SELLER', // Penanda promo / highlight produk
                'ingredients' => 'Ayam Kampung, Madu Murni, Bawang Merah, Bawang Putih, Kecap Manis Tradisional, Rempah Nusantara',
                'usage_advice' => 'Sajikan hangat bersama sambal terasi dan lalapan segar.',
                'calories' => '420 kcal', // Nilai energi kalori per porsi
                'fat' => '14g', // Kandungan lemak total
                'sugar' => '5g', // Kandungan gula
                'sat_fat' => '3g', // Kandungan lemak jenuh
                'max_delivery_km' => 25, // Batas maksimal jarak antar pengiriman dari Central Kitchen
            ],
            [
                'item_id' => 'PROD-002',
                'sku' => 'NK-JUS-01',
                'name' => 'Jus Segar 3-Varian (Mangga, Sirsak, Jambu)',
                'category' => 'Minuman',
                'price' => 18000,
                'discount' => 0.00,
                'stock' => 100,
                'visibility' => true,
                'status' => 'Active',
                'rating' => 5.0,
                'reviews_count' => 85,
                'sold_count' => '210 Terjual',
                'image' => '/images/jus_mangga.jpg',
                'gallery' => ['/images/jus_mangga.jpg', '/images/jus_sirsak.jpg', '/images/jus_jambu.jpg'],
                'description' => 'Jus buah segar asli tanpa pemanis buatan dan tanpa pengawet. Tersedia dalam 3 varian rasa favorit.',
                'badge' => 'TERPOPULER',
                'ingredients' => 'Buah Asli Matang Pohon, Gula Tebu Alami, Air Mineral Higienis, Es Batu',
                'usage_advice' => 'Kocok perlahan sebelum diminum. Sebaiknya dikonsumsi dalam keadaan dingin.',
                'calories' => '180 kcal',
                'fat' => '0g',
                'sugar' => '12g',
                'sat_fat' => '0g',
                'max_delivery_km' => 25,
            ],
            [
                'item_id' => 'PROD-003',
                'sku' => 'NK-RB-01',
                'name' => 'Beef Teriyaki Rice Bowl Gurih',
                'category' => 'Rice Bowl',
                'price' => 42000,
                'discount' => 5.00,
                'stock' => 35,
                'visibility' => true,
                'status' => 'Active',
                'rating' => 4.8,
                'reviews_count' => 64,
                'sold_count' => '98 Terjual',
                'image' => '/images/beef_teriyaki.jpg',
                'gallery' => ['/images/beef_teriyaki.jpg'],
                'description' => 'Daging sapi iris tipis empuk dimasak saus teriyaki manis gurih khas Jepang disajikan di atas nasi pulen hangat.',
                'badge' => 'BARU',
                'ingredients' => 'Daging Sapi Shortplate US, Saus Teriyaki Autentik, Bawang Bombay, Nasi Melati Pulen, Wijen Sangrai',
                'usage_advice' => 'Aduk rata sebelum disantap agar saus teriyaki meresap sempurna.',
                'calories' => '520 kcal',
                'fat' => '18g',
                'sugar' => '7g',
                'sat_fat' => '6g',
                'max_delivery_km' => 20,
            ],
            [
                'item_id' => 'PROD-004',
                'sku' => 'NK-SNK-01',
                'name' => 'Dimsum Ayam Udang Kukus (Isi 4 Pcs)',
                'category' => 'Cemilan & Snack',
                'price' => 25000,
                'discount' => 0.00,
                'stock' => 60,
                'visibility' => true,
                'status' => 'Active',
                'rating' => 4.9,
                'reviews_count' => 92,
                'sold_count' => '180 Terjual',
                'image' => '/images/dimsum_ayam.jpg',
                'gallery' => ['/images/dimsum_ayam.jpg'],
                'description' => 'Dimsum olahan daging ayam cincang dan udang segar bertekstur kenyal juicy, disajikan dengan chili oil spesial.',
                'badge' => 'BEST SELLER',
                'ingredients' => 'Daging Paha Ayam, Udang Kupas Segar, Kulit Pangsit Halus, Daun Bawang, Minyak Wijen, Chili Oil',
                'usage_advice' => 'Celupkan ke dalam saus chili oil selagi hangat.',
                'calories' => '260 kcal',
                'fat' => '9g',
                'sugar' => '2g',
                'sat_fat' => '2g',
                'max_delivery_km' => 25,
            ],
            [
                'item_id' => 'PROD-005',
                'sku' => 'NK-PKT-01',
                'name' => 'Paket Hemat Kenyang (Ayam Bakar + Nasi + Jus Segar)',
                'category' => 'Paket Hemat',
                'price' => 52000,
                'discount' => 15.00,
                'stock' => 40,
                'visibility' => true,
                'status' => 'Active',
                'rating' => 5.0,
                'reviews_count' => 110,
                'sold_count' => '240 Terjual',
                'image' => '/images/paket_hemat.jpg',
                'gallery' => ['/images/paket_hemat.jpg'],
                'description' => 'Paket komplit super hemat: 1 Porsi Ayam Bakar Madu + Nasi Hangat + Sambal + Lalapan + 1 Cup Jus Buah Segar Pilihan.',
                'badge' => 'TERPOPULER',
                'ingredients' => 'Ayam Kampung Bakar Madu, Nasi Putih Pulen, Sambal Terasi, Lalapan, Jus Buah Asli',
                'usage_advice' => 'Sangat cocok untuk santap siang kantor maupun makan malam bersama keluarga.',
                'calories' => '680 kcal',
                'fat' => '15g',
                'sugar' => '14g',
                'sat_fat' => '4g',
                'max_delivery_km' => 25,
            ],
        ];

        // Menyimpan data produk ke database menggunakan updateOrCreate untuk mencegah duplikasi
        foreach ($products as $prod) {
            ProductItem::updateOrCreate(
                ['item_id' => $prod['item_id']],
                $prod
            );
        }
    }
}
