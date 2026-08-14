<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_items', function (Blueprint $table) {
            $table->string('item_id')->primary();
            $table->string('sku')->unique();
            $table->string('name');
            $table->string('category')->default('Makanan Utama');
            $table->decimal('price', 12, 2);
            $table->decimal('discount', 5, 2)->default(0.00);
            $table->integer('stock')->default(50);
            $table->boolean('visibility')->default(true);
            $table->string('status', 20)->default('Active');
            $table->float('rating')->default(4.9);
            $table->integer('reviews_count')->default(120);
            $table->string('sold_count')->default('150 Terjual');
            $table->string('image', 500);
            $table->text('description');
            $table->string('badge', 20)->nullable();
            $table->text('ingredients')->nullable();
            $table->text('usage_advice')->nullable();
            $table->string('calories', 30)->default('320 kcal');
            $table->string('fat', 30)->default('12g');
            $table->string('sugar', 30)->default('4g');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_items');
    }
};
