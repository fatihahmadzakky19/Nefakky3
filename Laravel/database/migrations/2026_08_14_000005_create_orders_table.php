<?php

// -----------------------------------------------------------------------------
// IMPORT DEPENDENCY: Mengimpor class pembangun skema database Laravel.
// -----------------------------------------------------------------------------
use Illuminate\Database\Migrations\Migration; // Superclass Migrasi Database
use Illuminate\Database\Schema\Blueprint;    // Blueprint pembangun struktur kolom
use Illuminate\Support\Facades\Schema;       // Facade manajemen skema database

/**
 * =============================================================================
 * FILE MIGRASI: create_orders_table & create_order_items_table
 * =============================================================================
 * Bertanggung jawab merancang struktur fisik 2 tabel basis data:
 * 1. Tabel 'orders'      : Menyimpan data header transaksi pesanan kuliner.
 * 2. Tabel 'order_items' : Menyimpan snapshot rincian menu hidangan yang dibeli.
 * =============================================================================
 */
return new class extends Migration
{
    /**
     * Menjalankan migrasi pembuatan tabel (Database Definition Language / DDL).
     */
    public function up(): void
    {
        // =====================================================================
        // 1. TABEL HEADER PESANAN (orders)
        // =====================================================================
        Schema::create('orders', function (Blueprint $table) {
            // Kolom Primary Key custom bertipe String (e.g. "ORD-88219")
            $table->string('order_id', 30)->primary();
            
            // Kolom Foreign Key ke tabel 'users' (jika user dihapus, user_id diset NULL agar histori transaksi tetap ada)
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Kolom Teks String: Identitas pemesan
            $table->string('customer_name', 100);  // Tipe VARCHAR(100): Nama lengkap pelanggan
            $table->string('customer_email', 150); // Tipe VARCHAR(150): Email untuk pengiriman nota/invoice
            $table->string('avatar', 500)->nullable(); // Tipe VARCHAR(500): URL foto profil pembeli
            
            // Kolom TEXT: Alamat tujuan pengantaran makanan yang panjang
            $table->text('address');
            
            // Kolom Kontak Telepon
            $table->string('phone', 20)->nullable(); // Tipe VARCHAR(20): Nomor WhatsApp / Telepon aktif
            
            // Kolom UNSIGNED SMALLINTEGER: Kuantitas total porsi (hanya bernilai positif 0 - 65.535)
            $table->unsignedSmallInteger('item_count')->default(1);
            
            // Kolom ENUM: Pilihan metode pembayaran yang diizinkan sistem
            $table->enum('payment_method', [
                'Midtrans QRIS',
                'Midtrans QRIS / GoPay',
                'Midtrans GoPay',
                'Midtrans ShopeePay',
                'Transfer BCA',
                'Transfer Mandiri',
                'Cash on Delivery (COD)'
            ])->default('Midtrans QRIS / GoPay');
            
            // Kolom ENUM: Status verifikasi pembayaran
            $table->enum('payment_badge', ['PENDING', 'PAID', 'AWAITING', 'EXPIRED', 'FAILED', 'REFUNDED'])->default('PAID');
            
            // Kolom ENUM: Jenis kurir pengantaran
            $table->enum('delivery_type', ['STANDARD', 'EXPRESS', 'PICKUP'])->default('STANDARD');
            
            // Kolom ENUM: Alur live tracking 5-tahap status pemrosesan hidangan
            $table->enum('status', ['RECEIVED', 'COOKING', 'READY', 'DELIVERING', 'COMPLETED', 'CANCELLED', 'PENDING'])->default('RECEIVED');
            
            // Kolom DECIMAL: Nilai moneter finansial dengan presisi tinggi (12 digit, 2 angka di belakang koma)
            $table->decimal('subtotal', 12, 2);                      // Total harga hidangan sebelum ongkir & diskon (Rp)
            $table->decimal('shipping_cost', 10, 2)->default(0.00);  // Biaya ongkos kirim hasil kalkulasi Haversine (Rp)
            $table->decimal('discount', 10, 2)->default(0.00);       // Nominal potongan diskon dari kupon voucher (Rp)
            $table->decimal('tax_amount', 10, 2)->default(0.00);     // Nominal pajak restoran PB1 / PPN 10% (Rp)
            $table->decimal('total', 12, 2);                          // Total tagihan bersih akhir yang dibayar pelanggan (Rp)
            
            // Kolom Geospasial: Jarak tempuh dari Dapur Utama ke lokasi pembeli
            $table->decimal('distance_km', 6, 2)->default(0.00);     // Tipe DECIMAL(6, 2): Jarak dalam Kilometer (e.g. 12.45 km)
            
            // Kolom UNSIGNED SMALLINTEGER: Estimasi durasi waktu tiba pengiriman (dalam satuan menit)
            $table->unsignedSmallInteger('estimated_delivery_minutes')->default(30);
            
            // Kolom BOOLEAN: Penanda apakah pesanan sudah dikonfirmasi terima oleh pelanggan (true/false)
            $table->boolean('customer_confirmed')->default(false);
            
            // Kolom DATETIME / TIMESTAMP: Pencatatan waktu riwayat transaksi
            $table->dateTime('order_datetime')->useCurrent(); // Waktu saat pesanan pertama kali dibuat
            $table->dateTime('confirmed_at')->nullable();     // Waktu saat pembeli menekan tombol konfirmasi terima
            $table->dateTime('paid_at')->nullable();          // Waktu saat pembayaran diverifikasi lunas
            $table->dateTime('delivered_at')->nullable();     // Waktu saat kurir sukses mengantar makanan
            
            // Kolom URL Bukti Foto
            $table->string('proof_photo', 500)->nullable();         // URL foto bukti serah terima pesanan dari kurir
            $table->string('payment_proof_photo', 500)->nullable(); // URL foto bukti transfer pembayaran manual
            
            // Kolom Kupon Promosi
            $table->string('voucher_code', 50)->nullable();   // Kode voucher yang digunakan (e.g. "NEFAKKY10")
            $table->string('applied_promo', 150)->nullable(); // Judul promo yang aktif
            
            // Kolom Catatan Khusus
            $table->text('notes')->nullable(); // Instruksi khusus untuk koki/kurir (e.g. "Jangan terlalu pedas")
            
            // Kolom Audit & Penghapusan Aman
            $table->softDeletes(); // Kolom 'deleted_at' agar data tidak langsung hilang permanen saat dihapus
            $table->timestamps();  // Kolom 'created_at' dan 'updated_at' otomatis dari Laravel
        });

        // =====================================================================
        // 2. TABEL RINCIAN ITEM PESANAN (order_items) - Snapshot Pattern
        // =====================================================================
        Schema::create('order_items', function (Blueprint $table) {
            // Kolom Auto-Increment ID baris item
            $table->id();
            
            // Kolom Foreign Key menghubungkan rincian item ke Header 'orders'
            $table->string('order_id', 30);
            $table->foreign('order_id')->references('order_id')->on('orders')->onDelete('cascade');
            
            // Kolom ID Produk yang dipesan (merujuk ke tabel product_items)
            $table->string('product_id', 30);
            
            // Snapshot Data: Mengunci nama dan harga produk saat checkout dilakukan
            $table->string('name', 150);      // Nama hidangan saat transaksi terjadi
            $table->decimal('price', 12, 2);  // Harga satuan saat transaksi terjadi (Rp)
            
            // Kolom UNSIGNED SMALLINTEGER: Jumlah porsi yang dibeli (wajib positif >= 1)
            $table->unsignedSmallInteger('quantity')->default(1);
            
            // Kolom Subtotal Baris: (price x quantity)
            $table->decimal('subtotal', 12, 2)->nullable();
            
            // URL Foto Produk & Catatan Menu
            $table->string('image', 500)->nullable(); // Foto thumbnail hidangan
            $table->string('notes', 255)->nullable(); // Catatan khusus per menu
            
            // Timestamp pencatatan
            $table->timestamps();
        });
    }

    /**
     * Membalikkan migrasi (Menghapus tabel jika di-rollback).
     */
    public function down(): void
    {
        // Hapus tabel anak (order_items) terlebih dahulu sebelum tabel induk (orders)
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};

