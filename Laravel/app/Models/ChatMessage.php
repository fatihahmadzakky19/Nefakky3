<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model ChatMessage
 * 
 * Model Eloquent ini merepresentasikan tabel 'chat_messages' di database.
 * Bertanggung jawab mengelola pesan percakapan langsung (Live Support)
 * antara pelanggan dan tim customer service admin, lengkap dengan tanda baca (Read Receipt).
 */
class ChatMessage extends Model
{
    /**
     * Kolom-kolom yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',     // ID pengguna terkait percakapan
        'sender_type', // Jenis pengirim pesan: 'customer' atau 'admin'
        'sender_name', // Nama pengirim pesan
        'message',     // Isi teks pesan percakapan
        'is_read',     // Boolean: apakah pesan sudah dibaca oleh penerima
        'attachment',  // URL lampiran file / foto (opsional)
    ];

    /**
     * Konversi tipe data otomatis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_read' => 'boolean',
    ];

    /**
     * Relasi Many-to-One: Pesan chat terhubung dengan satu akun pengguna (User).
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
