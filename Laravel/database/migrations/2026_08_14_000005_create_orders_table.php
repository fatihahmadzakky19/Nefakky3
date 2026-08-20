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
        // 1. Tabel Header Pesanan (Orders)
        Schema::create('orders', function (Blueprint $table) {
            $table->string('order_id')->primary(); // Primary Key string (cth: "ORD-88219")
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // Relasi akun pembeli (opsional/guest)
            $table->string('customer_name'); // Nama lengkap pemesan
            $table->string('customer_email'); // Email pemesan
            $table->string('avatar', 500)->nullable(); // Foto avatar pemesan
            $table->text('address'); // Alamat pengiriman
            $table->string('phone', 30)->nullable(); // Nomor kontak/WhatsApp
            $table->integer('item_count')->default(1); // Jumlah total jenis barang
            $table->string('payment_method')->default('Midtrans QRIS / GoPay'); // Metode pembayaran
            $table->string('payment_badge', 20)->default('PAID'); // Status pembayaran ('PAID', 'AWAITING', 'REFUNDED', 'FAILED')
            $table->string('delivery_type')->default('STANDARD'); // Jenis layanan kurir
            $table->string('status', 20)->default('RECEIVED'); // Tahap alur ('RECEIVED', 'COOKING', 'READY', 'DELIVERING', 'COMPLETED', 'CANCELLED', 'PENDING')
            $table->decimal('subtotal', 12, 2); // Subtotal belanja barang
            $table->decimal('shipping_cost', 12, 2)->default(0.00); // Biaya ongkir
            $table->decimal('discount', 12, 2)->default(0.00); // Potongan diskon promo
            $table->decimal('total', 12, 2); // Total tagihan bersih
            $table->boolean('customer_confirmed')->default(false); // Flag konfirmasi penerimaan dari user
            $table->timestamp('confirmed_at')->nullable(); // Waktu konfirmasi barang diterima
            $table->string('proof_photo', 500)->nullable(); // URL foto bukti serah terima pesanan
            $table->string('payment_proof_photo', 500)->nullable(); // URL foto bukti transfer manual
            $table->string('voucher_code', 50)->nullable(); // Kode voucher yang digunakan
            $table->string('applied_promo', 100)->nullable(); // Nama deskripsi promo terpasang
            $table->text('notes')->nullable(); // Catatan khusus pesanan
            $table->softDeletes();
            $table->timestamps();
        });

        // 2. Tabel Rincian Item Pesanan (Order Items)
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->string('order_id');
            $table->foreign('order_id')->references('order_id')->on('orders')->onDelete('cascade');
            $table->string('product_id');
            $table->string('name');
            $table->decimal('price', 12, 2);
            $table->integer('quantity')->default(1);
            $table->string('image', 500)->nullable();
            $table->string('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
