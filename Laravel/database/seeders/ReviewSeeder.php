<?php

namespace Database\Seeders;

use App\Models\Review;
use Illuminate\Database\Seeder;

/**
 * Class ReviewSeeder
 * 
 * Seeder ini bertanggung jawab untuk mengisi data ulasan pelanggan awal,
 * penilaian rating bintang (1-5), lencana status pengulas, dan balasan dari penjual.
 */
class ReviewSeeder extends Seeder
{
    /**
     * Menjalankan proses seeding data ulasan dan rating produk.
     *
     * @return void
     */
    public function run(): void
    {
        // Daftar data testimoni pelanggan awal beserta lampiran dan tanggapan admin
        $reviews = [
            [
                'review_id' => 'REV-001',
                'product_id' => 'PROD-001', // Terkait ke menu Ayam Bakar Madu
                'author_name' => 'Siti Rahmawati',
                'author_email' => 'siti@example.com',
                'author_badge' => 'PLATINUM', // Lencana loyalitas pelanggan
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
                'rating' => 5, // Rating bintang 5
                'date' => 'Kemarin',
                'product_name' => 'Ayam Bakar Madu Spesial Dapur Nefakky',
                'product_image' => '/images/ayam_bakar.jpg',
                'comment' => 'Daging ayamnya sangat empuk, bumbu madunya meresap sampai ke tulang! Sambalnya juga mantap pedas gurihnya.',
                'likes_count' => 18, // Jumlah like yang didapatkan ulasan
                'status' => 'PUBLISHED', // Status tampil di publik
                'is_pinned' => true, // Di-pin agar selalu berada di posisi paling atas ulasan
                'photos' => ['/images/ayam_bakar.jpg'], // Foto hidangan yang diunggah pelanggan
                'replies' => [
                    [
                        'id' => 'reply-1',
                        'authorName' => 'Admin CS Nefakky',
                        'authorEmail' => 'admin@nefakky.com',
                        'comment' => 'Terima kasih banyak Kak Siti atas ulasan bintang 5 nya! Ditunggu pesanan berikutnya ya kak.',
                        'date' => 'Kemarin, 14:20',
                    ]
                ],
            ],
            [
                'review_id' => 'REV-002',
                'product_id' => 'PROD-002', // Terkait ke menu Jus Segar
                'author_name' => 'Nizar Azzuhra',
                'author_email' => 'nizarazzuhra@gmail.com',
                'author_badge' => 'GOLD',
                'avatar' => 'https://ui-avatars.com/api/?name=Nizar+Azzuhra&background=5C3D28&color=ffffff',
                'rating' => 5,
                'date' => '2 hari yang lalu',
                'product_name' => 'Jus Segar 3-Varian',
                'product_image' => '/images/jus_mangga.jpg',
                'comment' => 'Jus mangganya kental dan manisnya pas alami tanpa gula berlebih. Pengiriman express cepat sekali sampai di Depok!',
                'likes_count' => 9,
                'status' => 'PUBLISHED',
                'is_pinned' => false,
                'photos' => [],
                'replies' => [],
            ],
            [
                'review_id' => 'REV-003',
                'product_id' => 'PROD-004', // Terkait ke menu Dimsum
                'author_name' => 'Budi Santoso',
                'author_email' => 'budi.santoso@example.com',
                'author_badge' => 'VERIFIED BUYER',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
                'rating' => 5,
                'date' => '3 hari yang lalu',
                'product_name' => 'Dimsum Ayam Udang Kukus',
                'product_image' => '/images/dimsum_ayam.jpg',
                'comment' => 'Dimsumnya garing dan kenyal berasa banget udangnya. Chili oil-nya wangi sekali.',
                'likes_count' => 5,
                'status' => 'PUBLISHED',
                'is_pinned' => false,
                'photos' => [],
                'replies' => [],
            ],
        ];

        // Menyimpan data ulasan ke tabel database
        foreach ($reviews as $r) {
            Review::updateOrCreate(
                ['review_id' => $r['review_id']],
                $r
            );
        }
    }
}
