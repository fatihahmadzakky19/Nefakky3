<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menjalankan migrasi pembuatan tabel user_reviews (Ulasan & Rating Produk)
     * Menggunakan tipe data: string(length), enum, unsignedTinyInteger, unsignedInteger,
     * dateTime, text, boolean, json, softDeletes, timestamps.
     */
    public function up(): void
    {
        Schema::create('user_reviews', function (Blueprint $table) {
            $table->string('review_id', 30)->primary(); // String Primary Key custom (panjang 30)
            $table->string('product_id', 30)->nullable(); // String ID produk kuliner yang diulas
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('order_id', 30)->nullable(); // ID transaksi pesanan terkait (opsional)
            $table->string('author_name', 100); // String nama pengulas maks 100 karakter
            $table->string('author_email', 150)->nullable(); // String email pengulas maks 150 karakter
            $table->enum('author_badge', ['PLATINUM', 'GOLD', 'SILVER', 'VERIFIED BUYER', 'CUSTOMER'])->default('VERIFIED BUYER'); // Tipe Data ENUM lencana loyalitas
            $table->string('avatar', 500)->nullable(); // String URL foto profil avatar
            $table->unsignedTinyInteger('rating')->default(5); // Tipe Data UNSIGNED TINYINTEGER (1 - 5 bintang)
            $table->string('date', 50)->nullable(); // String label tanggal ("Kemarin", "2 hari lalu")
            $table->dateTime('review_date')->useCurrent(); // Tipe Data DATETIME timestamp saat ulasan ditulis
            $table->string('product_name', 150)->nullable(); // String nama menu yang diulas
            $table->string('product_image', 500)->nullable(); // String URL gambar menu
            $table->text('comment'); // Tipe Data TEXT untuk testimoni pelanggan
            $table->unsignedInteger('likes_count')->default(0); // Tipe Data UNSIGNED INTEGER jumlah respon suka
            $table->enum('status', ['PUBLISHED', 'PENDING', 'FLAGGED', 'APPROVED', 'REJECTED'])->default('PUBLISHED'); // Tipe Data ENUM status moderasi
            $table->string('flagged_reason', 255)->nullable(); // Alasan ulasan ditandai
            $table->boolean('is_pinned')->default(false); // Tipe Data BOOLEAN pin ulasan prioritas
            $table->boolean('is_hidden')->default(false); // Tipe Data BOOLEAN sembunyikan ulasan
            $table->json('photos')->nullable(); // Tipe Data JSON untuk array foto makanan dari pembeli
            $table->json('replies')->nullable(); // Tipe Data JSON untuk array balasan penjual
            $table->dateTime('replied_at')->nullable(); // Tipe Data DATETIME waktu balasan penjual
            $table->softDeletes(); // Tipe Data TIMESTAMP untuk soft delete
            $table->timestamps(); // Tipe Data TIMESTAMP (created_at & updated_at)
        });
    }

    /**
     * Membalikkan migrasi.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_reviews');
    }
};
