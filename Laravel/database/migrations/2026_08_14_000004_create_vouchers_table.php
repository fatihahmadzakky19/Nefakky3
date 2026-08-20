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
        Schema::create('vouchers', function (Blueprint $table) {
            $table->string('voucher_id')->primary(); // Primary key string (cth: "VOUCH-01")
            $table->string('code')->unique(); // Kode kupon (cth: "NEFAKKY10")
            $table->string('name'); // Nama deskripsi promo
            $table->enum('type', ['percent', 'fixed'])->default('percent'); // Jenis diskon
            $table->decimal('discount_percent', 5, 2)->default(0.00); // Diskon persen
            $table->decimal('discount_value', 12, 2)->default(0.00); // Diskon nominal tetap
            $table->decimal('min_spend', 12, 2)->default(0.00); // Syarat minimal belanja
            $table->decimal('max_discount', 12, 2)->nullable(); // Batas maksimal potongan diskon
            $table->integer('used_count')->default(0); // Jumlah kuota terpakai
            $table->integer('total_limit')->default(500); // Total batas kuota penggunaan
            $table->string('redemptions')->default('0/500'); // Teks format kuota
            $table->string('expiry')->default('31 Des 2026'); // Teks masa berlaku
            $table->timestamp('valid_from')->nullable(); // Tanggal mulai aktif
            $table->timestamp('valid_until')->nullable(); // Tanggal berakhir
            $table->string('valid_days')->nullable(); // Aturan hari aktif (cth: "Weekend", "Weekday")
            $table->boolean('auto_reset_weekly')->default(false); // Reset kuota otomatis tiap minggu
            $table->string('last_reset_week')->nullable(); // Identifikasi minggu terakhir di-reset (cth: "2026-W33")
            $table->string('event')->nullable(); // Tag event promo (cth: "Pelanggan Baru", "Bazar")
            $table->string('status', 20)->default('Active'); // Status ("Active", "Expired")
            $table->boolean('is_active')->default(true); // Switch status aktif
            $table->string('image_url', 500)->nullable(); // Banner gambar promo
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
