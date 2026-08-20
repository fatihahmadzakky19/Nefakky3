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
        Schema::create('promotions', function (Blueprint $table) {
            $table->string('promotion_id')->primary(); // Primary Key string (cth: "promo-1")
            $table->string('title'); // Judul banner promosi
            $table->string('subtitle')->nullable(); // Sub-judul promosi
            $table->string('tag')->nullable(); // Tag promo (cth: "Diskon 50%")
            $table->string('badge', 30)->default('Active'); // Badge status ('Active', 'Scheduled', 'Ended')
            $table->string('image', 500); // URL foto banner
            $table->string('duration')->nullable(); // Teks durasi
            $table->string('type')->default('Banner'); // Jenis promosi
            $table->integer('used_count')->default(0); // Jumlah digunakan
            $table->integer('total_limit')->default(1000); // Batas maksimal
            $table->boolean('is_active')->default(true); // Status aktif
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
