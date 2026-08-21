<?php

namespace Database\Seeders;

use App\Models\Review;
use Illuminate\Database\Seeder;

/**
 * Class ReviewSeeder
 * 
 * Seeder ini bertanggung jawab untuk mengisi data ulasan pelanggan awal
 * untuk hidangan kuliner otentik Nefakky.
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
        $reviews = [
            [
                'review_id' => 'REV-001',
                'product_id' => 'm1',
                'author_name' => 'Siti Rahmawati',
                'author_email' => 'siti@example.com',
                'author_badge' => 'PLATINUM',
                'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
                'rating' => 5,
                'date' => 'Kemarin',
                'product_name' => 'Ayam Bakar',
                'product_image' => '/images/ayam_bakar.jpg',
                'comment' => 'Daging ayamnya sangat empuk, bumbu kecap rempahnya meresap sampai ke tulang! Sambalnya juga mantap pedas gurihnya.',
                'likes_count' => 18,
                'status' => 'PUBLISHED',
                'is_pinned' => true,
                'photos' => ['/images/ayam_bakar.jpg'],
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
                'product_id' => 'm6',
                'author_name' => 'Nizar Azzuhra',
                'author_email' => 'nizarazzuhra@gmail.com',
                'author_badge' => 'GOLD',
                'avatar' => 'https://ui-avatars.com/api/?name=Nizar+Azzuhra&background=5C3D28&color=ffffff',
                'rating' => 5,
                'date' => '2 hari yang lalu',
                'product_name' => 'Jus Segar (Jambu, Sirsak, Mangga)',
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
                'product_id' => 'm4',
                'author_name' => 'Dimas Pratama',
                'author_email' => 'dimas@example.com',
                'author_badge' => 'VERIFIED BUYER',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
                'rating' => 5,
                'date' => '3 hari yang lalu',
                'product_name' => 'Gudeg',
                'product_image' => '/images/gudeg.jpg',
                'comment' => 'Gudeg paling otentik yang pernah saya pesan online. Bumbu kreceknya gurih pedas manis beraroma harum.',
                'likes_count' => 15,
                'status' => 'PUBLISHED',
                'is_pinned' => false,
                'photos' => ['/images/gudeg.jpg'],
                'replies' => [],
            ],
            [
                'review_id' => 'REV-004',
                'product_id' => 'm2',
                'author_name' => 'Dewi Lestari',
                'author_email' => 'dewi@example.com',
                'author_badge' => 'VERIFIED BUYER',
                'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
                'rating' => 5,
                'date' => '4 hari yang lalu',
                'product_name' => 'Nasi Bakar',
                'product_image' => '/images/nasi_bakar.jpg',
                'comment' => 'Nasi bakar daun pisang harum wangi bumbu cumi pedas manisnya melimpah! Mengenyangkan sekali.',
                'likes_count' => 6,
                'status' => 'PUBLISHED',
                'is_pinned' => false,
                'photos' => [],
                'replies' => [],
            ],
        ];

        foreach ($reviews as $r) {
            Review::updateOrCreate(
                ['review_id' => $r['review_id']],
                $r
            );
        }
    }
}
