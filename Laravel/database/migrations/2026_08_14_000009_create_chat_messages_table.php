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
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->string('chat_id')->index(); // ID pesan (cth: "chat-123")
            $table->enum('sender', ['user', 'admin'])->default('user'); // Pengirim
            $table->string('user_email')->index(); // Email pelanggan
            $table->string('user_name'); // Nama pengirim
            $table->string('user_avatar', 500)->nullable(); // Foto avatar
            $table->text('text'); // Isi teks pesan
            $table->string('timestamp')->nullable(); // Waktu pesan (cth: "10:15 AM")
            $table->boolean('read_by_admin')->default(false); // Status dibaca admin
            $table->boolean('read_by_user')->default(false); // Status dibaca pelanggan
            $table->string('media_url', 500)->nullable(); // URL lampiran gambar/video
            $table->string('media_type', 20)->nullable(); // 'image' | 'video'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
