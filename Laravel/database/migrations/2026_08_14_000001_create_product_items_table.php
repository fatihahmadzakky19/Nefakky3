<?php

// Mengimpor kelas Migration dari framework Laravel
use Illuminate\Database\Migrations\Migration;
// Mengimpor Blueprint untuk mendefinisikan struktur kolom tabel
use Illuminate\Database\Schema\Blueprint;
// Mengimpor Facade Schema untuk eksekusi pembuatan/penghapusan tabel di database
use Illuminate\Support\Facades\Schema;

// Migration Anonymous Class untuk membuat tabel 'product_items'
return new class extends Migration
{
    /**
     * Menjalankan migration: Membuat tabel 'product_items' di database
     */
    public function up(): void
    {
        Schema::create('product_items', function (Blueprint $table) {
            $table->string('item_id')->primary(); // Primary key string (cth: "PROD-001")
            $table->string('sku')->unique(); // Kode SKU unik produk (cth: "NK-AYM-01")
            $table->string('name'); // Nama lengkap menu makanan/minuman
            $table->string('category')->default('Makanan Utama'); // Kategori menu (default: Makanan Utama)
            $table->decimal('price', 12, 2); // Harga dasar produk (Rp) dengan 2 digit desimal
            $table->decimal('discount', 5, 2)->default(0.00); // Diskon produk dalam persen (default: 0%)
            $table->integer('stock')->default(50); // Sisa jumlah stok barang (default: 50)
            $table->boolean('visibility')->default(true); // Status tampil di katalog (default: aktif/true)
            $table->string('status', 20)->default('Active'); // Kondisi stok ("Active", "Low Stock", "Inactive")
            $table->float('rating')->default(4.9); // Nilai rata-rata rating (default: 4.9)
            $table->integer('reviews_count')->default(120); // Jumlah ulasan (default: 120)
            $table->string('sold_count')->default('150 Terjual'); // Teks jumlah terjual (default: "150 Terjual")
            $table->string('image', 500); // URL/Path gambar hidangan (max 500 karakter)
            $table->text('description'); // Deskripsi lengkap hidangan
            $table->string('badge', 20)->nullable(); // Badge promosi ("BEST SELLER", "TERPOPULER", etc)
            $table->text('ingredients')->nullable(); // Komposisi bahan makanan (opsional)
            $table->text('usage_advice')->nullable(); // Saran penyimpanan/penyajian (opsional)
            $table->string('calories', 30)->default('320 kcal'); // Info kalori makanan
            $table->string('fat', 30)->default('12g'); // Info kadar lemak
            $table->string('sugar', 30)->default('4g'); // Info kadar gula
            $table->timestamps(); // Kolom created_at dan updated_at otomatis
        });
    }

    /**
     * Membalikkan migration: Menghapus tabel 'product_items' jika di-rollback
     */
    public function down(): void
    {
        Schema::dropIfExists('product_items');
    }
};
