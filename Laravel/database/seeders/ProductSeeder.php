<?php

namespace Database\Seeders;

use App\Models\ProductItem;
use Illuminate\Database\Seeder;

/**
 * Class ProductSeeder
 * 
 * Seeder ini bertanggung jawab untuk mengisi data awal 6 hidangan menu kuliner utama Nefakky,
 * lengkap dengan harga, ketersediaan stok, nilai nutrisi, komposisi bahan, alamat asal produksi, dan badge.
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
        $defaultOrigin = 'Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Provinsi Jawa Barat, Indonesia';

        // 6 Hidangan Utama Sesuai Katalog Frontend Nefakky Marketplace
        $products = [
            [
                'item_id' => 'm1',
                'sku' => 'SKU-1001-AB',
                'name' => 'Ayam Bakar',
                'category' => 'Makanan Berat',
                'price' => 35000,
                'discount' => 0.00,
                'stock' => 34,
                'visibility' => true,
                'status' => 'Active',
                'portion_size' => 'Regular',
                'rating' => 4.9,
                'reviews_count' => 156,
                'sold_count' => '1.5k+ Terjual',
                'image' => '/images/ayam_bakar.jpg',
                'gallery' => ['/images/ayam_bakar.jpg'],
                'description' => 'Ayam pejantan pilihan dibakar dengan lumuran bumbu kecap rempah tradisional yang meresap hingga ke tulang.',
                'badge' => 'TERPOPULER',
                'ingredients' => 'Ayam Pejantan Segar, Kecap Rempah Bango, Bawang Merah, Bawang Putih, Ketumbar, Serai, Lengkuas.',
                'usage_advice' => 'Santap selagi hangat dengan nasi panas dan sambal terasi.',
                'origin' => $defaultOrigin,
                'calories' => '450 kcal',
                'fat' => '18g',
                'sugar' => '6g',
                'sat_fat' => '5g',
                'preparation_minutes' => 15,
                'max_delivery_km' => 25,
            ],
            [
                'item_id' => 'm2',
                'sku' => 'SKU-1002-NB',
                'name' => 'Nasi Bakar',
                'category' => 'Makanan Berat',
                'price' => 10000,
                'discount' => 0.00,
                'stock' => 25,
                'visibility' => true,
                'status' => 'Active',
                'portion_size' => 'Regular',
                'rating' => 4.8,
                'reviews_count' => 98,
                'sold_count' => '920 Terjual',
                'image' => '/images/nasi_bakar.jpg',
                'gallery' => ['/images/nasi_bakar.jpg'],
                'description' => 'Nasi gurih rempah dibungkus daun pisang dengan isian cumi pedas manis yang dibakar harum khas nusantara.',
                'badge' => 'BARU',
                'ingredients' => 'Beras Pulen, Santan, Cumi Segar, Cabai Rawit, Daun Kemangi, Daun Salam, Daun Pisang.',
                'usage_advice' => 'Buka bungkus daun pisang saat siap santap.',
                'origin' => $defaultOrigin,
                'calories' => '520 kcal',
                'fat' => '16g',
                'sugar' => '3g',
                'sat_fat' => '6g',
                'preparation_minutes' => 15,
                'max_delivery_km' => 25,
            ],
            [
                'item_id' => 'm3',
                'sku' => 'SKU-1003-KC',
                'name' => 'Krecek',
                'category' => 'Menu Hemat',
                'price' => 20000,
                'discount' => 0.00,
                'stock' => 40,
                'visibility' => true,
                'status' => 'Active',
                'portion_size' => 'Regular',
                'rating' => 4.9,
                'reviews_count' => 210,
                'sold_count' => '2.1k Terjual',
                'image' => '/images/krecek.jpg',
                'gallery' => ['/images/krecek.jpg'],
                'description' => 'Olahan krecek kulit sapi lembut dimasak dengan santan kental gurih, cabai rawit pedas, dan kacang tolo.',
                'badge' => 'TERPOPULER',
                'ingredients' => 'Krecek Kulit Sapi, Kacang Tolo, Santan Kelapa, Cabai Rawit Merah, Lengkuas, Daun Salam.',
                'usage_advice' => 'Sangat cocok disandingkan dengan Gudeg atau Nasi Hangat.',
                'origin' => $defaultOrigin,
                'calories' => '380 kcal',
                'fat' => '20g',
                'sugar' => '4g',
                'sat_fat' => '9g',
                'preparation_minutes' => 10,
                'max_delivery_km' => 25,
            ],
            [
                'item_id' => 'm4',
                'sku' => 'SKU-1004-GD',
                'name' => 'Gudeg',
                'category' => 'Makanan Berat',
                'price' => 10000,
                'discount' => 0.00,
                'stock' => 30,
                'visibility' => true,
                'status' => 'Active',
                'portion_size' => 'Regular',
                'rating' => 5.0,
                'reviews_count' => 312,
                'sold_count' => '3.5k Terjual',
                'image' => '/images/gudeg.jpg',
                'gallery' => ['/images/gudeg.jpg'],
                'description' => 'Nangka muda dimasak perlahan dengan santan dan gula jawa disajikan dengan telur bacem, suwiran ayam, dan krecek.',
                'badge' => 'BEST SELLER',
                'ingredients' => 'Nangka Muda (Gori), Gula Jawa Asli, Santan Kelapa, Telur Bebek Bacem, Ayam Suwir, Daun Jati.',
                'usage_advice' => 'Nikmati rasa manis gurih otentik ala Malioboro.',
                'origin' => $defaultOrigin,
                'calories' => '490 kcal',
                'fat' => '19g',
                'sugar' => '18g',
                'sat_fat' => '7g',
                'preparation_minutes' => 15,
                'max_delivery_km' => 25,
            ],
            [
                'item_id' => 'm5',
                'sku' => 'SKU-1005-GA',
                'name' => 'Garang Asam',
                'category' => 'Menu Hemat',
                'price' => 10000,
                'discount' => 0.00,
                'stock' => 20,
                'visibility' => true,
                'status' => 'Active',
                'portion_size' => 'Regular',
                'rating' => 4.8,
                'reviews_count' => 88,
                'sold_count' => '750 Terjual',
                'image' => '/images/garang_asam.jpg',
                'gallery' => ['/images/garang_asam.jpg'],
                'description' => 'Potongan ayam kampung segar dikukus dalam bungkus daun pisang dengan kuah santan asam segar, belimbing wulung, dan cabai rawit.',
                'badge' => 'BARU',
                'ingredients' => 'Ayam Kampung Segar, Belimbing Wulung, Tomat Hijau, Cabai Rawit Utuh, Santan Encer, Daun Pisang.',
                'usage_advice' => 'Kuah asam pedas gurih terasa nikmat disajikan hangat.',
                'origin' => $defaultOrigin,
                'calories' => '410 kcal',
                'fat' => '17g',
                'sugar' => '3g',
                'sat_fat' => '6g',
                'preparation_minutes' => 15,
                'max_delivery_km' => 25,
            ],
            [
                'item_id' => 'm6',
                'sku' => 'SKU-1006-JS',
                'name' => 'Jus Segar (Jambu, Sirsak, Mangga)',
                'category' => 'Minuman',
                'price' => 5000,
                'discount' => 0.00,
                'stock' => 50,
                'visibility' => true,
                'status' => 'Active',
                'portion_size' => 'Regular',
                'rating' => 4.9,
                'reviews_count' => 145,
                'sold_count' => '1.8k Terjual',
                'image' => '/images/jus_mangga.jpg',
                'gallery' => ['/images/jus_mangga.jpg', '/images/jus_sirsak.jpg', '/images/jus_jambu.jpg'],
                'description' => 'Pilihan aneka jus buah segar murni kaya vitamin: Mangga Harum Manis, Sirsak Segar, dan Jambu Biji Merah.',
                'badge' => 'BARU',
                'ingredients' => 'Buah Segar Pilihan (Mangga/Sirsak/Jambu), Air Mineral, Es Batu, Gula Tebu Alami.',
                'usage_advice' => 'Kocok dahulu sebelum diminum dan nikmati dalam keadaan dingin.',
                'origin' => $defaultOrigin,
                'calories' => '120 kcal',
                'fat' => '0g',
                'sugar' => '12g',
                'sat_fat' => '0g',
                'preparation_minutes' => 5,
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
