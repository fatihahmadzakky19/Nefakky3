<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menjalankan migrasi pembuatan tabel orders dan order_items
     * Menggunakan tipe data: string(length), enum, decimal(precision, scale), unsignedSmallInteger,
     * dateTime, timestamp, boolean, text, softDeletes, timestamps.
     */
    public function up(): void
    {
        // 1. Tabel Header Pesanan (Orders)
        Schema::create('orders', function (Blueprint $table) {
            $table->string('order_id', 30)->primary(); // String Primary Key custom (panjang 30)
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // Foreign key user
            $table->string('customer_name', 100); // String nama pembeli maks 100 karakter
            $table->string('customer_email', 150); // String email pembeli maks 150 karakter
            $table->string('avatar', 500)->nullable(); // String URL avatar pembeli
            $table->text('address'); // Tipe Data TEXT untuk alamat lengkap pengantaran
            $table->string('phone', 20)->nullable(); // String no HP / WhatsApp maks 20 karakter
            $table->unsignedSmallInteger('item_count')->default(1); // Tipe Data UNSIGNED SMALLINTEGER (0 - 65.535)
            $table->enum('payment_method', [
                'Midtrans QRIS',
                'Midtrans QRIS / GoPay',
                'Midtrans GoPay',
                'Midtrans ShopeePay',
                'Transfer BCA',
                'Transfer Mandiri',
                'Cash on Delivery (COD)'
            ])->default('Midtrans QRIS / GoPay'); // Tipe Data ENUM metode pembayaran
            $table->enum('payment_badge', ['PENDING', 'PAID', 'AWAITING', 'EXPIRED', 'FAILED', 'REFUNDED'])->default('PAID'); // Tipe Data ENUM status bayar
            $table->enum('delivery_type', ['STANDARD', 'EXPRESS', 'PICKUP'])->default('STANDARD'); // Tipe Data ENUM tipe antar
            $table->enum('status', ['RECEIVED', 'COOKING', 'READY', 'DELIVERING', 'COMPLETED', 'CANCELLED', 'PENDING'])->default('RECEIVED'); // Tipe Data ENUM alur 5-tahap
            $table->decimal('subtotal', 12, 2); // Tipe Data DECIMAL(12, 2) total harga makanan
            $table->decimal('shipping_cost', 10, 2)->default(0.00); // Tipe Data DECIMAL(10, 2) tarif ongkir
            $table->decimal('discount', 10, 2)->default(0.00); // Tipe Data DECIMAL(10, 2) potongan voucher
            $table->decimal('tax_amount', 10, 2)->default(0.00); // Tipe Data DECIMAL(10, 2) pajak PB1
            $table->decimal('total', 12, 2); // Tipe Data DECIMAL(12, 2) total bayar bersih
            $table->decimal('distance_km', 6, 2)->default(0.00); // Tipe Data DECIMAL(6, 2) jarak dari kitchen (misal: 12.45 km)
            $table->unsignedSmallInteger('estimated_delivery_minutes')->default(30); // Tipe Data UNSIGNED SMALLINTEGER estimasi waktu antar (menit)
            $table->boolean('customer_confirmed')->default(false); // Tipe Data BOOLEAN konfirmasi penerimaan
            $table->dateTime('order_datetime')->useCurrent(); // Tipe Data DATETIME saat pesanan dibuat
            $table->dateTime('confirmed_at')->nullable(); // Tipe Data DATETIME saat pembeli menekan konfirmasi barang diterima
            $table->dateTime('paid_at')->nullable(); // Tipe Data DATETIME saat pembayaran terverifikasi
            $table->dateTime('delivered_at')->nullable(); // Tipe Data DATETIME saat pesanan selesai diantar
            $table->string('proof_photo', 500)->nullable(); // String URL foto serah terima dari kurir
            $table->string('payment_proof_photo', 500)->nullable(); // String URL foto bukti transfer manual
            $table->string('voucher_code', 50)->nullable(); // String kode promo maks 50 karakter
            $table->string('applied_promo', 150)->nullable(); // String nama promo
            $table->text('notes')->nullable(); // Tipe Data TEXT instruksi koki/kurir
            $table->softDeletes(); // Tipe Data TIMESTAMP untuk soft deletes (deleted_at)
            $table->timestamps(); // Tipe Data TIMESTAMP (created_at & updated_at)
        });

        // 2. Tabel Rincian Item Pesanan (Order Items)
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->string('order_id', 30);
            $table->foreign('order_id')->references('order_id')->on('orders')->onDelete('cascade');
            $table->string('product_id', 30);
            $table->string('name', 150); // Nama produk saat checkout
            $table->decimal('price', 12, 2); // Tipe Data DECIMAL(12, 2) harga satuan saat checkout
            $table->unsignedSmallInteger('quantity')->default(1); // Tipe Data UNSIGNED SMALLINTEGER kuantitas porsi
            $table->decimal('subtotal', 12, 2)->nullable(); // Tipe Data DECIMAL(12, 2) subtotal item
            $table->string('image', 500)->nullable();
            $table->string('notes', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Membalikkan migrasi.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
