<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_reviews', function (Blueprint $table) {
            $table->string('review_id')->primary(); // Primary Key string (cth: "REV-001")
            $table->string('product_id')->nullable(); // ID produk terkait
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('author_name'); // Nama pemberi ulasan
            $table->string('author_email')->nullable(); // Email pemberi ulasan
            $table->string('author_badge', 50)->nullable(); // Lencana status (cth: "Verified Buyer", "PLATINUM")
            $table->string('avatar', 500)->nullable(); // URL foto avatar
            $table->integer('rating')->default(5); // Nilai rating (1 - 5)
            $table->string('date')->nullable(); // Teks tanggal ulasan
            $table->string('product_name')->nullable(); // Nama produk yang diulas
            $table->string('product_image', 500)->nullable(); // Gambar produk
            $table->text('comment'); // Isi komentar ulasan
            $table->integer('likes_count')->default(0); // Total jumlah like
            $table->enum('status', ['PUBLISHED', 'PENDING', 'FLAGGED', 'APPROVED', 'REJECTED'])->default('PUBLISHED'); // Status moderasi
            $table->string('flagged_reason')->nullable(); // Alasan jika ditandai/flagged
            $table->boolean('is_pinned')->default(false); // Pin ulasan di posisi teratas
            $table->boolean('is_hidden')->default(false); // Sembunyikan ulasan
            $table->json('photos')->nullable(); // Array foto yang diupload pelanggan
            $table->json('replies')->nullable(); // Array balasan dari penjual/admin
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_reviews');
    }
};
