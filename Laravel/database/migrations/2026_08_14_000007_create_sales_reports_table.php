<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menjalankan migrasi pembuatan tabel sales_reports (Rekapitulasi Omset & Finansial)
     * Menggunakan tipe data: unsignedSmallInteger, unsignedTinyInteger, unsignedInteger,
     * string(length), decimal(precision, scale), enum, date, boolean, timestamps.
     */
    public function up(): void
    {
        Schema::create('sales_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('year')->default(2026); // Tipe Data UNSIGNED SMALLINTEGER tahun (misal: 2026)
            $table->unsignedTinyInteger('month_number')->default(1); // Tipe Data UNSIGNED TINYINTEGER bulan (1 - 12)
            $table->string('month_year', 50); // String nama periode ("Juni 2026", "Agustus 2026 (Live)")
            $table->decimal('gross_revenue', 15, 2)->default(0.00); // Tipe Data DECIMAL(15, 2) total omset kotor hingga triliunan
            $table->decimal('net_profit', 15, 2)->default(0.00); // Tipe Data DECIMAL(15, 2) laba bersih
            $table->decimal('average_order_value', 12, 2)->default(0.00); // Tipe Data DECIMAL(12, 2) rata-rata nilai per pesanan (AOV)
            $table->unsignedInteger('total_orders')->default(0); // Tipe Data UNSIGNED INTEGER total transaksi pesanan
            $table->unsignedInteger('total_items_sold')->default(0); // Tipe Data UNSIGNED INTEGER total porsi terjual
            $table->enum('report_status', ['DRAFT', 'FINAL', 'VERIFIED'])->default('FINAL'); // Tipe Data ENUM status laporan keuangan
            $table->date('period_start')->nullable(); // Tipe Data DATE awal periode (YYYY-MM-DD)
            $table->date('period_end')->nullable(); // Tipe Data DATE akhir periode (YYYY-MM-DD)
            $table->string('event_tag', 150)->nullable(); // String keterangan event bazar / festival kuliner
            $table->boolean('is_bazar')->default(false); // Tipe Data BOOLEAN penanda event bazar
            $table->timestamps();
        });
    }

    /**
     * Membalikkan migrasi.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_reports');
    }
};
