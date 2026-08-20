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
        Schema::create('product_items', function (Blueprint $table) {
            $table->string('item_id')->primary(); // Primary key custom string (cth: "PROD-001")
            $table->string('sku')->unique(); // Kode SKU unik (cth: "NK-AYM-01")
            $table->string('name'); // Nama menu makanan/minuman
            $table->string('category')->default('Makanan Utama'); // Nama kategori
            $table->decimal('price', 12, 2); // Harga dasar produk (Rp)
            $table->decimal('discount', 5, 2)->default(0.00); // Diskon dalam persen (%)
            $table->integer('stock')->default(50); // Sisa stok produk
            $table->boolean('visibility')->default(true); // Status visibilitas katalog (true/false)
            $table->string('status', 20)->default('Active'); // Kondisi stok ("Active", "Low Stock", "Inactive")
            $table->float('rating')->default(5.0); // Rata-rata rating bintang
            $table->integer('reviews_count')->default(0); // Total ulasan
            $table->string('sold_count')->default('0 Terjual'); // Akumulasi penjualan
            $table->string('image', 500); // URL/Path gambar utama
            $table->json('gallery')->nullable(); // URL galeri foto tambahan
            $table->text('description'); // Deskripsi lengkap produk
            $table->string('badge', 50)->nullable(); // Lencana promo ("BEST SELLER", "TERPOPULER", dll)
            $table->text('ingredients')->nullable(); // Komposisi bahan
            $table->text('usage_advice')->nullable(); // Saran penyajian/penyimpanan
            $table->string('calories', 30)->default('320 kcal'); // Nilai kalori
            $table->string('fat', 30)->default('12g'); // Kadar lemak
            $table->string('sugar', 30)->default('4g'); // Kadar gula
            $table->string('sat_fat', 30)->nullable(); // Lemak jenuh
            $table->integer('max_delivery_km')->default(25); // Batas maksimal jarak antar (km)
            $table->softDeletes(); // Dukungan soft delete
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_items');
    }
};
