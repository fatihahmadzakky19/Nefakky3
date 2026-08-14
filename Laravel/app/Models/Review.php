<?php

// Namespace penempat Model dalam struktur folder Laravel Eloquent
namespace App\Models;

// Mengimpor kelas dasar Model dari Eloquent ORM Laravel
use Illuminate\Database\Eloquent\Model;

// Class Model Review yang merepresentasikan ulasan produk di tabel 'user_reviews' / 'reviews'
class Review extends Model
{
    // Mengatur nama Primary Key khusus yaitu 'review_id'
    protected $primaryKey = 'review_id';
    // Menandakan bahwa primary key berbentuk string/custom, bukan auto-increment integer
    public $incrementing = false;
    // Menentukan tipe data dari Primary Key adalah string
    protected $keyType = 'string';

    // Kolom-kolom yang diizinkan untuk diisi secara massal
    protected $fillable = [
        'review_id', // ID unik ulasan (cth: "rev-001")
        'author_name', // Nama pengulas/pelanggan
        'author_email', // Alamat email pengulas
        'author_badge', // Lencana status pelanggan (cth: "Verified Buyer")
        'avatar', // URL/Path foto avatar pengulas
        'rating', // Nilai rating yang diberikan (1 sampai 5)
        'date', // Teks tanggal ulasan
        'product_name', // Nama produk yang diulas
        'product_image', // Gambar produk yang diulas
        'comment', // Isi teks ulasan/testimoni dari pelanggan
        'likes_count', // Jumlah akumulasi suka/like pada ulasan ini
        'status', // Status moderasi ulasan ("Approved", "Pending")
    ];

    // Casting tipe data kolom
    protected $casts = [
        'rating' => 'integer', // Konversi rating ke integer
        'likes_count' => 'integer', // Konversi jumlah likes ke integer
    ];
}

