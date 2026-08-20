<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menjalankan migrasi pembuatan tabel users, password_reset_tokens, dan sessions
     * dengan tipe data bervariasi: string(length), enum, date, dateTime, timestamp, unsignedInteger, boolean.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // BigInteger Auto-Increment
            $table->string('name', 100); // String dengan batasan panjang 100 karakter
            $table->string('email', 150)->unique(); // String unik panjang 150 karakter
            $table->string('phone', 20)->nullable(); // String nomor telepon max 20 karakter
            $table->enum('role', ['admin', 'customer', 'staff', 'cashier'])->default('customer'); // Tipe Data ENUM
            $table->enum('gender', ['Laki-laki', 'Perempuan', 'Lainnya'])->nullable(); // Tipe Data ENUM
            $table->date('birth_date')->nullable(); // Tipe Data DATE (YYYY-MM-DD)
            $table->dateTime('last_login_at')->nullable(); // Tipe Data DATETIME (YYYY-MM-DD HH:MM:SS)
            $table->string('avatar', 500)->nullable(); // URL gambar profil max 500 karakter
            $table->boolean('is_active')->default(true); // Tipe Data BOOLEAN
            $table->unsignedInteger('login_count')->default(0); // Tipe Data UNSIGNED INTEGER (positif)
            $table->timestamp('email_verified_at')->nullable(); // Tipe Data TIMESTAMP
            $table->string('password', 255); // String hash password 255 karakter
            $table->rememberToken();
            $table->timestamps(); // Menghasilkan created_at & updated_at (TIMESTAMP)
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email', 150)->primary();
            $table->string('token', 255);
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id', 100)->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Membalikkan migrasi (Drop Tabel).
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
