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
        Schema::create('sales_reports', function (Blueprint $table) {
            $table->id();
            $table->string('year', 10)->default('2026'); // Tahun laporan (cth: "2026")
            $table->string('month_year'); // Periode (cth: "Juni 2026", "Agustus 2026 (Live)")
            $table->decimal('gross_revenue', 15, 2)->default(0.00); // Pendapatan kotor (omset)
            $table->decimal('net_profit', 15, 2)->default(0.00); // Laba bersih operasional
            $table->integer('total_orders')->default(0); // Total volume pesanan selesai
            $table->string('event_tag')->nullable(); // Keterangan event khusus / bazar
            $table->boolean('is_bazar')->default(false); // Penanda apakah bagian dari event bazar
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_reports');
    }
};
