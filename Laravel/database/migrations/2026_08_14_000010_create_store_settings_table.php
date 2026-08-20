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
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // Kunci setting unik (cth: "store_name", "kitchen_lat", "kitchen_lon")
            $table->text('value')->nullable(); // Nilai setting
            $table->string('group', 50)->default('general'); // Grup setting ('general', 'kitchen', 'shipping', 'tax')
            $table->string('description')->nullable(); // Penjelasan fungsi setting
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_settings');
    }
};
