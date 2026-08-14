<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->string('order_id')->primary();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('avatar', 500)->nullable();
            $table->text('address');
            $table->string('phone', 30)->nullable();
            $table->integer('item_count')->default(1);
            $table->string('payment_method')->default('Midtrans QRIS / GoPay');
            $table->string('payment_badge', 20)->default('PAID');
            $table->string('delivery_type')->default('Biaya Pengiriman Standard');
            $table->string('status', 20)->default('COOKING');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('shipping_cost', 12, 2)->default(0.00);
            $table->decimal('discount', 12, 2)->default(0.00);
            $table->decimal('total', 12, 2);
            $table->boolean('customer_confirmed')->default(false);
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->string('order_id');
            $table->foreign('order_id')->references('order_id')->on('orders')->onDelete('cascade');
            $table->string('product_id');
            $table->string('name');
            $table->decimal('price', 12, 2);
            $table->integer('quantity')->default(1);
            $table->string('image', 500);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
