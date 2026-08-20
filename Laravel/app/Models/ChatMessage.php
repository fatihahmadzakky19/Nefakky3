<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model ChatMessage
 * 
 * Model Eloquent ini merepresentasikan tabel 'chat_messages' di database.
 * Mengelola pesan live chat pelanggan dan admin CS, tipe pengirim (enum),
 * waktu terkirim dan dibaca (datetime), serta lampiran media.
 */
class ChatMessage extends Model
{
    /**
     * Kolom-kolom yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'chat_id',       // String (40)
        'sender',        // ENUM: 'user', 'admin', 'system'
        'user_email',    // String (150)
        'user_name',     // String (100)
        'user_avatar',   // String (500)
        'text',          // TEXT
        'timestamp',     // String (50)
        'sent_datetime', // DATETIME
        'read_at',       // DATETIME
        'read_by_admin', // BOOLEAN
        'read_by_user',  // BOOLEAN
        'media_url',     // String (500)
        'media_type',    // ENUM: 'image', 'video', 'document', 'none'
    ];

    /**
     * Konversi tipe data otomatis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'sent_datetime' => 'datetime',
        'read_at' => 'datetime',
        'read_by_admin' => 'boolean',
        'read_by_user' => 'boolean',
    ];

    /**
     * Relasi Many-to-One ke User.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_email', 'email');
    }
}
