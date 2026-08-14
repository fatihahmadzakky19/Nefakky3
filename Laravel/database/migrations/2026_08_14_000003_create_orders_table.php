<?php

// Mengimpor kelas Migration dasar dari Laravel Database Migrations
use Illuminate\Database\Migrations\Migration;
// Mengimpor Blueprint untuk mendefinisikan struktur kolom tabel
use Illuminate\Database\Schema\Blueprint;
// Mengimpor Facade Schema untuk mengelola tabel di database SQL
use Illuminate\Support\Facades\Schema;

// Mengembalikan Anonymous Migration Class
return new class extends Migration
{
    /**
     * Jalankan skema eksekusi migrasi untuk membuat tabel baru di database
     */
    public function up(): void
    {
        // Membuat tabel 'orders' untuk menyimpan data header transaksi pesanan
        Schema::create('orders', function (Blueprint $table) {
            $table->string('order_id')->primary(); // Column Primary Key string order_id
            $table->string('customer_name'); // Nama lengkap pelanggan
            $table->string('customer_email'); // Alamat email pelanggan
            $table->string('avatar', 500)->nullable(); // URL foto avatar pelanggan (opsional)
            $table->text('address'); // Alamat pengiriman lengkap
            $table->string('phone', 30)->nullable(); // Nomor WhatsApp/Telepon
            $table->integer('item_count')->default(1); // Jumlah total item pesanan
            $table->string('payment_method')->default('Midtrans QRIS / GoPay'); // Metode pembayaran
            $table->string('payment_badge', 20)->default('PAID'); // Badge status bayar (PAID/UNPAID)
            $table->string('delivery_type')->default('Biaya Pengiriman Standard'); // Jenis layanan kurir
            $table->string('status', 20)->default('COOKING'); // Status alur pengiriman
            $table->decimal('subtotal', 12, 2); // Subtotal harga barang
            $table->decimal('shipping_cost', 12, 2)->default(0.00); // Biaya ongkos kirim
            $table->decimal('discount', 12, 2)->default(0.00); // Nominal potongan promo
            $table->decimal('total', 12, 2); // Total bayar bersih
            $table->boolean('customer_confirmed')->default(false); // Flag konfirmasi penerimaan
            $table->timestamps(); // Kolom created_at dan updated_at
        });

        // Membuat tabel 'order_items' untuk rincian produk yang dibeli dalam setiap order
        Schema::create('order_items', function (Blueprint $table) {
            $table->id(); // Primary Key auto increment integer
            $table->string('order_id'); // Foreign Key merujuk ke orders.order_id
            $table->foreign('order_id')->references('order_id')->on('orders')->onDelete('cascade'); // Hapus otomatis item jika order dihapus
            $table->string('product_id'); // ID produk yang dibeli
            $table->string('name'); // Nama item produk makanan
            $table->decimal('price', 12, 2); // Harga satuan item saat dipesan
            $table->integer('quantity')->default(1); // Kuantitas jumlah yang dibeli
            $table->string('image', 500); // Path/URL gambar produk
            $table->timestamps(); // Kolom created_at dan updated_at
        });
    }

    /**
     * Rollback migrasi: Menghapus tabel jika migrasi dibatalkan
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items'); // Hapus tabel order_items terlebih dahulu (relasi anak)
        Schema::dropIfExists('orders'); // Hapus tabel orders utama
    }
};

