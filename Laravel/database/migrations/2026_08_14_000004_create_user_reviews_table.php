<?php

// Mengimpor kelas Migration dari framework Laravel
use Illuminate\Database\Migrations\Migration;
// Mengimpor Blueprint untuk mendefinisikan struktur kolom tabel
use Illuminate\Database\Schema\Blueprint;
// Mengimpor Facade Schema untuk eksekusi pembuatan/penghapusan tabel di database
use Illuminate\Support\Facades\Schema;

// Migration Anonymous Class untuk membuat tabel 'reviews' (Ulasan & Rating Pelanggan)
return new class extends Migration
{
    /**
     * Menjalankan migration: Membuat tabel 'reviews' di database
     */
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->string('review_id')->primary(); // Primary key string unik (cth: "REV-001")
            $table->string('author_name'); // Nama lengkap pengulas/pelanggan
            $table->string('author_email'); // Alamat email pengulas
            $table->string('author_badge', 50)->default('GOLD'); // Lencana loyalitas (cth: "GOLD", "PLATINUM")
            $table->string('avatar', 500)->nullable(); // URL foto avatar/profil pengulas
            $table->integer('rating')->default(5); // Nilai rating bintang hidangan (1 - 5)
            $table->string('date', 50)->default('Kemarin'); // Teks tanggal ulasan
            $table->string('product_name'); // Nama hidangan kuliner yang diulas
            $table->string('product_image', 500)->nullable(); // Foto produk / hidangan pesanan
            $table->text('comment'); // Isi komentar ulasan rasa makanan
            $table->integer('likes_count')->default(0); // Jumlah like/suka ulasan
            $table->string('status', 20)->default('PUBLISHED'); // Status moderasi ulasan ("PUBLISHED", "PENDING")
            $table->timestamps(); // Kolom created_at dan updated_at otomatis
        });
    }

    /**
     * Membalikkan migration: Menghapus tabel 'reviews' jika di-rollback
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
