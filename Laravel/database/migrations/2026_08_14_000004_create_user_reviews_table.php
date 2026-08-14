<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->string('review_id')->primary();
            $table->string('author_name');
            $table->string('author_email');
            $table->string('author_badge', 50)->default('GOLD');
            $table->string('avatar', 500)->nullable();
            $table->integer('rating')->default(5);
            $table->string('date', 50)->default('Kemarin');
            $table->string('product_name');
            $table->string('product_image', 500)->nullable();
            $table->text('comment');
            $table->integer('likes_count')->default(0);
            $table->string('status', 20)->default('PUBLISHED');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
