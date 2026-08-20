<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menjalankan migrasi pembuatan tabel promotions (Banner & Event Promosi)
     * Menggunakan tipe data: string(length), enum, dateTime, unsignedInteger, unsignedSmallInteger,
     * boolean, softDeletes, timestamps.
     */
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->string('promotion_id', 30)->primary(); // String Primary Key custom (panjang 30)
            $table->string('title', 150); // String judul banner maks 150 karakter
            $table->string('subtitle', 255)->nullable(); // String sub-judul maks 255 karakter
            $table->string('tag', 50)->nullable(); // String tag label promo maks 50 karakter
            $table->enum('badge', ['Active', 'Scheduled', 'Ended', 'Draft'])->default('Active'); // Tipe Data ENUM status banner
            $table->enum('type', ['Banner Utama', 'Banner Event', 'Popup Modal', 'Notification Bar'])->default('Banner Utama'); // Tipe Data ENUM jenis banner
            $table->string('image', 500); // String URL gambar banner maks 500 karakter
            $table->string('duration', 100)->nullable(); // String teks masa durasi promo
            $table->dateTime('start_datetime')->nullable(); // Tipe Data DATETIME waktu mulai tampil
            $table->dateTime('end_datetime')->nullable(); // Tipe Data DATETIME waktu berakhir promo
            $table->unsignedInteger('used_count')->default(0); // Tipe Data UNSIGNED INTEGER kuota terpakai
            $table->unsignedInteger('total_limit')->default(1000); // Tipe Data UNSIGNED INTEGER batas kuota promosi
            $table->unsignedSmallInteger('display_priority')->default(1); // Tipe Data UNSIGNED SMALLINTEGER prioritas urutan tampil
            $table->boolean('is_active')->default(true); // Tipe Data BOOLEAN switch aktif
            $table->softDeletes(); // Tipe Data TIMESTAMP untuk soft delete
            $table->timestamps(); // Tipe Data TIMESTAMP (created_at & updated_at)
        });
    }

    /**
     * Membalikkan migrasi.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
