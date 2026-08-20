<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menjalankan migrasi pembuatan tabel vouchers (Mesin Kupon Promo Diskon)
     * Menggunakan tipe data: string(length), enum, decimal(precision, scale), unsignedInteger,
     * dateTime, date, time, boolean, softDeletes, timestamps.
     */
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->string('voucher_id', 30)->primary(); // String Primary Key custom (panjang 30)
            $table->string('code', 50)->unique(); // String kode kupon unik (panjang 50)
            $table->string('name', 150); // String nama/deskripsi promosi (panjang 150)
            $table->enum('type', ['percent', 'fixed'])->default('percent'); // Tipe Data ENUM jenis potongan
            $table->decimal('discount_percent', 5, 2)->default(0.00); // Tipe Data DECIMAL(5, 2) untuk diskon persen
            $table->decimal('discount_value', 12, 2)->default(0.00); // Tipe Data DECIMAL(12, 2) untuk nominal diskon tetap
            $table->decimal('min_spend', 12, 2)->default(0.00); // Tipe Data DECIMAL(12, 2) syarat belanja minimum
            $table->decimal('max_discount', 12, 2)->nullable(); // Tipe Data DECIMAL(12, 2) batas maksimal potongan
            $table->unsignedInteger('used_count')->default(0); // Tipe Data UNSIGNED INTEGER kuota terpakai
            $table->unsignedInteger('total_limit')->default(500); // Tipe Data UNSIGNED INTEGER total limit kuota
            $table->string('redemptions', 50)->default('0/500'); // String rasio tampilan kuota
            $table->string('expiry', 100)->default('31 Des 2026'); // String keterangan masa berlaku
            $table->dateTime('valid_from')->nullable(); // Tipe Data DATETIME tanggal & jam mulai aktif
            $table->dateTime('valid_until')->nullable(); // Tipe Data DATETIME tanggal & jam kadaluwarsa
            $table->date('start_date')->nullable(); // Tipe Data DATE (YYYY-MM-DD)
            $table->date('end_date')->nullable(); // Tipe Data DATE (YYYY-MM-DD)
            $table->time('daily_start_time')->nullable(); // Tipe Data TIME (HH:MM:SS) jam mulai promo harian
            $table->time('daily_end_time')->nullable(); // Tipe Data TIME (HH:MM:SS) jam selesai promo harian
            $table->enum('valid_day_type', ['All Days', 'Weekend Only', 'Weekday Only'])->default('All Days'); // Tipe Data ENUM
            $table->string('valid_days', 100)->nullable(); // String keterangan hari
            $table->boolean('auto_reset_weekly')->default(false); // Tipe Data BOOLEAN reset kuota tiap minggu
            $table->string('last_reset_week', 20)->nullable(); // String identifikasi minggu ISO (cth: "2026-W34")
            $table->string('event', 100)->nullable(); // String kategori event promo
            $table->enum('status', ['Active', 'Expired', 'Disabled'])->default('Active'); // Tipe Data ENUM status operasional
            $table->boolean('is_active')->default(true); // Tipe Data BOOLEAN switch aktif
            $table->string('image_url', 500)->nullable(); // String URL banner voucher
            $table->softDeletes(); // Tipe Data TIMESTAMP untuk soft delete
            $table->timestamps(); // Tipe Data TIMESTAMP (created_at & updated_at)
        });
    }

    /**
     * Membalikkan migrasi.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
