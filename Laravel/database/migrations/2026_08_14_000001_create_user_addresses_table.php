<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menjalankan migrasi pembuatan tabel user_addresses (Buku Alamat Pengiriman)
     * Menggunakan tipe data: foreignId, string(length), enum, decimal(10, 7), text, boolean, dateTime, timestamps.
     */
    public function up(): void
    {
        Schema::create('user_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('label', 50)->default('Rumah'); // Label alamat (panjang 50)
            $table->enum('label_type', ['Rumah', 'Kantor', 'Apartemen', 'Kos', 'Lainnya'])->default('Rumah'); // Tipe Data ENUM
            $table->string('receiver_name', 100); // Nama penerima (panjang 100)
            $table->string('receiver_phone', 20); // No telepon (panjang 20)
            $table->text('address'); // Tipe Data TEXT untuk alamat detail
            $table->string('postal_code', 10)->nullable(); // Kode pos max 10 karakter
            $table->decimal('latitude', 10, 7)->nullable(); // Tipe Data DECIMAL(10, 7) untuk koordinat GPS
            $table->decimal('longitude', 10, 7)->nullable(); // Tipe Data DECIMAL(10, 7) untuk koordinat GPS
            $table->string('notes', 255)->nullable(); // Catatan patokan kurir
            $table->boolean('is_default')->default(false); // Tipe Data BOOLEAN
            $table->dateTime('last_used_at')->nullable(); // Tipe Data DATETIME saat alamat terakhir dipakai
            $table->timestamps();
        });
    }

    /**
     * Membalikkan migrasi.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_addresses');
    }
};
