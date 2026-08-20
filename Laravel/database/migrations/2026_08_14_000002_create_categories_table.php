<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menjalankan migrasi pembuatan tabel categories
     * Menggunakan tipe data: id, string(length), enum, unsignedSmallInteger, text, boolean, timestamps.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique(); // Nama kategori maks 50 karakter
            $table->string('slug', 60)->unique(); // Slug URL maks 60 karakter
            $table->enum('type', ['Makanan', 'Minuman', 'Paket', 'Tambahan'])->default('Makanan'); // Tipe Data ENUM
            $table->unsignedSmallInteger('display_order')->default(1); // Tipe Data UNSIGNED SMALLINTEGER urutan tampil
            $table->string('icon', 100)->nullable();
            $table->text('description')->nullable(); // Tipe Data TEXT
            $table->boolean('is_active')->default(true); // Tipe Data BOOLEAN
            $table->timestamps();
        });
    }

    /**
     * Membalikkan migrasi.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
