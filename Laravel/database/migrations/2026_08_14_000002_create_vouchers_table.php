<?php

// Mengimpor kelas Migration dari framework Laravel
use Illuminate\Database\Migrations\Migration;
// Mengimpor Blueprint untuk mendefinisikan struktur kolom tabel
use Illuminate\Database\Schema\Blueprint;
// Mengimpor Facade Schema untuk eksekusi pembuatan/penghapusan tabel di database
use Illuminate\Support\Facades\Schema;

// Migration Anonymous Class untuk membuat tabel 'vouchers' (Kupon Diskon Promo)
return new class extends Migration
{
    /**
     * Menjalankan migration: Membuat tabel 'vouchers' di database
     */
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->string('voucher_id')->primary(); // Primary key string (cth: "VOUCH-01")
            $table->string('code')->unique(); // Kode kupon promo unik (cth: "NEFAKKY10")
            $table->string('name'); // Nama deskriptif promo voucher
            $table->decimal('discount_percent', 5, 2)->default(10.00); // Persentase diskon potongan harga (%)
            $table->decimal('min_spend', 12, 2)->default(0.00); // Syarat minimal belanja dalam Rupiah
            $table->string('expiry')->default('31 Des 2026'); // Tanggal kedaluwarsa kupon voucher
            $table->string('status', 20)->default('Active'); // Status teks voucher ("Active", "Expired")
            $table->boolean('is_active')->default(true); // Flag boolean keaktifan voucher (true/false)
            $table->timestamps(); // Kolom created_at dan updated_at otomatis
        });
    }

    /**
     * Membalikkan migration: Menghapus tabel 'vouchers' jika di-rollback
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
