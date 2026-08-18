<?php

// Mengimpor kelas Migration dari framework Laravel
use Illuminate\Database\Migrations\Migration;
// Mengimpor Blueprint untuk mendefinisikan struktur kolom tabel
use Illuminate\Database\Schema\Blueprint;
// Mengimpor Facade Schema untuk eksekusi pembuatan/penghapusan tabel di database
use Illuminate\Support\Facades\Schema;

// Migration Anonymous Class untuk membuat tabel 'sales_reports' (Laporan Keuangan Penjualan Bulanan)
return new class extends Migration
{
    /**
     * Menjalankan migration: Membuat tabel 'sales_reports' di database
     */
    public function up(): void
    {
        Schema::create('sales_reports', function (Blueprint $table) {
            $table->id(); // Primary Key auto increment integer
            $table->string('month_year'); // Periode bulan & tahun laporan (cth: "Agu 2026")
            $table->decimal('gross_revenue', 15, 2)->default(0); // Total omzet pendapatan kotor (Rp)
            $table->decimal('net_profit', 15, 2)->default(0); // Total keuntungan laba bersih (Rp)
            $table->integer('total_orders')->default(0); // Total jumlah pesanan sukses
            $table->string('event_tag')->nullable(); // Label promosi/event khusus (cth: "Promo Kemerdekaan")
            $table->timestamps(); // Kolom created_at dan updated_at otomatis
        });
    }

    /**
     * Membalikkan migration: Menghapus tabel 'sales_reports' jika di-rollback
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_reports');
    }
};
