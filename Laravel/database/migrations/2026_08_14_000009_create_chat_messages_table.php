<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menjalankan migrasi pembuatan tabel chat_messages (Live Customer Support)
     * Menggunakan tipe data: string(length), enum, dateTime, text, boolean, timestamps.
     */
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->string('chat_id', 40)->index(); // String ID percakapan maks 40 karakter
            $table->enum('sender', ['user', 'admin', 'system'])->default('user'); // Tipe Data ENUM pengirim pesan
            $table->string('user_email', 150)->index(); // String email pengirim
            $table->string('user_name', 100); // String nama pengirim
            $table->string('user_avatar', 500)->nullable(); // URL foto profil
            $table->text('text'); // Tipe Data TEXT isi pesan percakapan
            $table->string('timestamp', 50)->nullable(); // String format waktu tampilan ("10:15 WIB")
            $table->dateTime('sent_datetime')->useCurrent(); // Tipe Data DATETIME waktu pesan dikirim
            $table->dateTime('read_at')->nullable(); // Tipe Data DATETIME waktu pesan dibaca (Read Receipt)
            $table->boolean('read_by_admin')->default(false); // Tipe Data BOOLEAN tanda baca admin
            $table->boolean('read_by_user')->default(false); // Tipe Data BOOLEAN tanda baca pelanggan
            $table->string('media_url', 500)->nullable(); // URL lampiran foto/media
            $table->enum('media_type', ['image', 'video', 'document', 'none'])->default('none'); // Tipe Data ENUM jenis media
            $table->timestamps();
        });
    }

    /**
     * Membalikkan migrasi.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
