<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menjalankan migrasi pembuatan tabel product_items (Katalog Menu Kuliner)
     * Menggunakan tipe data: string(length), enum, decimal(precision, scale), unsignedInteger,
     * unsignedSmallInteger, unsignedTinyInteger, boolean, json, text, dateTime, softDeletes, timestamps.
     */
    public function up(): void
    {
        Schema::create('product_items', function (Blueprint $table) {
            $table->string('item_id', 30)->primary(); // String Primary Key custom (panjang 30)
            $table->string('sku', 40)->unique(); // String SKU unik (panjang 40)
            $table->string('name', 150); // String nama menu hidangan (panjang 150)
            $table->string('category', 50)->default('Makanan Utama'); // Kategori menu
            $table->decimal('price', 12, 2); // Tipe Data DECIMAL(12, 2) untuk nominal rupiah hingga ratusan milyar
            $table->decimal('discount', 5, 2)->default(0.00); // Tipe Data DECIMAL(5, 2) untuk diskon persen 0.00% - 100.00%
            $table->unsignedInteger('stock')->default(50); // Tipe Data UNSIGNED INTEGER (0 hingga 4.294.967.295)
            $table->boolean('visibility')->default(true); // Tipe Data BOOLEAN
            $table->enum('status', ['Active', 'Low Stock', 'Inactive'])->default('Active'); // Tipe Data ENUM ketersediaan stok
            $table->enum('portion_size', ['Regular', 'Large', 'Jumbo', 'Family Pack'])->default('Regular'); // Tipe Data ENUM porsi
            $table->decimal('rating', 3, 2)->default(5.00); // Tipe Data DECIMAL(3, 2) untuk rating presisi (misal: 4.85)
            $table->unsignedInteger('reviews_count')->default(0); // Tipe Data UNSIGNED INTEGER jumlah ulasan
            $table->unsignedInteger('sold_units')->default(0); // Tipe Data UNSIGNED INTEGER kuantitas terjual
            $table->string('sold_count', 50)->default('0 Terjual'); // Label teks tampilan
            $table->string('image', 500); // String URL foto utama
            $table->json('gallery')->nullable(); // Tipe Data JSON untuk array foto galeri
            $table->text('description'); // Tipe Data TEXT untuk deskripsi hidangan
            $table->string('badge', 50)->nullable()->default('BEST SELLER'); // String label lencana promo
            $table->text('ingredients')->nullable(); // Tipe Data TEXT komposisi bahan
            $table->text('usage_advice')->nullable(); // Tipe Data TEXT saran penyajian
            $table->text('origin')->nullable(); // Tipe Data TEXT alamat asal dapur produksi resmi
            $table->string('calories', 30)->default('320 kcal'); // String kalori
            $table->string('fat', 30)->default('12g'); // String kadar lemak
            $table->string('sugar', 30)->default('4g'); // String kadar gula
            $table->string('sat_fat', 30)->nullable(); // String lemak jenuh
            $table->unsignedTinyInteger('preparation_minutes')->default(15); // Tipe Data UNSIGNED TINYINTEGER (0-255 menit)
            $table->unsignedSmallInteger('max_delivery_km')->default(25); // Tipe Data UNSIGNED SMALLINTEGER (0-65535 km)
            $table->dateTime('restocked_at')->nullable(); // Tipe Data DATETIME waktu terakhir restock
            $table->softDeletes(); // Tipe Data TIMESTAMP untuk soft delete (deleted_at)
            $table->timestamps(); // Tipe Data TIMESTAMP (created_at & updated_at)
        });
    }

    /**
     * Membalikkan migrasi.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_items');
    }
};
