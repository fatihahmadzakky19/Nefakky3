<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->string('voucher_id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->decimal('discount_percent', 5, 2)->default(10.00);
            $table->decimal('min_spend', 12, 2)->default(0.00);
            $table->string('expiry')->default('31 Des 2026');
            $table->string('status', 20)->default('Active');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
