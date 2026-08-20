<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menjalankan migrasi pembuatan tabel store_settings (Pengaturan Operasional Toko)
     * Menggunakan tipe data: string(length), text, enum, boolean, timestamps.
     */
    public function up(): void
    {
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 50)->unique(); // String kunci setting unik (panjang 50)
            $table->text('value')->nullable(); // Tipe Data TEXT nilai konfigurasi
            $table->enum('group', ['general', 'kitchen', 'shipping', 'tax', 'payment', 'system'])->default('general'); // Tipe Data ENUM kategori konfigurasi
            $table->enum('type', ['string', 'number', 'boolean', 'json'])->default('string'); // Tipe Data ENUM tipe data setting
            $table->string('description', 255)->nullable(); // String penjelasan konfigurasi
            $table->boolean('is_public')->default(true); // Tipe Data BOOLEAN apakah bisa diakses publik
            $table->timestamps();
        });
    }

    /**
     * Membalikkan migrasi.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_settings');
    }
};
