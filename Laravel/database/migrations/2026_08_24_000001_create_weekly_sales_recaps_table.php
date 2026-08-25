<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menjalankan migrasi pembuatan tabel weekly_sales_recaps
     * Digunakan untuk mencatat rekapitulasi penjualan per minggu, jenis penjualan/bazar,
     * omset kotor, laba bersih, dan rincian status operasional.
     */
    public function up(): void
    {
        Schema::create('weekly_sales_recaps', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('year')->default(2026); // Tahun buku (contoh: 2026)
            $table->string('month', 30); // Nama bulan ("Juli", "Agustus")
            $table->unsignedTinyInteger('week_number')->default(1); // Minggu ke- (1, 2, 3, 4)
            $table->string('week_label', 50); // Label periode ("Minggu 1", "TOTAL JULI")
            $table->string('sales_category', 100); // Kategori / Jenis penjualan ("Bazar (1x) + Reguler", "Bazar Event 1")
            $table->decimal('gross_revenue', 15, 2)->default(0.00); // Omset kotor (Rp)
            $table->decimal('net_profit', 15, 2)->default(0.00); // Laba bersih (Rp)
            $table->text('operational_details')->nullable(); // Rincian operasional / Status makanan
            $table->boolean('is_total_row')->default(false); // Penanda apakah baris ini adalah baris ringkasan total
            $table->timestamps();
        });
    }

    /**
     * Membalikkan migrasi.
     */
    public function down(): void
    {
        Schema::dropIfExists('weekly_sales_recaps');
    }
};
